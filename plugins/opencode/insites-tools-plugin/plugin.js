import { tool } from "@opencode-ai/plugin";
import { spawn, execFile } from "node:child_process";
import { appendFile, readFile, realpath } from "node:fs/promises";

class InsitesLSPClient {
  #proc = null;
  #buf = "";
  #reqId = 0;
  #pending = new Map();
  #diagnostics = new Map();
  #openDocs = new Map();
  initialized = false;

  start(cmd = "insites-cli", args = ["lsp"]) {
    this.#proc = spawn(cmd, args, { stdio: ["pipe", "pipe", "pipe"], env: process.env });

    this.#proc.stdout.on("data", (chunk) => {
      this.#buf += chunk.toString("utf8");
      this.#drain();
    });

    this.#proc.on("error", (err) => {
      for (const cb of this.#pending.values()) cb.reject(err);
      this.#pending.clear();
      this.initialized = false;
    });

    this.#proc.on("exit", () => {
      this.initialized = false;
    });

    return this;
  }

  #drain() {
    while (true) {
      const sep = this.#buf.indexOf("\r\n\r\n");
      if (sep === -1) break;

      const hdr = this.#buf.slice(0, sep);
      const match = hdr.match(/Content-Length:\s*(\d+)/i);
      if (!match) { this.#buf = ""; break; }

      const len = Number(match[1]);
      const bodyStart = sep + 4;
      if (this.#buf.length < bodyStart + len) break;

      const body = this.#buf.slice(bodyStart, bodyStart + len);
      this.#buf = this.#buf.slice(bodyStart + len);

      try { this.#handle(JSON.parse(body)); } catch {}
    }
  }

  #handle(msg) {
    if (msg.method === "textDocument/publishDiagnostics") {
      this.#diagnostics.set(msg.params.uri, msg.params.diagnostics ?? []);
      return;
    }
    if (msg.id != null) {
      const cb = this.#pending.get(msg.id);
      if (cb) {
        this.#pending.delete(msg.id);
        msg.error ? cb.reject(new Error(msg.error.message)) : cb.resolve(msg.result);
      }
    }
  }

  #send(msg) {
    if (!this.#proc?.stdin?.writable) return;
    const body = JSON.stringify(msg);
    this.#proc.stdin.write(
      `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`
    );
  }

  #req(method, params, ms = 8_000) {
    return new Promise((resolve, reject) => {
      const id = ++this.#reqId;
      this.#pending.set(id, { resolve, reject });
      this.#send({ jsonrpc: "2.0", id, method, params });
      setTimeout(() => {
        if (this.#pending.delete(id))
          reject(new Error(`Insites LSP timeout: ${method}`));
      }, ms);
    });
  }

  #notify(method, params) {
    this.#send({ jsonrpc: "2.0", method, params });
  }

  async initialize(rootUri) {
    await this.#req(
      "initialize",
      {
        processId: process.pid,
        clientInfo: { name: "opencode-insites-tools", version: "1.0.0" },
        rootUri,
        capabilities: {
          textDocument: {
            publishDiagnostics: {},
            hover: { contentFormat: ["markdown", "plaintext"] },
            completion: { completionItem: { snippetSupport: false } },
          },
          workspace: { workspaceFolders: true },
        },
        workspaceFolders: [{ uri: rootUri, name: "workspace" }],
      },
      15_000
    );
    this.#notify("initialized", {});
    this.initialized = true;
  }

  syncDoc(uri, text) {
    const langId = uri.endsWith(".graphql") ? "graphql" : "liquid";
    const prev = this.#openDocs.get(uri);
    if (prev != null) {
      const ver = prev + 1;
      this.#openDocs.set(uri, ver);
      this.#notify("textDocument/didChange", {
        textDocument: { uri, version: ver },
        contentChanges: [{ text }],
      });
    } else {
      this.#openDocs.set(uri, 1);
      this.#notify("textDocument/didOpen", {
        textDocument: { uri, languageId: langId, version: 1, text },
      });
    }
  }

  diags(uri) {
    return this.#diagnostics.get(uri) ?? [];
  }

  hover(uri, line, character) {
    return this.#req("textDocument/hover", {
      textDocument: { uri },
      position: { line, character },
    }, 30_000);
  }

  completions(uri, line, character) {
    return this.#req("textDocument/completion", {
      textDocument: { uri },
      position: { line, character },
    }, 30_000);
  }

  definition(uri, line, character) {
    return this.#req("textDocument/definition", {
      textDocument: { uri },
      position: { line, character },
    }, 30_000);
  }

  references(uri, includeIndirect = false) {
    return this.#req("themeGraph/references", { uri, includeIndirect }, 30_000);
  }

  dependencies(uri, includeIndirect = false) {
    return this.#req("themeGraph/dependencies", { uri, includeIndirect }, 30_000);
  }

  deadCode(uri) {
    return this.#req("themeGraph/deadCode", { uri }, 30_000);
  }

  stop() {
    try {
      this.#notify("shutdown", null);
      this.#notify("exit", null);
    } catch {}
    this.#proc?.kill();
  }
}

