# Commands -- Configuration Reference

## Directory Structure

Commands live under `app/lib/commands/` which maps to `app/views/partials/lib/commands/` at runtime. Organize by resource name, then action:

> **Module path:** In modules, commands live in `modules/<module_name>/public/views/partials/lib/commands/` (callable from app and other modules) or `modules/<module_name>/private/views/partials/lib/commands/` (internal only). The function call path remains relative.

```
app/
├── lib/
│   └── commands/
│       ├── products/
│       │   ├── create.liquid
│       │   ├── update.liquid
│       │   └── delete.liquid
│       ├── orders/
│       │   ├── create.liquid
│       │   ├── update.liquid
│       │   ├── cancel.liquid
│       │   └── fulfill.liquid
│       └── users/
│           ├── create.liquid
│           └── update_profile.liquid
├── graphql/
│   ├── products/
│   │   ├── create.graphql      # mutation used by commands/products/create
│   │   ├── update.graphql
│   │   └── delete.graphql
│   └── orders/
│       ├── create.graphql
│       └── update.graphql
└── schema/
    ├── product.yml              # table definition
    └── order.yml
```

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Command file | `app/lib/commands/<resource>/<action>.liquid` | `app/lib/commands/products/create.liquid` |
| GraphQL mutation | `app/graphql/<resource>/<action>.graphql` | `app/graphql/products/create.graphql` |
| Schema table | `app/schema/<resource>.yml` | `app/schema/product.yml` |
| Command call | `lib/commands/<resource>/<action>` | `lib/commands/products/create` |
| Mutation name | `<resource>/<action>` | `products/create` |

Note: The `app/views/partials/` prefix is implied. When calling a command, use `lib/commands/...` not `app/views/partials/lib/commands/...`.

## Required GraphQL Mutation

Each command that persists data requires a corresponding `.graphql` mutation file. Example for `products/create`:

```graphql
# app/graphql/products/create.graphql
mutation products_create($object: HashObject!) {
  record_create(
    record: {
      table: "product"
      properties: [
        { name: "title", value: $object.title }
        { name: "price", value: $object.price }
        { name: "description", value: $object.description }
      ]
    }
  ) {
    id
    created_at
    table
    properties
  }
}
```

## Required Schema Table

Commands typically operate on tables defined in `app/schema/`. Example:

```yaml
# app/schema/product.yml
name: product
properties:
  - name: title
    type: string
  - name: price
    type: float
  - name: description
    type: text
```

## Command File Template

Every command file follows this skeleton:

```liquid
{% comment %} app/lib/commands/products/create.liquid {% endcomment %}

{% comment %} === BUILD: whitelist input fields === {% endcomment %}
{% parse_json object %}
  {
    "title": {{ title | json }},
    "price": {{ price | json }}
  }
{% endparse_json %}

{% comment %} === CHECK: validate fields === {% endcomment %}
{% assign c = '{ "errors": {}, "valid": true }' | parse_json %}

{% if object.title == blank %}
  {% assign field_errors = c.errors.title | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['title'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% if object.price == blank %}
  {% assign field_errors = c.errors.price | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['price'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% assign object = object | hash_merge: c %}

{% comment %} === EXECUTE: persist to database === {% endcomment %}
{% if object.valid %}
  {% graphql r = 'products/create', args: object %}
  {% if r.errors %}
    {% log r, type: 'ERROR: products/create' %}
  {% endif %}
  {% assign object = r.record_create %}
  {% hash_assign object['valid'] = true %}
{% endif %}

{% return object %}
```

The build step is simply the `parse_json` block that whitelists fields. The check step validates each field inline using the contract pattern (`c` hash with `errors` and `valid`). The execute step is an inline `graphql` call with `args: object`. If you find yourself repeating the same validation logic, you can extract it into reusable helper partials (see the code management tip at the end of [patterns.md](patterns.md)).

## Configuration Checklist

- [ ] Command file at `app/lib/commands/<resource>/<action>.liquid`
- [ ] GraphQL mutation at `app/graphql/<resource>/<action>.graphql`
- [ ] Schema table at `app/schema/<resource>.yml`
- [ ] Inline validation logic in the check stage for each required field
- [ ] `insites-cli audit` passes with zero errors

## See Also

- [README.md](README.md) -- Commands overview and getting started
- [api.md](api.md) -- Validator helpers, result structure, and calling conventions
- [patterns.md](patterns.md) -- Real-world command examples
- [gotchas.md](gotchas.md) -- Common configuration mistakes
- [advanced.md](advanced.md) -- Multi-step commands and advanced configuration
- [Schema Reference](../schema/) -- Table definition syntax
- [GraphQL Reference](../graphql/) -- Mutation file syntax
