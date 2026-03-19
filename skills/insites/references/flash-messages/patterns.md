# Flash Messages Patterns

## Overview

Common patterns for implementing flash messages in Insites applications.

## Basic Form Submission with Success Message

After successful form submission, redirect with confirmation:

```liquid
{% liquid
  function result = 'lib/commands/users/create', params: context.params
  if result.errors == blank
    parse_json flash
      { "notice": "user.created_successfully", "from": {{ context.location.pathname | json }} }
    endparse_json
    session sflash = flash
    redirect_to '/users'
    break
  endif
  parse_json flash
    { "alert": "form.validation_failed", "from": {{ context.location.pathname | json }} }
  endparse_json
  session sflash = flash
%}
```

## Conditional Alerts Based on Action

Show different messages for different outcomes:

```liquid
{% liquid
  if action == 'delete'
    if deletion_successful
      parse_json flash
        { "notice": "item.deleted", "from": "/items" }
      endparse_json
      session sflash = flash
      redirect_to '/items'
      break
    else
      parse_json flash
        { "alert": "item.deletion_failed", "from": "/items" }
      endparse_json
      session sflash = flash
      redirect_to '/items'
      break
    endif
  endif
%}
```

## Multi-Step Form with Warnings

Warn users during multi-step processes:

```liquid
{% liquid
  if current_step == 2
    if incomplete_required_fields.size > 0
      parse_json flash
        { "warning": "form.step_2_incomplete_fields", "from": "/form/step-2" }
      endparse_json
      session sflash = flash
      redirect_to '/form/step-2'
      break
    else
      parse_json flash
        { "notice": "form.step_2_complete", "from": "/form/step-3" }
      endparse_json
      session sflash = flash
      redirect_to '/form/step-3'
      break
    endif
  endif
%}
```

## Displaying Flash with Localization

Render localized flash messages in layout:

```liquid
{%- assign flash = context.session.sflash | parse_json -%}

{% if flash %}
  {% if flash.notice %}
    <div class="alert alert-success">
      <i class="icon-check"></i>
      {{ flash.notice | t }}
    </div>
  {% endif %}

  {% if flash.alert %}
    <div class="alert alert-danger">
      <i class="icon-error"></i>
      {{ flash.alert | t }}
    </div>
  {% endif %}

  {% if flash.warning %}
    <div class="alert alert-warning">
      <i class="icon-warning"></i>
      {{ flash.warning | t }}
    </div>
  {% endif %}

  {% if flash.info %}
    <div class="alert alert-info">
      <i class="icon-info"></i>
      {{ flash.info | t }}
    </div>
  {% endif %}
{% endif %}
```

## JavaScript Toast from Server

Trigger toast notifications from server actions:

```liquid
<script>
  {%- assign flash = context.session.sflash | parse_json -%}
  {% if flash.notice %}
    new pos.modules.toast('success', '{{ flash.notice | t }}');
  {% endif %}
  {% if flash.alert %}
    new pos.modules.toast('error', '{{ flash.alert | t }}');
  {% endif %}
</script>
```

## Persistent Flash Across Pages

Keep flash visible until user manually closes:

```liquid
{%- assign flash = context.session.sflash | parse_json -%}

{% if flash %}
  <div class="alert" id="flash-message" role="alert">
    <button type="button" class="close" aria-label="Close">
      <span aria-hidden="true">&times;</span>
    </button>
    <div class="alert-content">
      {{ flash.notice | t | default: flash.alert | t }}
    </div>
  </div>

  <script>
    document.querySelector('.close').addEventListener('click', function() {
      document.getElementById('flash-message').style.display = 'none';
    });
  </script>
{% endif %}
```

## Contextual Flash Messages

Show different messages based on user role:

```liquid
{%- assign flash = context.session.sflash | parse_json -%}

{% if context.current_user.role == 'admin' %}
  {% assign flash_key = flash.notice | append: '.admin' %}
{% else %}
  {% assign flash_key = flash.notice %}
{% endif %}

{{ flash_key | t }}
```

## AJAX Request Flash Messages

Handle flash after AJAX form submissions:

```javascript
fetch('/api/form-submit', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    new pos.modules.toast('success', data.message);
  } else {
    new pos.modules.toast('error', data.error);
  }
});
```

## Flash Message Counter

Show notification with count:

```liquid
{% liquid
  parse_json flash
    { "notice": "items.bulk_imported", "from": "/dashboard" }
  endparse_json
  session sflash = flash
  redirect_to '/dashboard'
  break
%}
```

Use in layout:

```liquid
{%- assign flash = context.session.sflash | parse_json -%}
{% if flash.notice contains 'bulk_imported' %}
  {{ flash.notice | t: count: imported_count }}
{% endif %}
```

## See Also

- [Configuration Guide](./configuration.md)
- [API Reference](./api.md)
- [Known Gotchas](./gotchas.md)
- [Advanced Techniques](./advanced.md)
