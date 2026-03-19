# Flash Messages & Toasts

Flash messages provide user feedback after actions (success, error notifications).

## Layout Setup

Add before `</body>` in your layout:

```liquid
{% liquid
  assign flash = context.session.sflash | parse_json
  if context.location.pathname != flash.from or flash.force_clear
    session sflash = null
  endif
  render 'shared/toasts', params: flash
%}
```

## Server-Side Flash Messages

### Set flash and redirect
```liquid
{% liquid
  parse_json flash
    { "notice": "app.products.created", "from": {{ context.location.pathname | json }} }
  endparse_json
  session sflash = flash
  redirect_to '/products'
  break
%}
```

### Set flash with alert and redirect
```liquid
{% liquid
  parse_json flash
    { "alert": "app.products.error", "from": {{ context.location.pathname | json }} }
  endparse_json
  session sflash = flash
  redirect_to '/products'
  break
%}
```

### Simple redirect (no flash)
```liquid
{% redirect_to '/products' %}
```

## Client-Side Toasts (JavaScript)

```javascript
new pos.modules.toast('success', 'Saved successfully!');
new pos.modules.toast('error', 'Something went wrong');
new pos.modules.toast('warning', 'Please check your input');
new pos.modules.toast('info', 'Processing your request...');
```

## Flash Message Types

| Type | Usage |
|------|-------|
| `notice` | Success messages |
| `alert` | Error messages |
| `warning` | Warning messages |
| `info` | Informational messages |
