#!/usr/bin/env node
'use strict';

const { spawn, execFile } = require('node:child_process');
const { appendFile, readFile } = require('node:fs/promises');
const { join, isAbsolute } = require('node:path');
const readline = require('node:readline');

const ROOT = process.cwd();
const LOG_FILE = join(ROOT, 'insites-tools.log');

function log(msg) {
  appendFile(LOG_FILE, `[${new Date().toISOString()}] [insites-tools] ${msg}\n`).catch(() => {});
}

class InsitesLSPClient {
  #proc = null;
  #buf = '';
  #reqId = 0;
  #pending = new Map();
  #openDocs = new Map();
  initialized = false;

  start(cmd, args) {
    this.#proc = spawn(cmd, args, { stdio: ['pipe', 'pipe', 'pipe'], env: process.env });

    this.#proc.stdout.on('data', (chunk) => {
      this.#buf += chunk.toString('utf8');
      this.#drain();
    });

    this.#proc.on('error', (err) => {
      for (const cb of this.#pending.values()) cb.reject(err);
      this.#pending.clear();
      this.initialized = false;
    });

    this.#proc.on('exit', () => {
      this.initialized = false;
    });

    return this;
  }

  #drain() {
    while (true) {
      const sep = this.#buf.indexOf('\r\n\r\n');
      if (sep === -1) break;

      const hdr = this.#buf.slice(0, sep);
      const match = hdr.match(/Content-Length:\s*(\d+)/i);
      if (!match) { this.#buf = ''; break; }

      const len = Number(match[1]);
      const bodyStart = sep + 4;
      if (this.#buf.length < bodyStart + len) break;

      const body = this.#buf.slice(bodyStart, bodyStart + len);
      this.#buf = this.#buf.slice(bodyStart + len);

      try { this.#handle(JSON.parse(body)); } catch {}
    }
  }

  #handle(msg) {
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
      `Content-Length: ${Buffer.byteLength(body, 'utf8')}\r\n\r\n${body}`
    );
  }

  #req(method, params, ms = 8_000) {
    return new Promise((resolve, reject) => {
      const id = ++this.#reqId;
      this.#pending.set(id, { resolve, reject });
      this.#send({ jsonrpc: '2.0', id, method, params });
      setTimeout(() => {
        if (this.#pending.delete(id))
          reject(new Error(`Insites LSP timeout: ${method}`));
      }, ms);
    });
  }

  #notify(method, params) {
    this.#send({ jsonrpc: '2.0', method, params });
  }

  async initialize(rootUri) {
    await this.#req('initialize', {
      processId: process.pid,
      clientInfo: { name: 'claude-insites-tools', version: '1.0.0' },
      rootUri,
      capabilities: {
        textDocument: {
          publishDiagnostics: {},
          hover: { contentFormat: ['markdown', 'plaintext'] },
          completion: { completionItem: { snippetSupport: false } },
        },
        workspace: { workspaceFolders: true },
      },
      workspaceFolders: [{ uri: rootUri, name: 'workspace' }],
    }, 15_000);
    this.#notify('initialized', {});
    this.initialized = true;
  }

  syncDoc(uri, text) {
    const langId = uri.endsWith('.graphql') ? 'graphql' : 'liquid';
    const prev = this.#openDocs.get(uri);
    if (prev != null) {
      const ver = prev + 1;
      this.#openDocs.set(uri, ver);
      this.#notify('textDocument/didChange', {
        textDocument: { uri, version: ver },
        contentChanges: [{ text }],
      });
    } else {
      this.#openDocs.set(uri, 1);
      this.#notify('textDocument/didOpen', {
        textDocument: { uri, languageId: langId, version: 1, text },
      });
    }
  }

  hover(uri, line, character) {
    return this.#req('textDocument/hover', {
      textDocument: { uri }, position: { line, character },
    }, 30_000);
  }

  completions(uri, line, character) {
    return this.#req('textDocument/completion', {
      textDocument: { uri }, position: { line, character },
    }, 30_000);
  }

  definition(uri, line, character) {
    return this.#req('textDocument/definition', {
      textDocument: { uri }, position: { line, character },
    }, 30_000);
  }

  references(uri, includeIndirect = false) {
    return this.#req('themeGraph/references', { uri, includeIndirect }, 30_000);
  }

  dependencies(uri, includeIndirect = false) {
    return this.#req('themeGraph/dependencies', { uri, includeIndirect }, 30_000);
  }

  deadCode(uri) {
    return this.#req('themeGraph/deadCode', { uri }, 30_000);
  }

  stop() {
    try {
      this.#notify('shutdown', null);
      this.#notify('exit', null);
    } catch {}
    this.#proc?.kill();
  }
}

