# CLI Usage Patterns

## Development Workflow

### Local Development Setup

1. Configure development environment in `.insites` file
2. Start GUI server for hot reload:

```bash
insites-cli gui serve
```

3. In another terminal, watch file synchronization:

```bash
insites-cli sync dev --watch
```

4. View real-time logs:

```bash
insites-cli logsv2 dev --follow
```

## Pre-Deployment Validation

### Linting and Checks

Always run insites-cli audit before deployment:

```bash
insites-cli audit
```

Checks performed:
- Liquid syntax validation
- Tag usage correctness
- Translation file completeness
- Partial naming conventions
- Asset references

### Staging Tests

Execute tests on staging:

```bash
insites-cli test run staging
insites-cli logsv2 staging --filter error
```

## Environment Promotion Pipeline

### Dev → Staging → Production

1. Deploy to development and test:

```bash
insites-cli deploy dev
insites-cli test run dev
```

2. Deploy to staging for QA:

```bash
insites-cli deploy staging
insites-cli test run staging
```

3. Deploy to production:

```bash
insites-cli deploy production
```

## Module Management Pattern

### Installing Dependencies

> **CLI STATUS:** `insites-cli modules install` is not yet available. Module installation is currently done manually.

Pull existing modules from an instance:

```bash
insites-cli modules pull @platform-os/core dev
insites-cli modules pull @platform-os/blog dev
insites-cli modules pull my-custom-module dev
```

### Updating Modules

Check current versions:

```bash
insites-cli modules list dev
```

## Secrets and Configuration Pattern

### Managing API Keys

Store all secrets as constants:

```bash
insites-cli constants set dev API_KEY "key_xyz"
insites-cli constants set staging WEBHOOK_SECRET "secret_abc"
```

Reference in code:

```liquid
{% assign api_key = context.constants.API_KEY %}
```

## Migration Workflow

### Creating and Running Migrations

```bash
insites-cli migrations generate dev add_user_status
# Edit generated migration file
insites-cli migrations run dev
insites-cli migrations list dev
```

## Data Operations Pattern

### Backup Before Operations

```bash
insites-cli data export dev users data/backup_users.csv
```

### Bulk Operations

```bash
insites-cli data import staging users data/import_users.csv
```

### Data Cleanup

```bash
insites-cli data clean staging test_records
```

## Batch Command Execution

### Shell Scripts for Deployments

```bash
#!/bin/bash
ENV=$1
insites-cli audit
insites-cli deploy $ENV
insites-cli test run $ENV
insites-cli logsv2 $ENV --filter error
```

## See Also

- [CLI Commands](./api.md)
- [Advanced Patterns](./advanced.md)
- [Deployment Patterns](../deployment/patterns.md)
