# CLI Gotchas and Troubleshooting

## Common Issues

### Never Sync to Production Directly

Never use sync command on production:

```bash
# WRONG - Never do this!
insites-cli sync production --watch
```

Always use deploy which includes validation:

```bash
# CORRECT
insites-cli deploy production
```

Production should only receive through:
1. platformos-check validation
2. Staging tests
3. Formal deployment process

### Token Expiration

**Issue**: Authentication fails with "Invalid token"

**Solution**:
- Regenerate token in Insites dashboard
- Update `.pos` file
- Clear cached credentials: `insites-cli env clear-cache`

### Configuration File Not Found

**Issue**: "Cannot find .pos file"

**Solution**:
- Verify `.pos` exists in project root
- Check file permissions: `ls -la .pos`
- Specify explicit path: `insites-cli sync dev --config /path/to/.pos`

### Port Already in Use

**Issue**: `gui serve` fails with port conflict

**Solution**:
```bash
insites-cli gui serve --port 3001
# Or kill existing process
lsof -i :3000 | kill -9
```

### Migration Conflicts

**Issue**: Migration fails due to schema conflict

**Solution**:
- Check current migrations: `insites-cli migrations list dev`
- Review conflicting migrations
- Resolve manually or create compensating migration

## platformos-check Failures

### Syntax Errors

**Error**: "Invalid Liquid syntax"

```liquid
# WRONG
{% if user %}
  {{ user.name }

# CORRECT
{% if user %}
  {{ user.name }}
{% endif %}
```

### Missing Partial

**Error**: "Partial not found"

Ensure partial exists at correct path:

```bash
# Referencing: {% include 'components/button' %}
# File should be at: app/views/partials/components/button.html.liquid
```

### Tag Validation

**Error**: "Unknown tag"

Verify tag spelling and Insites support:

```bash
platformos-check --help
```

### Translation Keys

**Error**: "Untranslated string"

Define all strings in translation files:

```yaml
# config/translations.yml
en:
  hello: "Hello"
  goodbye: "Goodbye"
```

## Log Filtering Issues

### No Logs Appearing

**Issue**: Logs filter returns no results

**Solutions**:
- Check environment is correct: `insites-cli logs dev`
- Use `--follow` flag: `insites-cli logs dev --follow`
- Check application activity generating logs

### Filter Not Matching

Use exact filter values:

```bash
insites-cli logs staging --filter "background_job"
insites-cli logs staging --filter "api_call"
```

## Module Installation Problems

### Module Not Found

**Issue**: Module installation fails

**Solution**:
- Verify module name: `insites-cli modules list`
- Check marketplace availability
- Ensure authentication with private modules

### Version Conflicts

**Issue**: Incompatible module versions

**Solution**:
- Review module dependencies
- Check documentation for version requirements
- Downgrade/upgrade compatible versions

## Data Operations Risks

### Data Cleanup Without Backup

**Issue**: Accidentally deleted all data

**Prevention**:
```bash
# Always backup first
insites-cli data export dev users data/backup.csv

# Then clean
insites-cli data clean dev test_data
```

### Import Format Errors

**Issue**: Import fails due to CSV format

**Solution**:
- Validate CSV format matches schema
- Check encoding: UTF-8 required
- Test on dev first: `insites-cli data import dev users data/test.csv`

## See Also

- [CLI Configuration](./configuration.md)
- [Testing Troubleshooting](../testing/gotchas.md)
- [Deployment Issues](../deployment/gotchas.md)
