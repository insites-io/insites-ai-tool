# insites-tools — Claude Code Plugin

Claude Code plugin providing Insites Language Server integration for `.liquid` and `.graphql` files.

## Installation

**Step 1** — Add the marketplace registry (one-time, per machine):

```sh
claude plugin marketplace add insites-io/insites-ai-tool
```

**Step 2** — Install the plugin:

```sh
claude plugin install insites-tools@insites-ai-tool
```

## Prerequisites

`insites-cli` v6.0.0-beta.10 or later (includes `insites-cli-lsp` and `insites-cli-mcp`):

```sh
npm install -g /insites-cli@6.0.0-beta.10
```

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

**insites-cli MCP server** — `insites-cli-mcp` is registered as a second MCP server, giving the agent access to deploy, sync, run queries, and manage the Insites instance directly.

**Native LSP** — `.lsp.json` registers `insites-cli-lsp` with Claude Code's built-in LSP client for `.liquid` and `.graphql` files.

## Contents

- [`insites-tools/`](insites-tools/) — Plugin source (installed by `claude plugin install`)
