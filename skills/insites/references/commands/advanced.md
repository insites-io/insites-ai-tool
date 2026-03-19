# Commands -- Advanced Topics

## Running Commands as Background Jobs

Commands can be executed asynchronously using the `{% background %}` tag. This is useful for operations that do not need to return a result to the user immediately.

```liquid
{% background source_name: 'create_report', priority: 'low', max_attempts: 3 %}
  {% function result = 'lib/commands/reports/create',
    user_id: user_id,
    date_range: date_range
  %}
  {% if result.valid != true %}
    {% log result.errors, type: 'error' %}
  {% endif %}
{% endbackground %}
```

When running commands in the background, you cannot return the result to the caller. Use events or polling to communicate outcomes.

## Multi-Step Commands with Transactions

For operations that must succeed or fail atomically, wrap multiple mutations in a `{% transaction %}` block inside the execute stage.

```liquid
{% if object.valid %}
  {% transaction %}
    {% graphql r = 'orders/create', args: object %}
    {% assign object = r.record_create %}
    {% hash_assign object['valid'] = true %}

    {% for item in items %}
      {% parse_json line_item %}
        {
          "order_id": {{ object.id | json }},
          "product_id": {{ item.product_id | json }},
          "quantity": {{ item.quantity | json }}
        }
      {% endparse_json %}
      {% graphql li = 'order_items/create', args: line_item %}
    {% endfor %}
  {% endtransaction %}
{% endif %}
```

If any mutation inside the transaction fails, all changes are rolled back.

## Custom Validation Logic

When built-in validators are not sufficient, add custom checks after the standard check stage.

```liquid
{% assign c = '{ "errors": {}, "valid": true }' | parse_json %}

{% if object.start_date == blank %}
  {% assign field_errors = c.errors.start_date | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['start_date'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% if object.end_date == blank %}
  {% assign field_errors = c.errors.end_date | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['end_date'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% assign object = object | hash_merge: c %}

{% comment %} Custom: ensure end_date is after start_date {% endcomment %}
{% if object.valid %}
  {% assign start = object.start_date | to_time %}
  {% assign end = object.end_date | to_time %}
  {% if end <= start %}
    {% assign object = object | hash_merge: valid: false %}
    {% parse_json date_error %}["must be after start date"]{% endparse_json %}
    {% assign errors = object.errors | hash_merge: end_date: date_error %}
    {% assign object = object | hash_merge: errors: errors %}
  {% endif %}
{% endif %}
```

This preserves the standard error structure so callers can handle custom errors identically to built-in ones.

## Composing Commands

Complex workflows can be built by calling commands from within commands. Keep each command focused on a single resource.

```liquid
{% comment %} app/lib/commands/checkout/process.liquid {% endcomment %}

{% function order = 'lib/commands/orders/create',
  user_id: user_id,
  total: cart_total
%}

{% if order.valid %}
  {% function payment = 'lib/commands/payments/charge',
    order_id: order.id,
    amount: cart_total,
    token: payment_token
  %}

  {% if payment.valid %}
    {% comment %} Dispatch side effects {% endcomment %}
    {% background source_name: 'event:order_created', priority: 'default', max_attempts: 3 %}
      {% function _ = 'lib/consumers/order_created/notify', event: order %}
    {% endbackground %}
  {% else %}
    {% comment %} Roll back the order if payment fails {% endcomment %}
    {% function _ = 'lib/commands/orders/cancel', id: order.id %}
  {% endif %}

  {% assign result = payment %}
{% else %}
  {% assign result = order %}
{% endif %}

{% return result %}
```

## Optimizing Validator Performance

The uniqueness check issues a database query for each field it checks. Minimize its use and place it last in the validation chain so cheaper checks (presence, format) fail first. Use an `{% if c.valid %}` guard so the expensive query only runs when basic validations pass.

