# insites-tools for Claude Code

Claude Code plugin that integrates the [Insites Language Server](https://github.com/Platform-OS/platformos-language-server) into agent sessions. Provides real-time diagnostics, hover documentation, completions, go-to-definition, and theme graph analysis for `.liquid` and `.graphql` files.

## Prerequisites

Requires `insites-cli` v6.0.0-beta.10 or later, which includes `insites-cli-lsp` and `insites-cli-mcp`:

```sh
npm install -g /insites-cli@6.0.0-beta.10
```

## Installation

```sh
claude plugin marketplace add insites-io/insites-ai-tool
claude plugin install insites-tools@insites-ai-tool
```

## What it does

**Auto-diagnostics** — after every Read, Write, or Edit on a `.liquid` or `.graphql` file, `insites-cli check` runs automatically and results are injected into the agent context. The agent is instructed to fix all errors before proceeding.

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

**insites-cli MCP server** — `insites-cli-mcp` is registered as a second MCP server, giving the agent access to deploy, sync, run queries, and manage the Insites instance directly.

**Native LSP** — `.lsp.json` registers `insites-cli-lsp` with Claude Code's built-in LSP client for `.liquid` and `.graphql` files.

## Plugin structure

```
insites-tools/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata
├── hooks/
│   └── hooks.json           # PostToolUse + SessionStart hooks
├── scripts/
│   ├── post-tool-use.js     # Auto-diagnostics after file operations
│   ├── session-start.js     # System prompt injection
│   └── lsp-mcp-server.js    # MCP server wrapping insites-cli lsp
├── .mcp.json                # MCP server registrations
└── .lsp.json                # Native LSP registration
```
