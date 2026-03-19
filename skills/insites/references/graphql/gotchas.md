# GraphQL Gotchas

Common errors, limits, and troubleshooting for GraphQL in Insites.

## Common Errors

### "Liquid error: graphql tag is not allowed in partials"

**Cause:** You placed a `{% graphql %}` tag inside a partial file (`app/views/partials/`). Insites prohibits GraphQL calls from partials.

**Solution:** Move the `{% graphql %}` call to the page that renders the partial. Pass the query result to the partial as a variable: `{% render 'my_partial', products: result.records.results %}`.

### "QueryNotFound: 'products/serch'"

**Cause:** The file path in the `{% graphql %}` tag does not match any `.graphql` file. Usually a typo or wrong subdirectory.

**Solution:** Verify the file exists at `app/graphql/products/serch.graphql`. The path is relative to `app/graphql/` without the `.graphql` extension. Check spelling and directory names.

> **Module note:** If the GraphQL file is inside a module, check `modules/<module_name>/public/graphql/` or `private/graphql/` instead.

### "Variable $id of type ID! was provided invalid value"

**Cause:** A required variable (marked with `!`) was not passed or was passed as `nil`/empty.

**Solution:** Ensure the Liquid invocation provides all required variables: `{% graphql result = 'products/find', id: context.params.id %}`. Check that `context.params.id` is not nil. Add a guard: `{% if context.params.id %}...{% endif %}`.

### Query returns empty results when data exists

**Cause:** Missing or incorrect `table` filter. Without `table: { value: "product" }`, the query searches across all tables and may not match expected records.

**Solution:** Always include the `table` filter in `records()` queries. Double-check the table name matches the schema `name` exactly (case-sensitive).

### Property accessor returns null for existing data

**Cause:** Using the wrong accessor type. For example, `property(name: "price")` returns a string, not a number. Or `property_int(name: "price")` on a float field returns null.

**Solution:** Match the accessor to the schema property type. Use `property_float` for `float`, `property_int` for `integer`, `property_boolean` for `boolean`. When in doubt, `property()` always returns the string representation.

### "Cannot query field 'custom_type' on type 'Query'"

**Cause:** Attempting to define or use custom GraphQL types. The Insites schema is closed.

**Solution:** You cannot create custom types. Use the provided root operations (`records`, `record_create`, etc.) with property accessors to shape your response. All data modeling is done through schema YAML files.

### Mutation updates wrong record or all records

**Cause:** Passing a nil or incorrect `$id` to `record_update`. If `id` is nil, behavior is unpredictable.

**Solution:** Always validate the ID exists before calling update mutations. Guard with `{% if id %}` in Liquid.

### "Filter value must be a String" on property filter

**Cause:** Passing a non-string value (integer, boolean, object) directly to a property filter.

**Solution:** All property filter values must be strings. Convert in Liquid if needed: `{{ count | json }}` or simply pass as quoted string in the GraphQL variable.

### related_record returns null

**Cause:** The `join_on_property` value does not contain a valid ID, or the referenced record does not exist in the specified table.

**Solution:** Verify the stored ID value is correct. Check that `join_on_property` names the property on the **current** record. For `related_records`, check that `foreign_property` names the property on the **related** table.

## Limits

| Resource | Limit | Notes |
|----------|-------|-------|
| `per_page` maximum | ~1000 | Use pagination for larger sets |
| Default `per_page` | 20 | If not specified |
| Query depth | ~5 levels | Nested `related_record` / `related_records` |
| Properties per filter | No hard limit | Performance degrades with many conditions |
| Inline query size | Practical only | Long queries should use named files |
| GraphQL file size | No hard limit | Keep operations focused and single-purpose |
| Concurrent queries per request | No hard limit | Each `{% graphql %}` tag is a separate call |
| Sort fields | Multiple allowed | Applied in array order |

## Troubleshooting Flowchart

```
GraphQL issue?
├── Query returns error?
│   ├── "QueryNotFound"
│   │   └── Fix: Check file path and spelling (relative to app/graphql/)
│   ├── "not allowed in partials"
│   │   └── Fix: Move {% graphql %} to page, pass data to partial
│   ├── "Variable ... invalid value"
│   │   └── Fix: Ensure all required (!) variables are provided and non-nil
│   └── "Cannot query field"
│       └── Fix: Use only built-in root types (records, record_create, etc.)
│
├── Query returns empty results?
│   ├── Is table filter present and correct?
│   │   └── Fix: Add filter: { table: { value: "exact_name" } }
│   ├── Are property filters using string values?
│   │   └── Fix: All filter values must be strings
│   └── Is the data deployed?
│       └── Fix: Run insites-cli deploy dev
│
├── Property value is null or wrong type?
│   ├── Is the accessor matching the schema type?
│   │   └── Fix: property_float for float, property_int for integer, etc.
│   └── Is the property name spelled correctly?
│       └── Fix: Case-sensitive match against schema property name
│
└── Related record is null?
    ├── Does the ID property contain a valid value?
    │   └── Fix: Verify stored ID points to existing record
    └── Are join_on_property / foreign_property correct?
        └── Fix: join_on_property = field on THIS record,
            foreign_property = field on RELATED record
```

## See Also

- [README.md](README.md) -- overview and getting started
- [configuration.md](configuration.md) -- file structure and invocation syntax
- [api.md](api.md) -- complete API reference
- [patterns.md](patterns.md) -- correct usage patterns
- [advanced.md](advanced.md) -- advanced techniques
- [../schema/gotchas.md](../schema/gotchas.md) -- schema-related errors
