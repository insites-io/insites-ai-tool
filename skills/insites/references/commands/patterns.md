# Commands -- Common Patterns

## Pattern: Basic CRUD Command

The most common pattern is a create command called from a POST page.

### Command file

```liquid
{% comment %} app/lib/commands/products/create.liquid {% endcomment %}

{% comment %} === BUILD === {% endcomment %}
{% parse_json object %}
  {
    "title": {{ title | json }},
    "price": {{ price | json }},
    "description": {{ description | json }},
    "user_id": {{ user_id | json }}
  }
{% endparse_json %}

{% comment %} === CHECK === {% endcomment %}
{% assign c = '{ "errors": {}, "valid": true }' | parse_json %}

{% if object.title == blank %}
  {% assign field_errors = c.errors.title | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['title'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% assign title_size = object.title | size %}
{% if title_size < 3 or title_size > 255 %}
  {% assign field_errors = c.errors.title | default: '[]' | parse_json | add_to_array: "must be between 3 and 255 characters" %}
  {% hash_assign c['errors']['title'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% if object.price == blank %}
  {% assign field_errors = c.errors.price | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['price'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% assign price_num = object.price | plus: 0 %}
{% if object.price != blank and price_num == 0 and object.price != '0' %}
  {% assign field_errors = c.errors.price | default: '[]' | parse_json | add_to_array: "is not a number" %}
  {% hash_assign c['errors']['price'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% assign object = object | hash_merge: c %}

{% comment %} === EXECUTE === {% endcomment %}
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

### Page calling the command

```liquid
{% comment %} app/views/pages/products/create.liquid {% endcomment %}
---
slug: products
method: post
authorization_policies:
  - authenticated_user
---
{% liquid
  assign profile = context.current_user

  function result = 'lib/commands/products/create',
    title: context.params.product.title,
    price: context.params.product.price,
    description: context.params.product.description,
    user_id: profile.id

  if result.valid
    session sflash = '{"notice": "Product created"}'
    redirect_to '/products'
  else
    render 'products/form', product: result
  endif
%}
```

## Pattern: Update Command

Update commands fetch the existing record, merge changes, and persist.

```liquid
{% comment %} app/lib/commands/products/update.liquid {% endcomment %}

{% comment %} === BUILD === {% endcomment %}
{% parse_json object %}
  {
    "id": {{ id | json }},
    "title": {{ title | json }},
    "price": {{ price | json }}
  }
{% endparse_json %}

{% comment %} === CHECK === {% endcomment %}
{% assign c = '{ "errors": {}, "valid": true }' | parse_json %}

