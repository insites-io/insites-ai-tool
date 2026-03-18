# CLI Commands Reference

## Deploy Command

Deploy your application to an environment:

```bash
insites-cli deploy [environment]
insites-cli deploy dev
insites-cli deploy production
```

Deployment flow:
1. Runs platformos-check validation
2. Syncs files
3. Executes migrations
4. Applies schema changes
5. Uploads assets to CDN

## Sync Command

Synchronize local changes without full deployment:

```bash
insites-cli sync [environment]
insites-cli sync dev
insites-cli sync --watch staging
```

Watch mode for continuous sync:

```bash
insites-cli sync dev --watch
```

## GUI Serve Command

Local development server with hot reload:

```bash
insites-cli gui serve
insites-cli gui serve --port 3000
```

Access at `http://localhost:3000`

## Logs Command

View instance logs with filtering:

```bash
insites-cli logs [environment]
insites-cli logs dev
insites-cli logs dev --filter "error"
insites-cli logs staging --filter "background_job" --follow
```

Filter options:
- `error`: Error messages only
- `background_job`: Background job logs
- `api_call`: API call logs
- Custom patterns using regex

## Liquid and GraphQL Execution

Execute Liquid templates and GraphQL queries directly:

```bash
insites-cli exec [environment] [query_type] [query]
insites-cli exec dev liquid "{{ 'Hello' }}"
insites-cli exec dev graphql "{ users { id name } }"
```

## Modules Management

### Install Module

Install modules from marketplace or custom repository:

```bash
insites-cli modules install @platform-os/blog dev
insites-cli modules install my-module staging
```

### Download Module

Download module code locally:

```bash
insites-cli modules download @platform-os/blog ./modules
```

### List Modules

View installed modules:

```bash
insites-cli modules list
insites-cli modules list dev
```

## Constants Management

### Set Constants

Configure global constants:

```bash
insites-cli constants set dev MY_API_KEY "secret123"
insites-cli constants set staging SENDGRID_TOKEN "token_xyz"
```

### List Constants

View all constants:

```bash
insites-cli constants list dev
insites-cli constants list production
```

## Migrations Management

### Generate Migration

Create new migration:

```bash
insites-cli migrations generate [environment] [migration_name]
insites-cli migrations generate dev create_users_table
```

### Run Migrations

Execute pending migrations:

```bash
insites-cli migrations run [environment]
insites-cli migrations run staging
```

### List Migrations

View migration history:

```bash
insites-cli migrations list [environment]
insites-cli migrations list production
```

## Data Management

### Export Data

Export database records:

```bash
insites-cli data export [environment] [type] [file]
insites-cli data export dev users data/users.csv
```

### Import Data

Import records:

```bash
insites-cli data import [environment] [type] [file]
insites-cli data import staging users data/users.csv
```

### Clean Data

Remove all records (use with caution):

```bash
insites-cli data clean [environment] [type]
insites-cli data clean dev users
```

## Testing Command

Run automated tests:

```bash
insites-cli test run [environment]
insites-cli test run staging
insites-cli test run dev --verbose
```

Returns contract compliance results.

## See Also

- [CLI Configuration](./configuration.md)
- [Advanced CLI Patterns](./advanced.md)
- [CLI Troubleshooting](./gotchas.md)
