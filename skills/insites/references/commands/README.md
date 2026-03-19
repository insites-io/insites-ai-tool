# Commands (Business Logic)

Commands encapsulate business rules in Insites following the **build, check, execute** pattern. They provide a structured, testable approach to all create, update, and delete operations. Each stage is implemented inline in the command file using standard Liquid tags.

## Key Purpose

Commands are the single place for business logic in a Insites application. They enforce a strict three-stage pipeline that separates data construction, validation, and persistence. This keeps pages thin (controller-only) and partials focused on presentation.

## When to Use

- Creating, updating, or deleting any record in the database
- Validating user input before persistence
- Encapsulating business rules that must be enforced consistently
- Operations that should optionally trigger side effects (events)
- Any data mutation that needs to be callable from pages, background jobs, or other commands

Do NOT use commands for:
- Read-only queries (use `app/lib/queries/` instead)
- Pure presentation logic (use partials)
- One-off data transformations with no persistence

## How It Works

```
User Request
    |
    v
Page (Controller) --- calls ---> Command partial
                                     |
                           +---------+---------+
                           |         |         |
                         Build     Check    Execute
                           |         |         |
                       Construct  Validate  Persist
                        object    fields    via GraphQL
                           |         |         |
                           +----+----+----+----+
                                |         |
                            Return     Publish
                            result     event (optional)
```

1. **Build** -- Assemble a data object from input parameters using `parse_json` to whitelist fields.
2. **Check** -- Validate the object by initializing a contract (`{ "errors": {}, "valid": true }`) and running inline validation checks for each required field.
3. **Execute** -- If `object.valid` is true, persist via an inline `graphql` call with `args: object`.

The result object always contains `valid` (boolean), `errors` (hash), and the original data fields.

## Getting Started

1. Create a command file at `app/lib/commands/<resource>/<action>.liquid` (e.g., `app/lib/commands/products/create.liquid`).
2. Implement the three stages: build, check, execute.
3. Call from a page via `{% function result = 'lib/commands/products/create', title: title, price: price %}`.
4. Check `result.valid` to determine success or failure.
5. On failure, re-render the form with `result.errors` for display.

Minimal command:

```liquid
{% comment %} === BUILD === {% endcomment %}
{% parse_json object %}
  { "title": {{ title | json }} }
{% endparse_json %}

{% comment %} === CHECK === {% endcomment %}
{% assign c = '{ "errors": {}, "valid": true }' | parse_json %}
{% if object.title == blank %}
  {% assign field_errors = c.errors.title | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['title'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}
{% assign object = object | hash_merge: c %}

{% comment %} === EXECUTE === {% endcomment %}
{% if object.valid %}
  {% graphql r = 'products/create', args: object %}
  {% assign object = r.record_create %}
  {% hash_assign object['valid'] = true %}
{% endif %}
{% return object %}
```

## See Also

- [configuration.md](configuration.md) -- File naming, directory layout, and setup conventions
- [api.md](api.md) -- Validator helpers, result structure, and calling conventions
- [patterns.md](patterns.md) -- Common command workflows and real-world examples
- [gotchas.md](gotchas.md) -- Common errors, limits, and troubleshooting
- [advanced.md](advanced.md) -- Nested commands, background execution, and optimization
- [Events & Consumers](../events-consumers/) -- Publishing events from commands
- [Background Jobs](../background-jobs/) -- Running commands asynchronously
- [GraphQL](../graphql/) -- Mutation files used by commands
- [Schema](../schema/) -- Table definitions that commands operate on
