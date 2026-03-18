# Insites Skill for OpenCode and Claude Code

Comprehensive Insites platform reference docs for AI/LLM consumption. Covers Directory structure, Modules, Pages, insites-cli, Liquid, Graphql, etc.

## Install insites skill

### For OpenCode

Local installation (current project only):

```bash
curl -fsSL https://raw.githubusercontent.com/insites-io/insites-ai-tool/master/install.sh | bash
```

Global installation (available in all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/insites-io/insites-ai-tool/master/install.sh | bash -s -- --global
```

### For Claude Code

Local installation (current project only):

```bash
curl -fsSL https://raw.githubusercontent.com/insites-io/insites-ai-tool/master/claude-install.sh | bash
```

Global installation (available in all projects):

```bash
curl -fsSL https://raw.githubusercontent.com/insites-io/insites-ai-tool/master/claude-install.sh | bash -s -- --global
```

## Install Example Skills                                                                                                                                                                   
               
Example skills include: code-review, playwright-cli, pos-auth, pos-crud-generator, pos-unit-tests, project-init, and more.                                                                  
                                                                                                                                                                                              
### For OpenCode                                                                                                                                                                            
                                  
Local installation:

```bash
curl -fsSL https://raw.githubusercontent.com/insites-io/insites-ai-tool/master/install-examples.sh | bash -s -- --opencode
```

Global installation:

```
curl -fsSL https://raw.githubusercontent.com/insites-io/insites-ai-tool/master/install-examples.sh | bash -s -- --opencode --global
```
  
### For Claude Code

Local installation:

```
curl -fsSL https://raw.githubusercontent.com/insites-io/insites-ai-tool/master/install-examples.sh | bash -s -- --claude
```
  
Global installation:

```
curl -fsSL https://raw.githubusercontent.com/insites-io/insites-ai-tool/master/install-examples.sh | bash -s -- --claude --globa
```

## Usage

Once installed, the skill appears in OpenCode's `<available_skills>` list. The agent loads it automatically when working on Insites tasks.

Use the `/insites` command to load the skill and get contextual guidance:

```
/insites initialize new project directory structure
```

### Updating

To update to the latest version:

```
/insites --update-skill
```

## Structure

The installer adds both a skill and a command:

```
# Skill (reference docs)
skills/insites/
├── SKILL.md              # Main manifest + decision trees
└── references/           # Product subdirectories
    └── <product>/
        ├── README.md         # Overview, when to use
        ├── api.md            # Runtime API reference
        ├── configuration.md  # wrangler.toml + bindings
        ├── patterns.md       # Usage patterns
        └── gotchas.md        # Pitfalls, limitations

# Command (slash command)
command/insites.md     # /insites entrypoint
```

## Add Insites documentation MCP

To obtain CF-Access-Client-Id and CF-Access-Client-Secret tokens, please contact support@platformos.com. Once you have them, follow the instructions depending on the tool you use.

### OpenCode

Configure in `opencode.json`

```
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "docs": {
      "type": "remote",
      "url": "https://librarian.platformos.dev",
      "headers": {
        "CF-Access-Client-Id": "***",
        "CF-Access-Client-Secret": "***"
      },
      "enabled": true
    }
  }
}
```

### ClaudeCode

`claude mcp add --transport http insites-librarian https://librarian.platformos.dev --header "CF-Access-Client-Id: ***.access" --header "CF-Access-Client-Secret: ***"`
```

### Decision Trees

- Rendering or UI request
- Data persistence or schema request
- Data retrieval or display request
- Create / Update / Delete request
- Automation or background behavior request
- Security or access control request
- External system or integration request
- Client-side interactivity request
- Shared logic or utilities request
- Deployment or operational request
- Localization or multi-language request

## Resources Covered

Liquid Templating & Filters, Pages & Routing, Layouts, Graphql Queries & Mutations, Partials/Includes, Insites modules, Tags & Control flow, CLI & Deployment, Policies, Integrations, and many more.

## License

MIT - see [LICENSE](LICENSE)