const isWatched = (p) => p.endsWith(".liquid") || p.endsWith(".graphql");

const toUri = (p) => (p.startsWith("file://") ? p : `file://${p}`);

const toAbs = (dir, p) => (p.startsWith("/") ? p : `${dir}/${p}`);

function formatCheckResult(json, filterFile = null) {
  if (!json?.files?.length) return null;

  const normSev = (s) => {
    if (s === "error"   || s === 2) return "error";
    if (s === "warning" || s === 1) return "warning";
    return "info";
  };
  const sevLabel = (s) => normSev(s).toUpperCase();

  const lines = [];
  let errors = 0, warnings = 0, infos = 0;

  for (const file of json.files) {
    if (filterFile && !filterFile.endsWith(file.path) && file.path !== filterFile) continue;

    for (const o of file.offenses ?? []) {
      const row = o.start_row ?? o.start?.line ?? 0;
      const col = o.start_column ?? o.start?.character ?? 0;
      const loc = `${row + 1}:${col + 1}`;
      const sev = normSev(o.severity);
      lines.push(`  ${sevLabel(o.severity)} ${loc} [${o.check}]: ${o.message}`);
      if (sev === "error") errors++;
      else if (sev === "warning") warnings++;
      else infos++;
    }
  }

  if (!lines.length) return null;

  const label = filterFile ? filterFile.split("/").pop() : "project";
  const counts = [
    errors && `${errors} error(s)`,
    warnings && `${warnings} warning(s)`,
    infos && `${infos} info(s)`,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    text: `Insites insites-cli check — ${label} (${counts}):\n${lines.join("\n")}`,
    errors,
    warnings,
    infos,
    label,
  };
}

function formatCompletions(result) {
  if (!result) return null;
  const items = Array.isArray(result) ? result : (result.items ?? []);
  if (!items.length) return null;

  const lines = items.slice(0, 80).map((item) => {
    const doc =
      typeof item.documentation === "string"
        ? item.documentation
        : (item.documentation?.value ?? "");
    const detail = item.detail ? ` — ${item.detail}` : "";
    const summary = doc ? ` — ${doc.split("\n")[0].slice(0, 80)}` : "";
    return `  ${item.label}${detail}${summary}`;
  });

  const more = items.length > 80 ? `\n  … and ${items.length - 80} more` : "";
  return `Completions (${items.length}):\n${lines.join("\n")}${more}`;
}

function formatDefinitions(result) {
  if (!result?.length) return null;
  const lines = result.map((loc) => {
    const path = (loc.targetUri ?? loc.uri ?? "").replace("file://", "");
    const start = loc.targetRange?.start ?? loc.range?.start;
    const pos = start ? ` line ${start.line + 1}` : "";
    return `  ${path}${pos}`;
  });
  return `Definition(s):\n${lines.join("\n")}`;
}

function formatReferences(refs, label) {
  if (!refs?.length) return `No ${label} found.`;
  const lines = refs.map((ref) => {
    const loc = ref.source?.exists !== false ? ref.source : ref.target;
    const path = (loc?.uri ?? "").replace("file://", "");
    const excerpt = loc?.excerpt ? ` — \`${loc.excerpt.trim()}\`` : "";
    return `  ${path}${excerpt}`;
  });
  return `${label} (${refs.length}):\n${lines.join("\n")}`;
}

function extractHoverText(result) {
  if (!result?.contents) return null;
  const c = result.contents;
  if (typeof c === "string") return c;
  if (Array.isArray(c))
    return c.map((x) => (typeof x === "string" ? x : (x.value ?? ""))).join("\n\n");
  return c.value ?? null;
}

