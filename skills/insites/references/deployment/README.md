# Deployment

## Pre-Deployment Checklist

1. Run `platformos-check` — must pass with 0 errors
2. Run tests: `insites-cli test run staging`
3. Verify all changes work on staging
4. Review any pending migrations

## Deploy

```bash
# Deploy to staging
insites-cli deploy dev

# Deploy to production
insites-cli deploy production
```

## What Happens on Deploy

1. All files in `app/` are synced to the platform
2. Pending migrations are executed in chronological order
3. Schema changes are applied
4. Assets are uploaded to CDN
5. Cache is invalidated

## Development Sync

For live development, use sync mode:

```bash
insites-cli sync dev
```

This watches for file changes and syncs them immediately. Do NOT use in production.

## Environment Setup

### .pos file
```yaml
dev:
  url: https://your-instance.staging.oregon.platform-os.com
production:
  url: https://your-instance.platform-os.com
```

## CI/CD

Example CI pipeline:

```bash
# 1. Install tools
npm install -g /insites-cli
npm install -g @platformos/platformos-check

# 2. Lint
platformos-check

# 3. Deploy to staging
insites-cli deploy staging

# 4. Run tests
insites-cli test run staging

# 5. Deploy to production (if tests pass)
insites-cli deploy production
```

## Rules

- Always lint before deploying
- Always test on staging before production
- Never sync to production (deploy only)
- Pending migrations run automatically on deploy
- Only sync files inside `app/`