function formatCheckResult(json, filterFile = null) {
  if (!json?.files?.length) return null;

  const normSev = (s) => {
    if (s === 'error'   || s === 2) return 'error';
    if (s === 'warning' || s === 1) return 'warning';
    return 'info';
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
      if (sev === 'error') errors++;
      else if (sev === 'warning') warnings++;
      else infos++;
    }
  }

  if (!lines.length) return null;

  const label = filterFile ? filterFile.split('/').pop() : 'project';
  const counts = [
    errors   && `${errors} error(s)`,
    warnings && `${warnings} warning(s)`,
    infos    && `${infos} info(s)`,
  ].filter(Boolean).join(', ');

  return {
    text: `Insites insites-cli check — ${label} (${counts}):\n${lines.join('\n')}`,
    errors, warnings, infos, label,
  };
}

function extractHoverText(result) {
  if (!result?.contents) return null;
  const c = result.contents;
  if (typeof c === 'string') return c;
  if (Array.isArray(c))
    return c.map((x) => (typeof x === 'string' ? x : (x.value ?? ''))).join('\n\n');
  return c.value ?? null;
}

function formatCompletions(result) {
  if (!result) return null;
  const items = Array.isArray(result) ? result : (result.items ?? []);
  if (!items.length) return null;

  const lines = items.slice(0, 80).map((item) => {
    const doc = typeof item.documentation === 'string'
      ? item.documentation
      : (item.documentation?.value ?? '');
    const detail  = item.detail ? ` — ${item.detail}` : '';
    const summary = doc ? ` — ${doc.split('\n')[0].slice(0, 80)}` : '';
    return `  ${item.label}${detail}${summary}`;
  });

  const more = items.length > 80 ? `\n  … and ${items.length - 80} more` : '';
  return `Completions (${items.length}):\n${lines.join('\n')}${more}`;
}

function formatDefinitions(result) {
  if (!result?.length) return null;
  const lines = result.map((loc) => {
    const path  = (loc.targetUri ?? loc.uri ?? '').replace('file://', '');
    const start = loc.targetRange?.start ?? loc.range?.start;
    const pos   = start ? ` line ${start.line + 1}` : '';
    return `  ${path}${pos}`;
  });
  return `Definition(s):\n${lines.join('\n')}`;
}

function formatReferences(refs, label) {
  if (!refs?.length) return `No ${label} found.`;
  const lines = refs.map((ref) => {
    const loc     = ref.source?.exists !== false ? ref.source : ref.target;
    const path    = (loc?.uri ?? '').replace('file://', '');
    const excerpt = loc?.excerpt ? ` — \`${loc.excerpt.trim()}\`` : '';
    return `  ${path}${excerpt}`;
  });
  return `${label} (${refs.length}):\n${lines.join('\n')}`;
}

