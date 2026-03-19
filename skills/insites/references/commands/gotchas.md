# Commands -- Gotchas and Troubleshooting

## Common Errors

### "Liquid error: undefined variable 'object'"

**Cause:** The variable name inside `parse_json` does not match what is referenced later, or the `{% assign %}` / `{% function %}` assignment was skipped.

**Solution:** Ensure `parse_json` assigns to `object` and that subsequent stages reference the same variable name.

### "app.errors.blank" on a field that has a value

**Cause:** The value was not properly interpolated in the `parse_json` block. Missing the `| json` filter causes strings to break JSON structure.

**Solution:** Always use `{{ variable | json }}` inside `parse_json`. Never use raw `{{ variable }}`.

```liquid
{% comment %} WRONG {% endcomment %}
{% parse_json object %}
  { "title": "{{ title }}" }
{% endparse_json %}

{% comment %} CORRECT {% endcomment %}
{% parse_json object %}
  { "title": {{ title | json }} }
{% endparse_json %}
```

### "record_create returned nil" or empty result after execute

**Cause:** The response field in `r.record_create` does not match the top-level field in the GraphQL mutation response.

**Solution:** If your mutation uses `record_create(...)`, use `r.record_create`. If it uses `record_update(...)`, use `r.record_update`. Check the `.graphql` file to confirm the operation name.

### "Validation passed but record was not created"

**Cause:** The `{% if object.valid %}` guard around the execute stage is missing.

**Solution:** Always wrap the execute call in an `{% if object.valid %}` block. Without it, the execute call may silently fail or never run.

### "Cannot read property 'valid' of null"

**Cause:** The command file does not include `{% return object %}` at the end, so the caller receives `nil`.

**Solution:** Every command must end with `{% return object %}`.

### "Mutation variable $object is not defined"

**Cause:** The GraphQL mutation file expects `$object` but the `graphql` tag is not passing it correctly via `args:`, or the mutation signature is wrong.

**Solution:** Ensure the mutation declares `mutation name($object: HashObject!)` and references `$object.field_name` in property values. In the command, use `{% graphql r = 'mutation_path', args: object %}`.

## Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Validator calls per check stage | No hard limit | Keep reasonable for performance (under 50) |
| Nested command depth | No hard limit | Avoid deep nesting; prefer events for decoupling |
| Object properties | No hard limit | Properties must match schema table fields for persistence |
| Background job max_attempts | 1-5 | Commands run as background jobs inherit this limit |
| GraphQL mutation timeout | Platform default | Long-running mutations may time out |
| Uniqueness check | Requires GraphQL count query | Queries the database; slower than other checks |

## Troubleshooting Flowchart

```
Command returns unexpected result
├── result is nil
│   └── Missing {% return object %} at end of command
├── result.valid is false unexpectedly
│   ├── Check result.errors for field names and messages
│   ├── Is value present but errors say "blank"?
│   │   └── Missing | json filter in parse_json
│   ├── Is uniqueness failing?
│   │   └── Check table option matches schema table name
│   └── Is format failing?
│       └── Verify regex pattern in validator options
├── result.valid is true but no record created
│   ├── Missing {% if object.valid %} guard around execute
│   ├── Wrong mutation_name (file not found)
│   └── Wrong selection (does not match mutation response field)
├── result has no id after execute
│   ├── Mutation .graphql file missing id in selection set
│   └── selection parameter mismatch
└── "Template not found" error
    ├── Command path typo in {% function %} call
    └── File in wrong directory (must be app/lib/commands/)
```

## See Also

- [README.md](README.md) -- Commands overview
- [configuration.md](configuration.md) -- Correct file layout
- [api.md](api.md) -- Helper signatures and validator details
- [patterns.md](patterns.md) -- Working examples to compare against
- [advanced.md](advanced.md) -- Edge cases and advanced troubleshooting
