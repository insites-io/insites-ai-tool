# insites-tools for OpenCode

OpenCode plugin that integrates the [Insites Language Server](https://github.com/Platform-OS/platformos-language-server) into agent sessions. Provides real-time diagnostics, hover documentation, completions, go-to-definition, and theme graph analysis for `.liquid` and `.graphql` files.

## Prerequisites

Requires `insites-cli` v6.0.0-beta.10 or later, which includes `insites-cli-lsp` and `insites-cli-mcp`:

```sh
npm install -g /insites-cli@6.0.0-beta.10
```

## Installation

```sh
curl -fsSL https://raw.githubusercontent.com/insites-io/insites-ai-tool/refs/heads/master/plugins/opencode/insites-tools-plugin/install.sh | bash
```

The installer:
- Verifies `insites-cli`, `insites-cli-lsp`, and `insites-cli-mcp` are available
- Copies `plugin.js` to `~/.config/opencode/plugins/insites-tools.js`
- Adds the `insites-cli` MCP server entry to `~/.config/opencode/opencode.json`

Restart OpenCode after installation.

## What it does

**Auto-diagnostics** — after every Read, Write, or Edit on a `.liquid` or `.graphql` file, `insites-cli check` output is automatically appended to the tool result. The agent is instructed to fix all errors before proceeding.

**Available tools**

| Tool | Description |
|------|-------------|
| `insites_diagnostics` | Run `insites-cli check` on a file and return all errors, warnings, and info |
| `insites_hover` | Get LSP hover documentation for a Liquid tag, filter, or object |
| `insites_completions` | List valid completions inside a Liquid expression |
| `insites_definition` | Jump to the definition of a translation key |
| `insites_references` | Find every file that renders/includes a given partial |
| `insites_dependencies` | Find every file a template renders/includes |
| `insites_dead_code` | Find `.liquid` files that are never referenced |

**insites-cli MCP server** — the installer registers `insites-cli-mcp` in `opencode.json`, giving the agent access to deploy, sync, run queries, and manage the Insites instance directly.

## Manual installation

1. Copy `plugin.js` to `~/.config/opencode/plugins/insites-tools.js`
2. Add to the `mcp` section of `~/.config/opencode/opencode.json`:

```json
"insites-cli": {
  "type": "local",
  "command": ["insites-cli-mcp"]
}
```

3. Restart OpenCode.
