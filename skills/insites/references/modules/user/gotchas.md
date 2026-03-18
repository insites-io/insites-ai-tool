# modules/user - Common Gotchas

## Critical: Do NOT Use Direct Context Access
Never access user context directly:

```liquid
<!-- WRONG - DO NOT DO THIS -->
{% if context.current_user %}
  <!-- This bypasses authorization checks -->
{% endif %}
```

Always use the module helpers:
```liquid
<!-- CORRECT -->
{% query_graph 'modules/user/queries/user/current' %}
{% if current_user %}
  <!-- proper authorization -->
{% endif %}
```

## Critical: Do NOT Use authorization_policies/ Directly
Never reference authorization policy files directly:

```liquid
<!-- WRONG -->
{% include 'app/authorization_policies/admin_only' %}
```

Always use the helpers:
```liquid
<!-- CORRECT -->
{% include 'modules/user/helpers/can_do_or_redirect' with_action: 'admin_access' %}
```

## Role-Based Logic Errors

### Checking Single Role
Don't check for single string:
```liquid
<!-- WRONG -->
{% if current_user.roles == 'admin' %}
```

Use array operations:
```liquid
<!-- CORRECT -->
{% if current_user.roles contains 'admin' %}
```

## Permission Caching Issues
Permissions are checked at request time. Don't cache permission results across requests:

```liquid
<!-- WRONG - caching permission in page data -->
{% assign can_edit = true %}
<!-- later... permission might have changed -->
```

Check permissions fresh each time:
```liquid
<!-- CORRECT -->
{% include 'modules/user/helpers/can_do' with_action: 'edit_post' %}
```

## OAuth2 Common Issues

### Missing State Parameter
Always validate OAuth state to prevent CSRF:
```liquid
<!-- Insites handles this automatically -->
<!-- but verify in your callback -->
```

### Token Expiration
Handle expired tokens gracefully:
```liquid
{% if user.oauth_token_expired %}
  <!-- redirect to refresh flow -->
{% endif %}
```

## Password Reset Gotchas
Don't expose user existence through password resets:

```liquid
<!-- WRONG - tells attackers if email exists -->
{% if user_exists %}
  Password reset email sent
{% else %}
  Email not found
{% endif %}

<!-- CORRECT - always same message -->
If that email exists, you'll receive a reset link.
```

## See Also
- configuration.md - Setup instructions
- api.md - API reference
- patterns.md - Correct patterns
- advanced.md - Advanced techniques
