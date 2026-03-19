---
name: insites-logs
description: Fetch and analyze Insites logs for errors and debugging
---

# Insites Log Analyzer

Fetch and analyze logs from Insites instance.

## Commands

### Stream live logs
```bash
insites-cli logsv2 staging
```

### Stream with filter
```bash
insites-cli logsv2 staging --filter error
```

## Log Levels

| Level | Description | Action Required |
|-------|-------------|-----------------|
| ERROR | Runtime failures | Must fix immediately |
| WARN | Potential issues | Should investigate |
| INFO | Normal operations | Informational |
| DEBUG | Detailed tracing | For debugging |

## Common Error Patterns

### Liquid Syntax Errors
```
Liquid error: undefined method `missing_method' for nil:NilClass
```
**Cause:** Calling method on nil object
**Fix:** Add nil check before method call

### Liquid Template Errors
```
Liquid syntax error: Unknown tag 'custom_tag'
```
**Cause:** Using non-existent Liquid tag
**Fix:** Use only documented Insites tags

### GraphQL Errors
```
GraphQL::Error: Field 'nonexistent' doesn't exist on type 'records'
```
**Cause:** Querying non-existent field
**Fix:** Check GraphQL schema for valid fields

### Missing File Errors
```
Liquid error: Could not find partial 'missing/partial'
```
**Cause:** Render pointing to non-existent partial
**Fix:** Create the partial or fix the path

### Authorization Errors
```
Unauthorized: User does not have permission 'action.name'
```
**Cause:** Missing permission for user role
**Fix:** Add permission to role in permissions.liquid

### HTTP Errors
```
500 Internal Server Error - /path/to/page
```
**Cause:** Unhandled exception in page
**Fix:** Check page code for errors, add error handling

```
404 Not Found - /expected/route
```
**Cause:** Page doesn't exist or wrong slug
**Fix:** Check page exists with correct slug/method

## Analysis Process

1. **Identify error level entries**
   - Filter for ERROR and WARN levels
   - Note timestamps and frequency

2. **Categorize errors**
   - Liquid errors
   - GraphQL errors
   - HTTP errors
   - Authorization errors

3. **Trace to source**
   - Identify file/line from error message
   - Find the relevant code

4. **Suggest fixes**
   - Based on error pattern
   - Reference documentation

## Report Format

```markdown
## Log Analysis Report

### Summary
- Errors: [count]
- Warnings: [count]
- Time period: [start] to [end]

### Critical Errors
1. **[Error type]**
   - Message: [error message]
   - File: [file path]
   - Occurrences: [count]
   - Suggested fix: [fix description]

### Warnings
1. **[Warning type]**
   - Message: [warning message]
   - Investigation needed: [yes/no]

### Recommendations
[List of actions to take]
```

## Debugging Tips

1. **Enable debug logging**
   ```liquid
   {% log variable, type: 'debug' %}
   ```

2. **Check specific page**
   Access the page and watch logs for that request

3. **Verify data**
   Log variables to verify their contents:
   ```liquid
   {% log result, type: 'info' %}
   ```

4. **Test in isolation**
   Use GraphQL GUI to test queries directly
