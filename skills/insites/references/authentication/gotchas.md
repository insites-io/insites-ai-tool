# Authentication -- Gotchas & Limits

Common errors and platform constraints when working with authentication and authorization.

## Common Errors

### "context.current_user is null after form submission"

**Cause:** The CSRF token (`authenticity_token`) is missing from the form. On non-GET requests, Insites nullifies `context.current_user` when the token is absent or invalid.

**Solution:** Add the hidden CSRF field to every non-GET form:

```html
<input type="hidden" name="authenticity_token" value="{{ context.authenticity_token }}">
```

### "User appears anonymous despite being logged in"

**Cause:** `context.current_user` only contains basic fields (id, email). It does not include roles or custom properties. If you check roles on `context.current_user` directly, they will be nil.

**Solution:** Load the full profile with roles via GraphQL:

```liquid
{% liquid
  if context.current_user
    graphql g = 'users/current', id: context.current_user.id
    assign profile = g.users.results.first
  else
    assign profile = null
  endif
%}
```

### "Permission check always returns false"

**Cause:** The action string in the page does not match any entry in your permissions map. Action strings are exact matches -- no wildcards. Or the user's roles array does not include the expected role.

**Solution:** Verify the action string in your permissions partial matches exactly what you check, and that the user has the correct role assigned:

```liquid
{% comment %} In permissions.liquid: "editor": ["article.create"] {% endcomment %}
{% comment %} In page -- must match exactly: {% endcomment %}
{% liquid
  assign permissions = '{"admin": ["article.create", "article.update", "article.delete"], "editor": ["article.create"], "superadmin": []}' | parse_json
  assign can = false
  for role in profile.roles
    if permissions[role] contains 'article.create'
      assign can = true
      break
    endif
  endfor
%}
```

Also verify the user's roles are stored correctly as a `property_array`:

### "403 error on admin pages after deploying updated permissions"

**Cause:** The inline permissions `parse_json` block has a syntax error (invalid JSON) or is missing the updated role. If using `authorization_policies/`, the policy file may have a logic error.

**Solution:** Validate the JSON inside `parse_json` carefully. Test by logging the output:

```liquid
{% log permissions, type: 'debug' %}
```

For authorization policies, verify the policy returns `true` or `false` correctly by testing with `{% log %}` inside the policy file.

### "sign_in tag has no effect"

**Cause:** The `user_id` parameter is `nil` or references a non-existent user. This typically happens when the authentication query returned no results but the code did not check for that.

**Solution:** Always verify the user exists before signing in:

```liquid
{% if user.user == blank %}
  {% comment %} Handle invalid credentials {% endcomment %}
  {% break %}
{% endif %}
{% sign_in user_id: user.user.id %}
```

### "Session expires unexpectedly"

**Cause:** `timeout_in_minutes` was set too low, or omitted on a subsequent `sign_in` call which reset the timeout to the platform default.

**Solution:** Set `timeout_in_minutes` explicitly on every `sign_in` call:

```liquid
{% sign_in user_id: user.id, timeout_in_minutes: 1440 %}
```

### "authorization_policies/ not working as expected"

**Cause:** Authorization policies must return `true` or `false`. Common issues include: not loading the user profile inside the policy, returning a string instead of a boolean, or a typo in the policy name referenced in front matter.

**Solution:** Ensure your policy loads the profile and returns a boolean:

```liquid
{% comment %} app/authorization_policies/require_login.liquid {% endcomment %}
---
name: require_login
---
{% liquid
  if context.current_user
    return true
  endif
  return false
%}
```

And reference it correctly in the page front matter (use the `name` value, not the filename):

```yaml
authorization_policies:
  - require_login
```

## Limits

| Limit | Value | Notes |
|-------|-------|-------|
| Max custom roles | No hard limit | Defined in permissions.liquid JSON |
| Max actions per role | No hard limit | Keep lists manageable for maintenance |
| Session timeout range | 1 -- 525600 min | 525600 = 1 year |
| CSRF token lifetime | Tied to session | Expires when session expires |
| `superadmin` override | Always bypasses | Cannot be restricted per-action |
| Password min length | Platform default | Configurable via user module settings |
| Concurrent sessions | Unlimited | Each device/browser gets its own session |

## See Also

- [Authentication Overview](README.md) -- introduction and key concepts
- [Authentication Configuration](configuration.md) -- role and permission setup
- [Authentication API](api.md) -- tags and helpers reference
- [Authentication Patterns](patterns.md) -- correct usage patterns
- [Authentication Advanced](advanced.md) -- edge cases and complex scenarios
- [Forms Gotchas](../forms/gotchas.md) -- CSRF-related form issues
