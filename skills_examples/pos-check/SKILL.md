---
name: pos-check
description: Run platformos-check linter with detailed error reporting
---

# Insites Check (Linter)

Run the platformos-check linter to validate Liquid code.

## Exclusion pattern check (mandatory)

Application directory should contain `.platformos-check.yml` file with following instructions

```
root: .

ignore:
  - node_modules/*
  - modules/*
```

## Command

### Check all files
```bash
platformos-check
```

### Check specific file
```bash
platformos-check app/views/pages/articles/index.liquid
```

### Check specific directory
```bash
platformos-check app/views/pages/
```

## Error Categories

### CRITICAL (Must Fix)
These errors will cause runtime failures:
- Liquid syntax errors
- Missing required tags
- Invalid filter usage
- Undefined variables in required context
- Missing YAML frontmatter

### WARNING (Should Review)
These may indicate issues:
- Deprecated syntax
- Unused variables
- Performance concerns
- Style violations

### INFO (Optional)
Suggestions for improvement:
- Code organization
- Best practices
- Documentation

## Output Format

```
app/views/pages/articles/index.liquid:5:1 - error - SyntaxError: ...
app/views/partials/articles/show.liquid:12:5 - warning - UnusedVariable: ...
```

Format: `file:line:column - severity - ErrorCode: message`

## Common Errors

### LiquidSyntaxError
```
Line break in {% liquid %} block
```
Fix: Keep statements on single lines within liquid blocks.

### UndefinedFilter
```
Undefined filter 'custom_filter'
```
Fix: Use only documented Insites filters.

### MissingTranslation
```
Translation key 'app.missing.key' not found
```
Fix: Add the key to translations YAML file.

### FormCsrfMissing
```
Form missing authenticity_token
```
Fix: Add `<input type="hidden" name="authenticity_token" value="{{ context.authenticity_token }}">`.

## Integration

After running check:
1. Parse output for errors
2. Group by severity
3. Report critical errors first
4. Provide fix suggestions
5. Return PASS only if 0 errors

## Acceptance Criteria

For code to pass validation:
- **0 critical errors**
- **0 blocking warnings**
- Informational items documented