```liquid
{% assign c = '{ "errors": {}, "valid": true }' | parse_json %}

{% if object.email == blank %}
  {% assign field_errors = c.errors.email | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['email'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% assign email_match = object.email | matches: '^[^@]+@[^@]+\.[^@]+$' %}
{% if email_match != true %}
  {% assign field_errors = c.errors.email | default: '[]' | parse_json | add_to_array: "has an invalid format" %}
  {% hash_assign c['errors']['email'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}

{% if c.valid %}
  {% comment %} Run expensive uniqueness query only if basic validations pass {% endcomment %}
  {% graphql r = 'records/count', property_name: 'email', property_value: object.email, table: 'user_profile' %}
  {% if r.records.total_entries > 0 %}
    {% assign field_errors = c.errors.email | default: '[]' | parse_json | add_to_array: "is already taken" %}
    {% hash_assign c['errors']['email'] = field_errors %}
    {% hash_assign c['valid'] = false %}
  {% endif %}
{% endif %}

{% assign object = object | hash_merge: c %}
```

## Handling File Uploads in Commands

For commands that process file uploads, the file data comes through `context.params` as an upload object. Pass the relevant properties to your command.

```liquid
{% function result = 'lib/commands/documents/create',
  title: context.params.document.title,
  file: context.params.document.file
%}
```

In the command, include the file property in the object and ensure the schema defines the field with type `upload`:

```yaml
# app/schema/document.yml
name: document
properties:
  - name: title
    type: string
  - name: file
    type: upload
```

## Idempotent Commands

For operations that might be retried (e.g., background jobs with `max_attempts > 1`), design commands to be idempotent.

```liquid
{% comment %} Check if the record already exists before creating {% endcomment %}
{% graphql existing = 'products/find_by_external_id', external_id: external_id %}

{% if existing.records.results.size > 0 %}
  {% assign object = existing.records.results.first %}
  {% assign object = object | hash_merge: valid: true, errors: {} %}
{% else %}
  {% comment %} Standard build/check/execute {% endcomment %}
  {% parse_json object %}
    {
      "external_id": {{ external_id | json }},
      "title": {{ title | json }}
    }
  {% endparse_json %}

  {% assign c = '{ "errors": {}, "valid": true }' | parse_json %}
  {% if object.title == blank %}
    {% assign field_errors = c.errors.title | default: '[]' | parse_json | add_to_array: "can't be blank" %}
    {% hash_assign c['errors']['title'] = field_errors %}
    {% hash_assign c['valid'] = false %}
  {% endif %}
  {% assign object = object | hash_merge: c %}

  {% if object.valid %}
    {% graphql r = 'products/create', args: object %}
    {% assign object = r.record_create %}
    {% hash_assign object['valid'] = true %}
  {% endif %}
{% endif %}
{% return object %}
```

## Debugging Commands

Use the `{% log %}` tag to inspect command state at each stage:

```liquid
{% comment %} After BUILD {% endcomment %}
{% parse_json object %}
  { "title": {{ title | json }}, "price": {{ price | json }} }
{% endparse_json %}
{% log object, type: 'debug: after build' %}

{% comment %} After CHECK {% endcomment %}
{% assign c = '{ "errors": {}, "valid": true }' | parse_json %}
{% if object.title == blank %}
  {% assign field_errors = c.errors.title | default: '[]' | parse_json | add_to_array: "can't be blank" %}
  {% hash_assign c['errors']['title'] = field_errors %}
  {% hash_assign c['valid'] = false %}
{% endif %}
{% assign object = object | hash_merge: c %}
{% log object, type: 'debug: after check' %}
```

Monitor output with `insites-cli logs` to see the object state at each step.

## See Also

- [README.md](README.md) -- Commands overview
- [configuration.md](configuration.md) -- File layout and setup
- [api.md](api.md) -- Validator helpers and stage details
- [patterns.md](patterns.md) -- Standard patterns to build on
- [gotchas.md](gotchas.md) -- Common errors and limits
- [Background Jobs](../background-jobs/) -- Async execution details
- [Events & Consumers](../events-consumers/) -- Event publishing from commands
- [Caching](../caching/) -- Caching strategies around commands