export const InsitesLSPPlugin = async ({ directory, $, client }) => {
  const [posCliBin, nodeBin] = await Promise.all([
    $`which insites-cli`.quiet().nothrow().text().then((p) => p.trim()).catch(() => ""),
    $`which node`.quiet().nothrow().text().then((p) => p.trim()).catch(() => ""),
  ]);

  let lspCmd = "insites-cli";
  let lspArgs = ["lsp"];
  let checkCmd = "insites-cli";
  let checkArgs = ["check", "run", "-f", "json"];

  if (posCliBin && nodeBin) {
    try {
      const realPosCliPath = await realpath(posCliBin);
      lspCmd = nodeBin;
      lspArgs = [realPosCliPath, "lsp"];
      checkCmd = nodeBin;
      checkArgs = [realPosCliPath, "check", "run", "-f", "json"];
    } catch {}
  }

  const logFile = `${directory}/insites-tools.log`;
  function log(msg) {
    const ts = new Date().toISOString();
    appendFile(logFile, `[${ts}] ${msg}\n`).catch(() => {});
  }

  log(`plugin init: directory=${directory} lspCmd=${lspCmd} lspArgs=${lspArgs.join(" ")}`);

  const lsp = new InsitesLSPClient().start(lspCmd, lspArgs);
  const rootUri = toUri(directory);

  const ready = lsp
    .initialize(rootUri)
    .then(() => log("LSP initialized OK"))
    .catch((e) => {
      log(`LSP init failed: ${e.message}`);
      console.error("[Insites] LSP init failed:", e.message);
    });

  function runCheck(filterFile = null) {
    log(`runCheck: ${filterFile ?? "all files"}`);
    return new Promise((resolve) => {
      execFile(
        checkCmd,
        checkArgs,
        { env: process.env, cwd: directory, maxBuffer: 10 * 1024 * 1024 },
        (err, stdout) => {
          try {
            const json = JSON.parse(stdout);
            const result = formatCheckResult(json, filterFile);
            if (result) {
              log(`check result: ${result.errors} error(s), ${result.warnings} warning(s), ${result.infos} info(s) — ${result.label}`);
            } else {
              log(`check result: no issues — ${filterFile ?? "all files"}`);
            }
            resolve(result);
          } catch (e) {
            const msg = err?.message ?? e.message;
            log(`check failed: ${msg}`);
            resolve({ text: `insites-cli check failed: ${msg}`, errors: 0, warnings: 0, infos: 0, label: "" });
          }
        }
      );
    });
  }

  async function syncToLSP(absPath) {
    await ready;
    if (!lsp.initialized) return;
    try {
      const text = await readFile(absPath, "utf8");
      lsp.syncDoc(toUri(absPath), text);
    } catch (e) {
      console.error(`[Insites] syncToLSP failed for ${absPath}: ${e.message}`);
    }
  }

  return {
    tool: {
      insites_diagnostics: tool({
        description:
          "Diagnostics are automatically appended after Read/Write/Edit tool calls. " +
          "You can also run Insites insites-cli check (linter/validator) on a Liquid or GraphQL file on demand " +
          "and return all errors, warnings, and info diagnostics.",
        args: {
          file_path: tool.schema
            .string()
            .describe(
              "Path to the .liquid or .graphql file (absolute, or relative to the project root)"
            ),
        },
        async execute({ file_path }, ctx) {
          log(`tool: diagnostics file=${file_path}`);
          const absPath = toAbs(ctx.directory, file_path);

          if (!isWatched(absPath)) {
            return `insites_diagnostics only supports .liquid and .graphql files. Got: ${file_path}`;
          }

          const result = await runCheck(absPath);
          return result?.text ?? `No issues found in ${file_path} (insites-cli check passed)`;
        },
      }),

      insites_hover: tool({
        description:
          "Get Insites LSP hover documentation for a Liquid tag, filter, or object " +
          "at a specific position in a .liquid file.\n\n" +
          "IMPORTANT — the cursor position MUST be on an actual Liquid element:\n" +
          "  • Tag name: `render`, `graphql`, `include`, `comment`, `if`, etc.\n" +
          "  • Filter name: `downcase`, `upcase`, `size`, `append`, etc.\n" +
          "  • Insites object: `context`, `current_user`, etc.\n" +
          "Do NOT position on `{`, `%`, `}`, HTML tags, whitespace, or string literals — " +
          "those return no hover data.\n\n" +
          "How to find the right character offset: count from 0 at the start of the line. " +
          "Example: for `{{ context.name | downcase }}`, `context` starts at character 3 " +
          "(after `{{ `), `downcase` starts at character 17 (after `| `).",
        args: {
          file_path: tool.schema
            .string()
            .describe(
              "Path to the .liquid file (absolute, or relative to the project root)"
            ),
          line: tool.schema
            .number()
            .int()
            .nonnegative()
            .describe("Zero-based line number"),
          character: tool.schema
            .number()
            .int()
            .nonnegative()
            .describe("Zero-based character offset — must point to the first character of a Liquid tag name, filter name, or object name"),
        },
        async execute({ file_path, line, character }, ctx) {
          log(`tool: hover file=${file_path} line=${line} char=${character}`);
          await ready;
          if (!lsp.initialized) return "Insites LSP is not ready yet.";

          const absPath = toAbs(ctx.directory, file_path);
          await syncToLSP(absPath);

          await new Promise((r) => setTimeout(r, 1500));

          try {
            const result = await lsp.hover(toUri(absPath), line, character);
            const text = extractHoverText(result);
            log(`hover result: ${text ? `${text.length} chars` : "no result"}`);
            return text ?? "No hover information at this position.";
          } catch (e) {
            log(`hover error: ${e.message}`);
            return `Hover request failed: ${e.message}`;
          }
        },
      }),

      insites_completions: tool({
        description:
          "Get available completions from the Insites LSP at a specific position in a " +
          ".liquid file — Liquid tags, filters, objects, partial names, translation keys, " +
          "GraphQL variables, HTML attributes, etc.\n\n" +
          "IMPORTANT — position must be INSIDE a Liquid expression or tag, right where " +
          "you would be mid-typing:\n" +
          "  • After `{{ ` to get object/variable completions (e.g. line X, char 3)\n" +
          "  • After `{%  ` (inside a tag body) to get tag completions\n" +
          "  • After a `|` filter operator to get filter completions\n" +
          "  • After a `.` on an object to get property completions\n" +
          "Positioning on whitespace OUTSIDE of `{{ }}` or `{% %}` will return nothing.",
        args: {
          file_path: tool.schema.string().describe("Path to the .liquid file"),
          line: tool.schema.number().int().nonnegative().describe("Zero-based line number"),
          character: tool.schema.number().int().nonnegative().describe("Zero-based character offset — should be inside a {{ }} or {% %} Liquid block"),
        },
        async execute({ file_path, line, character }, ctx) {
          log(`tool: completions file=${file_path} line=${line} char=${character}`);
          await ready;
          if (!lsp.initialized) return "Insites LSP is not ready yet.";
          const absPath = toAbs(ctx.directory, file_path);
          await syncToLSP(absPath);
          await new Promise((r) => setTimeout(r, 1500));
          try {
            const result = await lsp.completions(toUri(absPath), line, character);
            const items = Array.isArray(result) ? result : (result?.items ?? []);
            log(`completions result: ${items.length} item(s)`);
            return formatCompletions(result) ?? "No completions available at this position.";
          } catch (e) {
            log(`completions error: ${e.message}`);
            return `Completions request failed: ${e.message}`;
          }
        },
      }),

      insites_definition: tool({
        description:
          "Find the definition of a translation key or schema translation at a specific " +
          "position in a .liquid file. Returns the file path and line where the key is defined.",
        args: {
          file_path: tool.schema.string().describe("Path to the .liquid file"),
          line: tool.schema.number().int().nonnegative().describe("Zero-based line number"),
          character: tool.schema.number().int().nonnegative().describe("Zero-based character offset"),
        },
        async execute({ file_path, line, character }, ctx) {
          log(`tool: definition file=${file_path} line=${line} char=${character}`);
          await ready;
          if (!lsp.initialized) return "Insites LSP is not ready yet.";
          const absPath = toAbs(ctx.directory, file_path);
          await syncToLSP(absPath);
          await new Promise((r) => setTimeout(r, 1500));
          try {
            const result = await lsp.definition(toUri(absPath), line, character);
            log(`definition result: ${result?.length ?? 0} location(s)`);
            return formatDefinitions(result) ?? "No definition found at this position.";
          } catch (e) {
            log(`definition error: ${e.message}`);
            return `Definition request failed: ${e.message}`;
          }
        },
      }),

      insites_references: tool({
        description:
          "Find all files in the Insites project that reference (render/include) a given " +
          ".liquid file. Useful for understanding what depends on a partial before modifying it.",
        args: {
          file_path: tool.schema.string().describe("Path to the .liquid file to find references to"),
          include_indirect: tool.schema.boolean().optional().describe(
            "Include transitive references (default false)"
          ),
        },
        async execute({ file_path, include_indirect = false }, ctx) {
          log(`tool: references file=${file_path} indirect=${include_indirect}`);
          await ready;
          if (!lsp.initialized) return "Insites LSP is not ready yet.";
          const absPath = toAbs(ctx.directory, file_path);
          await syncToLSP(absPath);
          await new Promise((r) => setTimeout(r, 1500));
          try {
            const result = await lsp.references(toUri(absPath), include_indirect);
            log(`references result: ${result?.length ?? 0} reference(s)`);
            return formatReferences(result, "References");
          } catch (e) {
            log(`references error: ${e.message}`);
            return `References request failed: ${e.message}`;
          }
        },
      }),

      insites_dependencies: tool({
        description:
          "Find all .liquid files that a given file depends on (renders/includes). " +
          "Useful for understanding the full dependency tree of a template.",
        args: {
          file_path: tool.schema.string().describe("Path to the .liquid file"),
          include_indirect: tool.schema.boolean().optional().describe(
            "Include transitive dependencies (default false)"
          ),
        },
        async execute({ file_path, include_indirect = false }, ctx) {
          log(`tool: dependencies file=${file_path} indirect=${include_indirect}`);
          await ready;
          if (!lsp.initialized) return "Insites LSP is not ready yet.";
          const absPath = toAbs(ctx.directory, file_path);
          await syncToLSP(absPath);
          await new Promise((r) => setTimeout(r, 1500));
          try {
            const result = await lsp.dependencies(toUri(absPath), include_indirect);
            log(`dependencies result: ${result?.length ?? 0} dependency(ies)`);
            return formatReferences(result, "Dependencies");
          } catch (e) {
            log(`dependencies error: ${e.message}`);
            return `Dependencies request failed: ${e.message}`;
          }
        },
      }),

      insites_dead_code: tool({
        description:
          "Find all .liquid files in the Insites project that are never referenced " +
          "by any other template (dead code). Useful for identifying unused partials to clean up.",
        args: {},
        async execute(_args, ctx) {
          log("tool: dead_code");
          await ready;
          if (!lsp.initialized) return "Insites LSP is not ready yet.";
          const anyUri = toUri(ctx.directory);
          try {
            const result = await lsp.deadCode(anyUri);
            log(`dead_code result: ${result?.length ?? 0} unreferenced file(s)`);
            if (!result?.length) return "No dead code found — all files are referenced.";
            const paths = result.map((uri) => `  ${uri.replace("file://", "")}`);
            return `Unreferenced files (${result.length}):\n${paths.join("\n")}`;
          } catch (e) {
            log(`dead_code error: ${e.message}`);
            return `Dead code request failed: ${e.message}`;
          }
        },
      }),
    },

    "tool.execute.after": async (input, output) => {
      const FILE_TOOLS = new Set([
        "write", "edit", "multiedit", "patch",
        "Write", "Edit", "MultiEdit",
        "read", "Read",
      ]);

      if (!FILE_TOOLS.has(input.tool)) return;

      const filePath =
        input.args?.file_path ??
        input.args?.path ??
        input.args?.filePath ??
        input.args?.filename;

      if (!filePath) return;

      const absPath = toAbs(directory, filePath);
      if (!isWatched(absPath)) return;

      log(`auto-diagnostics triggered by ${input.tool}: ${filePath}`);
      const diagnostics = await runCheck(absPath).catch(() => null);
      if (diagnostics?.text) {
        log(`auto-diagnostics:\n${diagnostics.text}`);
        output.output = `${output.output}\n\n---\n${diagnostics.text}`;

        if (diagnostics.errors > 0 || diagnostics.warnings > 0) {
          const hasErrors = diagnostics.errors > 0;
          const parts = [
            diagnostics.errors && `${diagnostics.errors} error(s)`,
            diagnostics.warnings && `${diagnostics.warnings} warning(s)`,
          ].filter(Boolean).join(", ");

          client.tui.showToast({
            body: {
              title: `Insites — ${diagnostics.label}`,
              message: parts,
              variant: hasErrors ? "error" : "warning",
              duration: 8000,
            },
          }).catch(() => {});
        }
      } else {
        log(`auto-diagnostics: no issues`);
      }
    },

    "experimental.chat.system.transform": async (_input, output) => {
      output.system.push(
        "## Insites LSP Integration\n\n" +
        "You have access to the Insites Language Server for `.liquid` and `.graphql` files.\n\n" +
        "### Available tools\n\n" +
        "| Tool | When to use |\n" +
        "|------|-------------|\n" +
        "| `insites_diagnostics` | After editing a file — lists all errors, warnings, and info from `insites-cli check` |\n" +
        "| `insites_hover` | Look up docs for a Liquid tag, filter, or object at a specific position |\n" +
        "| `insites_completions` | List valid completions inside a Liquid expression at a specific position |\n" +
        "| `insites_definition` | Jump to the definition of a translation key |\n" +
        "| `insites_references` | Find every file that `render`s a given partial |\n" +
        "| `insites_dependencies` | Find every file a template renders/includes |\n" +
        "| `insites_dead_code` | Find `.liquid` files that are never referenced |\n\n" +
        "### Auto-diagnostics: Post-Read/Edit Linter Gate\n\n" +
        "**Triggered automatically after every Read, Write or Edit on a `.liquid` or `.graphql` file**\n\n" +
        "**Step 1 — STOP: Read linter output**\n" +
        "Any ERROR or WARNING items present in the linter check results?\n" +
        "- PASS (0 errors, 0 warnings): CONTINUE to Step 3\n" +
        "- FAIL (errors or warnings present): CONTINUE to Step 2\n\n" +
        "**Step 2 — Fix all errors and warnings - NO COMPLIANCE**\n" +
        "Fix every ERROR and WARNING in the reported output. Do not ask the user. Do not skip any item.\n" +
        "- After fixing, the next Write or Edit will re-run the linter automatically.\n" +
        "- GOTO Step 1.\n\n" +
        "**Step 3 — Gate passed**\n" +
        "STOP. Proceed to the next task.\n\n" +
        "INFO items are advisory — use judgement, but do not block on them.\n\n" +
        "INVALID conditions:\n" +
        "- \"I'll fix the errors after finishing the feature\" → NOT A VALID CONDITION\n" +
        "- \"This warning is not relevant to my change\" → NOT A VALID CONDITION\n" +
        "- \"The error is a known issue\" → NOT A VALID CONDITION\n" +
        "- \"I'll ask the user whether to fix this\" → NOT A VALID CONDITION\n\n" +
        "### Positioning rules for `insites_hover` and `insites_completions`\n\n" +
        "Both tools use **0-based** `line` and `character` coordinates (same as LSP / VS Code).\n\n" +
        "**`insites_hover`** — position must be on the first character of a Liquid element:\n" +
        "- ✅ Tag name: `render`, `graphql`, `include`, `if`, `for`, `comment`, …\n" +
        "- ✅ Filter name after `|`: `downcase`, `upcase`, `size`, `append`, …\n" +
        "- ✅ Object or property name: `context`, `current_user`, …\n" +
        "- ❌ Delimiters `{`, `%`, `}`, spaces, HTML tags, string literals → returns nothing\n\n" +
        "Example — given line: `{{ context.current_user.name | downcase }}`\n" +
        "- `context` starts at char 3 → `insites_hover(line, 3)` ✅\n" +
        "- `downcase` starts at char 32 → `insites_hover(line, 32)` ✅\n" +
        "- char 0 is `{` → `insites_hover(line, 0)` returns nothing ❌\n\n" +
        "**`insites_completions`** — position must be inside a Liquid expression, at the point " +
        "where you would be mid-typing:\n" +
        "- ✅ Right after `{{ ` (char 3) — lists variables and objects\n" +
        "- ✅ Right after `| ` inside a filter chain — lists filters\n" +
        "- ✅ Right after `.` on an object — lists properties\n" +
        "- ✅ Inside `{% … %}` after the opening space — lists tag names\n" +
        "- ❌ Outside any `{{ }}` or `{% %}` block → returns nothing\n\n" +
        "**How to find the right character offset:** read the file, identify the target token, " +
        "then count characters from 0 at the start of that line. For a line like\n" +
        "`<p>{% render 'hero' %}</p>`, the word `render` starts at character 6."
      );
    },

    event: async ({ event }) => {
      if (event.type === "session.deleted") {
        log("session deleted — stopping LSP");
        lsp.stop();
      }
    },
  };
};