{% if object.id == blank %}
  {% assign field_errors = c.errors.id | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['id'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% if object.title == blank %}
  {% assign field_errors = c.errors.title | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['title'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% assign object = object | hash_merge: c %}

{% comment %} === EXECUTE === {% endcomment %}
{% if object.valid %}
  {% graphql r = 'products/update', args: object %}
  {% if r.errors %}
    {% log r, type: 'ERROR: products/update' %}
  {% endif %}
  {% assign object = r.record_update %}
  {% hash_assign object['valid'] = true %}
{% endif %}
{% return object %}
```

## Pattern: Delete Command

Delete commands typically only need an ID and authorization.

```liquid
{% comment %} app/lib/commands/products/delete.liquid {% endcomment %}

{% comment %} === BUILD === {% endcomment %}
{% parse_json object %}
  { "id": {{ id | json }} }
{% endparse_json %}

{% comment %} === CHECK === {% endcomment %}
{% assign c = '{ "errors": {}, "valid": true }' | parse_json %}

{% if object.id == blank %}
  {% assign field_errors = c.errors.id | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['id'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% assign object = object | hash_merge: c %}

{% comment %} === EXECUTE === {% endcomment %}
{% if object.valid %}
  {% graphql r = 'products/delete', args: object %}
  {% if r.errors %}
    {% log r, type: 'ERROR: products/delete' %}
  {% endif %}
  {% assign object = r.record_delete %}
  {% hash_assign object['valid'] = true %}
{% endif %}
{% return object %}
```

## Pattern: Command with Event Publishing

Publish an event after successful execution to trigger side effects.

```liquid
{% if object.valid %}
  {% graphql r = 'orders/create', args: object %}
  {% if r.errors %}
    {% log r, type: 'ERROR: orders/create' %}
  {% endif %}
  {% assign object = r.record_create %}
  {% hash_assign object['valid'] = true %}

  {% comment %} Dispatch side effects as background jobs {% endcomment %}
  {% background source_name: 'event:order_created', priority: 'default', max_attempts: 3 %}
    {% function _ = 'lib/consumers/order_created/send_notification', event: object %}
  {% endbackground %}
{% endif %}
{% return object %}
```

## Pattern: Command with Conditional Validation

Add validators conditionally based on the data.

```liquid
{% assign c = '{ "errors": {}, "valid": true }' | parse_json %}

{% if object.email == blank %}
  {% assign field_errors = c.errors.email | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['email'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% assign email_match = object.email | matches: '^[^@]+@[^@]+$' %}
{% if email_match != true %}
  {% assign field_errors = c.errors.email | default: '[]' | parse_json | add_to_array: "has an invalid format" %}
  {% hash_assign c['errors']['email'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% if object.role == 'admin' %}
  {% if object.admin_code == blank %}
    {% assign field_errors = c.errors.admin_code | default: '[]' | parse_json | add_to_array: "can't be blank" %}
    {% hash_assign c['errors']['admin_code'] = field_errors %}
    {% hash_assign c['valid'] = false %}
  {% endif %}
{% endif %}

{% assign object = object | hash_merge: c %}
```

## Pattern: Displaying Validation Errors

Render errors in a form partial:

```liquid
{% comment %} app/views/partials/products/form.liquid {% endcomment %}

{% if product.errors.size > 0 %}
  <div class="pos-alert pos-alert--danger">
    <ul>
      {% for error in product.errors %}
        <li>{{ error[0] }}: {{ error[1] | join: ', ' | t }}</li>
      {% endfor %}
    </ul>
  </div>
{% endif %}

<form action="/products" method="post">
  {% render 'authenticity_token' %}
  <input type="text" name="product[title]" value="{{ product.title }}">
  {% if product.errors.title %}
    <span class="pos-form-error">{{ product.errors.title | first | t }}</span>
  {% endif %}
  <button type="submit">Save</button>
</form>
```

## Pattern: Calling One Command from Another

Commands can compose by calling other commands internally.

```liquid
{% comment %} app/lib/commands/orders/create_with_items.liquid {% endcomment %}

{% function order = 'lib/commands/orders/create', user_id: user_id, total: total %}

{% if order.valid %}
  {% for item in items %}
    {% function line = 'lib/commands/order_items/create',
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity
    %}
  {% endfor %}
{% endif %}

{% return order %}
```

## Pattern: Dynamic Execute with `args:` Hash

Instead of listing every property individually in the execute call, pass the entire object as a hash using `args:`. This eliminates boilerplate.

```liquid
{% comment %} From any command's execute stage {% endcomment %}
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

The key is `args: object` — it passes the entire object hash as GraphQL variables. The object keys must match the GraphQL variable names declared in the `.graphql` file.

**When to use `args:` vs named parameters:**

| Approach | Use when |
|----------|----------|
| `args: object` | Standard CRUD — object keys match GraphQL variable names |
| Named params (`title: title, price: price`) | You need explicit control over which fields are sent, or GraphQL variable names differ from object keys |

## Pattern: Contract-Based Validation (Complex Cases)

For simple validations, the inline presence check works well (see Basic CRUD above). For complex cases with branching logic, conditional queries, or multi-message errors per field, use the contract-chaining pattern.

### Contract structure

```liquid
{% comment %} Initialize a validation contract {% endcomment %}
{% assign c = '{ "errors": {}, "valid": true }' | parse_json %}
```

The contract accumulates errors as: `{ "errors": { "email": ["cannot be blank"], "otp_code": ["is invalid", "must be 6 digits"] }, "valid": false }`

### Inline error registration pattern

To add an error to any field, use this pattern:

```liquid
{% assign field_errors = c.errors.field_name | default: '[]' | parse_json | add_to_array: "error message here" %}
{% hash_assign c['errors']['field_name'] = field_errors %}
{% hash_assign c['valid'] = false %}
```

### Check stage using contract chaining

```liquid
{% comment %} app/lib/commands/users/verify_otp.liquid (check stage) {% endcomment %}
{% liquid
  assign c = '{ "errors": {}, "valid": true }' | parse_json

  if object.email == blank
    assign field_errors = c.errors.email | default: '[]' | parse_json | add_to_array: "can't be blank"
    hash_assign c['errors']['email'] = field_errors
    hash_assign c['valid'] = false
  endif

  if object.otp_code == blank
    assign field_errors = c.errors.otp_code | default: '[]' | parse_json | add_to_array: "can't be blank"
    hash_assign c['errors']['otp_code'] = field_errors
    hash_assign c['valid'] = false
  endif

  if c.valid
    comment Run expensive query only if basic validations pass endcomment
    graphql r = 'sessions/verify_otp', args: object
    assign user = r.users.results.first
    if user.authenticate == false
      assign field_errors = c.errors.otp_code | default: '[]' | parse_json | add_to_array: 'The code entered is not valid.'
      hash_assign c['errors']['otp_code'] = field_errors
      hash_assign c['valid'] = false
    endif
  endif

  hash_assign object['valid'] = c.valid
  hash_assign object['errors'] = c.errors

  return object
%}
```

**When to use contract-based validation:**

Use the contract-chaining pattern (shown above) for branching logic (validate field B only if field A is valid), queries during validation, custom error messages, or multiple errors per field. For simple cases, the standard inline presence check is sufficient -- it uses the same contract structure.

## Best Practices

1. **One responsibility per command** -- a command should do one thing (create a product, update an order).
2. **Always return the object** -- callers rely on `result.valid` and `result.errors`.
3. **Use `| json` filter** -- always pipe variables through `| json` inside `parse_json` to prevent injection.
4. **Keep pages thin** -- pages call commands and handle routing; no business logic in pages.
5. **Validate everything** -- never trust user input; always include a check stage.

> **Code management tip:** If you find yourself repeating the same validation logic across commands, extract it into a reusable helper partial (e.g., `app/views/partials/lib/validations/presence.liquid`). The same applies to the execute pattern — a shared execute helper avoids duplicating the GraphQL + error logging code in every command. See [Partials Patterns — Extracting Reusable Code](../partials/patterns.md) for step-by-step examples of how to extract validations, execute helpers, UI components, and authorization policies.

## See Also

- [README.md](README.md) -- Commands overview
- [configuration.md](configuration.md) -- File layout and setup
- [api.md](api.md) -- Inline validation patterns and stage details
- [gotchas.md](gotchas.md) -- Common mistakes and troubleshooting
- [advanced.md](advanced.md) -- Advanced patterns and optimization
- [Events & Consumers](../events-consumers/) -- Handling events published by commands
- [Forms Reference](../forms/) -- Building forms that submit to commands
