# insites-cli & platformos-check

Command-line tools for Insites development.

## insites-cli Commands

### Deployment
```bash
insites-cli deploy dev                          # Deploy to environment
insites-cli deploy production                   # Deploy to production
```

### Development
```bash
insites-cli sync dev                            # Watch and sync file changes
insites-cli gui serve dev                       # Start GraphQL GUI explorer
```

### Debugging
```bash
insites-cli logs dev                            # Watch real-time logs
insites-cli logs dev --filter type:error        # Filter error logs
insites-cli exec liquid dev '<code>'            # Execute Liquid snippet
insites-cli exec graphql dev '<query>'          # Execute GraphQL query
```

### Modules
```bash
insites-cli modules install <name>              # Install a module
insites-cli modules download <name>             # Download module source
insites-cli modules list dev                    # List installed modules
```

### Constants
```bash
insites-cli constants set --name KEY --value "val" dev    # Set constant
insites-cli constants list dev                             # List constants
```

### Migrations
```bash
insites-cli migrations generate dev <name>      # Create migration file
insites-cli migrations run TIMESTAMP dev        # Run specific migration
insites-cli migrations list dev                 # List migration states
```

### Data
```bash
insites-cli data export dev --path=data.json    # Export data
insites-cli data import dev --path=data.json    # Import data
insites-cli data clean dev                      # Clean all data (DANGEROUS)
```

### Testing
```bash
insites-cli test run staging                    # Run all tests
```

## platformos-check (Linter)

**Must run after EVERY file change.**

```bash
platformos-check                            # Lint all files
platformos-check app/views/pages/           # Lint specific directory
```

### What it checks

- Liquid syntax errors
- Invalid tag/filter usage
- Missing translations
- Broken partial references
- Incorrect file naming
- Deprecated patterns

### Must pass with 0 errors before deployment.

## Environment Configuration

### .pos file
```yaml
dev:
  url: https://your-instance.staging.oregon.platform-os.com
production:
  url: https://your-instance.platform-os.com
```

## Debugging Workflow

```bash
# Terminal 1: Watch logs
insites-cli logs dev

# Terminal 2: Make changes and observe
insites-cli sync dev

# Terminal 3: Test endpoints
curl -i https://your-instance.staging.oregon.platform-os.com/endpoint
```

Check logs when you get 5xx responses.
