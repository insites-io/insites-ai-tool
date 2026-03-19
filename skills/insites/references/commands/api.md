# Commands -- API Reference

## Command Stages

Commands use three inline stages -- build, check, execute -- implemented directly in each command file. No external module is required.

### Build Stage

The build stage is a `parse_json` block that whitelists input fields into a clean object. This IS the build step -- there is no separate helper to call.

```liquid
{% comment %} === BUILD === {% endcomment %}
{% parse_json object %}
  {
    "title": {{ title | json }},
    "price": {{ price | json }}
  }
{% endparse_json %}
```

**Result:** A hash containing only the whitelisted fields.

### Check Stage

The check stage initializes a validation contract and runs app-level validator helpers against the object.

```liquid
{% comment %} === CHECK === {% endcomment %}
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
```

**Result:** Object with `valid` set to `false` and `errors` populated if any validation fails; otherwise `valid: true` and `errors: {}`.

### Execute Stage

The execute stage persists the object by running a GraphQL mutation inline.

```liquid
{% comment %} === EXECUTE === {% endcomment %}
{% if object.valid %}
  {% graphql r = 'products/create', args: object %}
  {% if r.errors %}
    {% log r, type: 'ERROR: products/create' %}
  {% endif %}
  {% assign object = r.record_create %}
  {% hash_assign object['valid'] = true %}
{% endif %}
```

**Key details:**

| Element | Description |
|---------|-------------|
| `'products/create'` | Path to `.graphql` file relative to `app/graphql/` |
| `args: object` | Passes the entire object hash as GraphQL variables |
| `r.record_create` | Top-level field in the mutation response (matches the mutation operation, e.g., `record_create`, `record_update`, `record_delete`) |

**Result:** Object with `id`, `created_at`, and other fields from the mutation response, plus `valid: true`.

### Event Publishing

After a successful execute, you can dispatch background jobs to trigger side effects:

```liquid
{% if object.valid %}
  {% graphql r = 'products/create', args: object %}
  {% assign object = r.record_create %}
  {% hash_assign object['valid'] = true %}

  {% comment %} Dispatch side effects as background jobs {% endcomment %}
  {% background source_name: 'event:product_created', priority: 'default', max_attempts: 3 %}
    {% function _ = 'lib/consumers/product_created/send_notification', event: object %}
  {% endbackground %}
{% endif %}
```

## Inline Validation Patterns

Validations are written inline in the check stage of each command. Below are the common patterns you can copy and adapt.

### Presence Check

Field must not be blank, null, or empty string.

```liquid
{% if object.title == blank %}
  {% assign field_errors = c.errors.title | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['title'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}
```

### Uniqueness Check

Field must be unique within a specified table. Issues a database query.

```liquid
{% graphql r = 'records/count', property_name: 'email', property_value: object.email, table: 'user' %}
{% if r.records.total_entries > 0 %}
  {% assign field_errors = c.errors.email | default: '[]' | parse_json | add_to_array: "is already taken" %}
  {% hash_assign c['errors']['email'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}
```

### Numericality Check

Field must be a valid number.

```liquid
{% assign price_num = object.price | plus: 0 %}
{% if object.price == blank or price_num == 0 and object.price != '0' %}
  {% assign field_errors = c.errors.price | default: '[]' | parse_json | add_to_array: "is not a number" %}
  {% hash_assign c['errors']['price'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}
```

### Length Check

Field string length must fall within constraints.

```liquid
{% assign title_size = object.title | size %}
{% if title_size < 3 or title_size > 255 %}
  {% assign field_errors = c.errors.title | default: '[]' | parse_json | add_to_array: "must be between 3 and 255 characters" %}
  {% hash_assign c['errors']['title'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}
```

### Format Check

Field must match a regular expression.

```liquid
{% assign slug_match = object.slug | matches: '^[a-z0-9-]+$' %}
{% if slug_match != true %}
  {% assign field_errors = c.errors.slug | default: '[]' | parse_json | add_to_array: "has an invalid format" %}
  {% hash_assign c['errors']['slug'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}
```

### Inclusion Check

Field value must be in a predefined list.

```liquid
{% assign allowed = 'draft,published,archived' | split: ',' %}
{% unless allowed contains object.status %}
  {% assign field_errors = c.errors.status | default: '[]' | parse_json | add_to_array: "is not included in the list" %}
  {% hash_assign c['errors']['status'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endunless %}
```

### Confirmation Check

Two fields must match (e.g., password and password confirmation).

```liquid
{% if object.password != object.password_confirmation %}
  {% assign field_errors = c.errors.password_confirmation | default: '[]' | parse_json | add_to_array: "doesn't match password" %}
  {% hash_assign c['errors']['password_confirmation'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}
```

## Result Object Structure

```json
{
  "title": "Widget",
  "price": 19.99,
  "valid": true,
  "errors": {},
  "id": "12345",
  "created_at": "2025-01-15T10:30:00Z"
}
```

On validation failure:

```json
{
  "title": "",
  "price": null,
  "valid": false,
  "errors": {
    "title": ["can't be blank"],
    "price": ["can't be blank", "is not a number"]
  }
}
```

## Calling a Command

From a page or another partial:

```liquid
{% function result = 'lib/commands/products/create', title: "Widget", price: 19.99 %}
```

Parameters are passed as named arguments and become local variables inside the command file.

## See Also

- [README.md](README.md) -- Commands overview
- [configuration.md](configuration.md) -- File layout and naming
- [patterns.md](patterns.md) -- Real-world usage examples
- [gotchas.md](gotchas.md) -- Common mistakes and error messages
- [advanced.md](advanced.md) -- Custom validators and advanced patterns
- [Liquid Tags](../liquid/tags/) -- `function`, `parse_json`, and other tag references
