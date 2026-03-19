# Flash Messages API Reference

## Overview

Insites provides flash messages using the built-in `session` tag and `context.session` for setting and rendering temporary notifications.

## Setting Flash Messages

### Redirect with Flash Message

Set flash message and redirect:

```liquid
{% parse_json flash %}
  { "notice": "user.profile_updated", "from": {{ context.location.pathname | json }} }
{% endparse_json %}
{% liquid
  assign flash_json = flash | json
  session sflash = flash_json
  redirect_to '/dashboard'
  break
%}
```

The `notice` value accepts:

- Localization key: `'user.profile_updated'` -> resolves via `| t` filter in templates
- Dynamic text: `'Welcome ' | append: user.name`

### Flash Message Properties

The flash JSON object supports these properties:

| Property | Type | Description |
|----------|------|-------------|
| `notice` | String | Success/info message (notice type) |
| `alert` | String | Error message (alert type) |
| `warning` | String | Warning message (warning type) |
| `info` | String | Informational message (info type) |
| `from` | String | Pathname to match for auto-clear |

### Set Flash Message Only (no redirect)

```liquid
{% parse_json flash %}
  { "notice": "changes_saved", "from": {{ context.location.pathname | json }} }
{% endparse_json %}
{% liquid
  assign flash_json = flash | json
  session sflash = flash_json
%}
```

### Simple redirect (no flash)

```liquid
{% redirect_to '/dashboard' %}
```

## Getting Flash Messages

### Retrieve Flash from Session

```liquid
{% liquid
  assign flash = context.session.sflash | parse_json
  if flash
    assign notice = flash.notice
    assign alert = flash.alert
  endif
%}
```

### Check Flash Existence

```liquid
{% liquid
  assign flash = context.session.sflash | parse_json
  if flash.notice
    assign notice_text = flash.notice | t
  endif
  if flash.alert
    assign error_text = flash.alert | t
  endif
%}
```

## Clearing Flash Messages

### Automatic Clearing

Flash messages automatically clear when:
- Page pathname changes (via layout flash handling)
- Session expires
- Explicit clear is called

### Manual Clear

Clear flash messages programmatically:

```liquid
{% session sflash = null %}
```

## JavaScript Toast Implementation

Create toast notifications from JavaScript:

```javascript
new pos.modules.toast('success', 'Profile updated successfully');
new pos.modules.toast('error', 'An error occurred');
new pos.modules.toast('warning', 'Please review your changes');
new pos.modules.toast('info', 'Remember to save your work');
```

### Toast Constructor Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| Type | String | 'success', 'error', 'warning', 'info' |
| Message | String | Toast message text |
| Duration | Number | Optional: milliseconds to show (default: 3000) |

## Toast Duration Control

```javascript
new pos.modules.toast('success', 'Message', 5000); // 5 seconds
new pos.modules.toast('info', 'Persistent message', 0); // Never auto-dismiss
```

## Flash Message Structure

Flash messages follow this structure in session:

```json
{
  "notice": "i18n.key.or.text",
  "alert": null,
  "warning": null,
  "info": null,
  "pathname": "/current/path"
}
```

## Combining Multiple Flash Types

Set multiple flash messages in redirect:

```liquid
{% parse_json flash %}
  { "notice": "partial_save", "warning": "some_fields_required", "from": {{ context.location.pathname | json }} }
{% endparse_json %}
{% liquid
  assign flash_json = flash | json
  session sflash = flash_json
  redirect_to '/form'
  break
%}
```

Only one message per type is supported simultaneously.

## Liquid Filters with Flash

Apply Liquid filters to flash messages:

```liquid
{%- assign flash = context.session.sflash | parse_json -%}
{% if flash.notice %}
  <div class="flash">
    {{ flash.notice | t | upcase }}
  </div>
{% endif %}
```

## Response Headers

When using `redirect_to`, HTTP headers are set:

```
Location: /dashboard
Set-Cookie: sflash={"notice":"i18n.key"}; ...
```

The cookie automatically manages flash lifecycle.

## See Also

- [Configuration Guide](./configuration.md)
- [Common Patterns](./patterns.md)
- [Known Gotchas](./gotchas.md)
- [Advanced Techniques](./advanced.md)