const TOOLS = [
  {
    name: 'insites_diagnostics',
    description:
      'Run Insites insites-cli check (linter/validator) on a Liquid or GraphQL file ' +
      'and return all errors, warnings, and info diagnostics. ' +
      'Use this after editing .liquid or .graphql files to verify correctness. ' +
      'Diagnostics are also automatically appended after Write/Edit tool calls.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to the .liquid or .graphql file (absolute, or relative to project root)',
        },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'insites_hover',
    description:
      'Get Insites LSP hover documentation for a Liquid tag, filter, or object ' +
      'at a specific position in a .liquid file.\n\n' +
      'IMPORTANT — the cursor position MUST be on an actual Liquid element:\n' +
      '  • Tag name: `render`, `graphql`, `include`, `comment`, `if`, etc.\n' +
      '  • Filter name: `downcase`, `upcase`, `size`, `append`, etc.\n' +
      '  • Insites object: `context`, `current_user`, etc.\n' +
      'Do NOT position on `{`, `%`, `}`, HTML tags, whitespace, or string literals.\n\n' +
      'Count characters from 0 at the start of the line to find the right offset.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the .liquid file (absolute, or relative to project root)' },
        line:      { type: 'integer', minimum: 0, description: 'Zero-based line number' },
        character: { type: 'integer', minimum: 0, description: 'Zero-based character offset — first character of the Liquid element' },
      },
      required: ['file_path', 'line', 'character'],
    },
  },
  {
    name: 'insites_completions',
    description:
      'Get available completions from the Insites LSP at a specific position in a ' +
      '.liquid file — Liquid tags, filters, objects, partial names, translation keys, etc.\n\n' +
      'IMPORTANT — position must be INSIDE a Liquid expression, mid-typing:\n' +
      '  • After `{{ ` (char 3) — object/variable completions\n' +
      '  • After `{% ` — tag completions\n' +
      '  • After `| ` — filter completions\n' +
      '  • After `.` on an object — property completions\n' +
      'Positioning outside `{{ }}` or `{% %}` returns nothing.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the .liquid file' },
        line:      { type: 'integer', minimum: 0, description: 'Zero-based line number' },
        character: { type: 'integer', minimum: 0, description: 'Zero-based character offset — inside a {{ }} or {% %} block' },
      },
      required: ['file_path', 'line', 'character'],
    },
  },
  {
    name: 'insites_definition',
    description:
      'Find the definition of a translation key or schema reference at a specific ' +
      'position in a .liquid file. Returns the file path and line where it is defined.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path: { type: 'string', description: 'Path to the .liquid file' },
        line:      { type: 'integer', minimum: 0, description: 'Zero-based line number' },
        character: { type: 'integer', minimum: 0, description: 'Zero-based character offset' },
      },
      required: ['file_path', 'line', 'character'],
    },
  },
  {
    name: 'insites_references',
    description:
      'Find all files in the Insites project that reference (render/include) a given ' +
      '.liquid file. Useful for understanding what depends on a partial before modifying it.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path:        { type: 'string',  description: 'Path to the .liquid file to find references to' },
        include_indirect: { type: 'boolean', description: 'Include transitive references (default false)' },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'insites_dependencies',
    description:
      'Find all .liquid files that a given file depends on (renders/includes). ' +
      'Useful for understanding the full dependency tree of a template.',
    inputSchema: {
      type: 'object',
      properties: {
        file_path:        { type: 'string',  description: 'Path to the .liquid file' },
        include_indirect: { type: 'boolean', description: 'Include transitive dependencies (default false)' },
      },
      required: ['file_path'],
    },
  },
  {
    name: 'insites_dead_code',
    description:
      'Find all .liquid files in the Insites project that are never referenced ' +
      'by any other template (dead code). Useful for identifying unused partials.',
    inputSchema: { type: 'object', properties: {} },
  },
];

const toUri = (p) => (p.startsWith('file://') ? p : `file://${p}`);
const toAbs = (p) => (isAbsolute(p) ? p : join(ROOT, p));

function runCheck(filterFile = null) {
  log(`runCheck: ${filterFile ?? 'all files'}`);
  return new Promise((resolve) => {
    execFile(
      'insites-cli', ['check', 'run', '-f', 'json'],
      { env: process.env, cwd: ROOT, maxBuffer: 10 * 1024 * 1024 },
      (err, stdout) => {
        try {
          const json = JSON.parse(stdout);
          resolve(formatCheckResult(json, filterFile));
        } catch (e) {
          const msg = err?.message ?? e.message;
          resolve({ text: `insites-cli check failed: ${msg}`, errors: 0, warnings: 0, infos: 0, label: '' });
        }
      }
    );
  });
}

async function syncToLSP(lsp, absPath) {
  try {
    const text = await readFile(absPath, 'utf8');
    lsp.syncDoc(toUri(absPath), text);
  } catch (e) {
    log(`syncToLSP failed for ${absPath}: ${e.message}`);
  }
}

