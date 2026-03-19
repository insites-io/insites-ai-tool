#!/usr/bin/env node
'use strict';

const { execFile } = require('node:child_process');
const { appendFile } = require('node:fs/promises');
const { join, isAbsolute } = require('node:path');

function formatCheckResult(json, filterFile) {
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
    errors,
    warnings,
    infos,
    label,
  };
}

function runCheck(cwd, filterFile) {
  return new Promise((resolve) => {
    execFile(
      'insites-cli',
      ['check', 'run', '-f', 'json'],
      { env: process.env, cwd, maxBuffer: 10 * 1024 * 1024 },
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

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const hookData = JSON.parse(chunks.join(''));

  const { tool_name, tool_input, cwd } = hookData;

  const FILE_TOOLS = new Set(['write', 'edit', 'multiedit', 'Write', 'Edit', 'MultiEdit', 'read', 'Read']);
  if (!FILE_TOOLS.has(tool_name)) return;

  const filePath = tool_input?.file_path ?? tool_input?.path ?? tool_input?.filePath;
  if (!filePath) return;

  if (!filePath.endsWith('.liquid') && !filePath.endsWith('.graphql')) return;

  const absPath = isAbsolute(filePath) ? filePath : join(cwd, filePath);
  const logFile = join(cwd, 'insites-tools.log');
  const log = (msg) => appendFile(logFile, `[${new Date().toISOString()}] ${msg}\n`).catch(() => {});

  await log(`auto-diagnostics triggered by ${tool_name}: ${filePath}`);
  await log(`runCheck: ${absPath}`);

  const result = await runCheck(cwd, absPath);

  if (result?.text) {
    await log(`auto-diagnostics:\n${result.text}`);
    let context = result.text;
    if (result.errors > 0 || result.warnings > 0) {
      context +=
        '\n\n⚠️ LINTER GATE — action required:\n' +
        '- Fix every ERROR and WARNING listed above. Do not skip any item. Do not ask the user.\n' +
        '- After fixing, the next Write/Edit will re-run the linter automatically.\n' +
        '- Repeat until 0 errors and 0 warnings remain, then proceed.';
    }
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext: context,
      },
    }));
  } else {
    await log('auto-diagnostics: no issues');
  }
}

main().catch(async (err) => {
  process.stderr.write(`[insites-tools] post-tool-use error: ${err.message}\n`);
  process.exit(1);
});