async function callTool(lsp, ready, name, args) {
  switch (name) {
    case 'insites_diagnostics': {
      const absPath = toAbs(args.file_path);
      if (!absPath.endsWith('.liquid') && !absPath.endsWith('.graphql'))
        return `insites_diagnostics only supports .liquid and .graphql files. Got: ${args.file_path}`;
      log(`tool: diagnostics file=${args.file_path}`);
      const result = await runCheck(absPath);
      return result?.text ?? `No issues found in ${args.file_path} (insites-cli check passed)`;
    }

    case 'insites_hover': {
      log(`tool: hover file=${args.file_path} line=${args.line} char=${args.character}`);
      await ready;
      if (!lsp.initialized) return 'Insites LSP is not ready yet. Try again in a moment.';
      const absPath = toAbs(args.file_path);
      await syncToLSP(lsp, absPath);
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const result = await lsp.hover(toUri(absPath), args.line, args.character);
        const text = extractHoverText(result);
        log(`hover result: ${text ? `${text.length} chars` : 'no result'}`);
        return text ?? 'No hover information at this position.';
      } catch (e) {
        log(`hover error: ${e.message}`);
        return `Hover request failed: ${e.message}`;
      }
    }

    case 'insites_completions': {
      log(`tool: completions file=${args.file_path} line=${args.line} char=${args.character}`);
      await ready;
      if (!lsp.initialized) return 'Insites LSP is not ready yet. Try again in a moment.';
      const absPath = toAbs(args.file_path);
      await syncToLSP(lsp, absPath);
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const result = await lsp.completions(toUri(absPath), args.line, args.character);
        const items = Array.isArray(result) ? result : (result?.items ?? []);
        log(`completions result: ${items.length} item(s)`);
        return formatCompletions(result) ?? 'No completions available at this position.';
      } catch (e) {
        log(`completions error: ${e.message}`);
        return `Completions request failed: ${e.message}`;
      }
    }

    case 'insites_definition': {
      log(`tool: definition file=${args.file_path} line=${args.line} char=${args.character}`);
      await ready;
      if (!lsp.initialized) return 'Insites LSP is not ready yet. Try again in a moment.';
      const absPath = toAbs(args.file_path);
      await syncToLSP(lsp, absPath);
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const result = await lsp.definition(toUri(absPath), args.line, args.character);
        log(`definition result: ${result?.length ?? 0} location(s)`);
        return formatDefinitions(result) ?? 'No definition found at this position.';
      } catch (e) {
        log(`definition error: ${e.message}`);
        return `Definition request failed: ${e.message}`;
      }
    }

    case 'insites_references': {
      log(`tool: references file=${args.file_path} indirect=${args.include_indirect ?? false}`);
      await ready;
      if (!lsp.initialized) return 'Insites LSP is not ready yet. Try again in a moment.';
      const absPath = toAbs(args.file_path);
      await syncToLSP(lsp, absPath);
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const result = await lsp.references(toUri(absPath), args.include_indirect ?? false);
        log(`references result: ${result?.length ?? 0} reference(s)`);
        return formatReferences(result, 'References');
      } catch (e) {
        log(`references error: ${e.message}`);
        return `References request failed: ${e.message}`;
      }
    }

    case 'insites_dependencies': {
      log(`tool: dependencies file=${args.file_path} indirect=${args.include_indirect ?? false}`);
      await ready;
      if (!lsp.initialized) return 'Insites LSP is not ready yet. Try again in a moment.';
      const absPath = toAbs(args.file_path);
      await syncToLSP(lsp, absPath);
      await new Promise((r) => setTimeout(r, 1500));
      try {
        const result = await lsp.dependencies(toUri(absPath), args.include_indirect ?? false);
        log(`dependencies result: ${result?.length ?? 0} dependency(ies)`);
        return formatReferences(result, 'Dependencies');
      } catch (e) {
        log(`dependencies error: ${e.message}`);
        return `Dependencies request failed: ${e.message}`;
      }
    }

    case 'insites_dead_code': {
      log('tool: dead_code');
      await ready;
      if (!lsp.initialized) return 'Insites LSP is not ready yet. Try again in a moment.';
      try {
        const result = await lsp.deadCode(toUri(ROOT));
        log(`dead_code result: ${result?.length ?? 0} unreferenced file(s)`);
        if (!result?.length) return 'No dead code found — all files are referenced.';
        const paths = result.map((uri) => `  ${uri.replace('file://', '')}`);
        return `Unreferenced files (${result.length}):\n${paths.join('\n')}`;
      } catch (e) {
        log(`dead_code error: ${e.message}`);
        return `Dead code request failed: ${e.message}`;
      }
    }

    default:
      return `Unknown tool: ${name}`;
  }
}

function send(obj) {
  process.stdout.write(JSON.stringify(obj) + '\n');
}

function respond(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function respondError(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

async function main() {
  log(`lsp-mcp-server started: ROOT=${ROOT}`);

  const lsp = new InsitesLSPClient().start('insites-cli', ['lsp']);
  const rootUri = toUri(ROOT);

  const ready = lsp
    .initialize(rootUri)
    .then(() => log('LSP initialized OK'))
    .catch((e) => log(`LSP init failed: ${e.message}`));

  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let msg;
    try { msg = JSON.parse(trimmed); } catch { continue; }

    const { id, method, params } = msg;

    if (id == null) continue;

    try {
      switch (method) {
        case 'initialize':
          respond(id, {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'insites-tools', version: '1.0.0' },
          });
          break;

        case 'tools/list':
          respond(id, { tools: TOOLS });
          break;

        case 'tools/call': {
          const { name, arguments: args = {} } = params;
          const text = await callTool(lsp, ready, name, args);
          respond(id, { content: [{ type: 'text', text }] });
          break;
        }

        case 'ping':
          respond(id, {});
          break;

        default:
          respondError(id, -32601, `Method not found: ${method}`);
      }
    } catch (e) {
      log(`error handling ${method}: ${e.message}`);
      respondError(id, -32603, e.message);
    }
  }

  lsp.stop();
}

main().catch((err) => {
  process.stderr.write(`[insites-tools] fatal: ${err.message}\n`);
  process.exit(1);
});
