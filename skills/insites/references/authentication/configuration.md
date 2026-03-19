# Authentication -- Configuration Reference

This document covers all configuration files, role definitions, and session options for the authentication system.

## Permission File

The permissions matrix maps roles to action strings. Override it to define custom roles.

### Location

Define the permissions map inline using `parse_json` wherever you need to check permissions:

### Permission map format

```liquid
{% parse_json permissions %}
  {
    "anonymous": ["sessions.create", "users.register"],
    "authenticated": ["sessions.destroy"],
    "admin": [
      "admin_pages.view",
      "admin.users.manage",
      "products.create",
      "products.update",
      "products.delete"
    ],
    "editor": [
      "article.create",
      "article.update",
      "article.delete",
      "article.view"
    ],
    "viewer": [
      "article.view"
    ],
    "superadmin": []
  }
{% endparse_json %}
```

For reuse, place the permissions map in a dedicated partial that returns it via `{% return permissions %}`.

**Important:** `superadmin` is listed with an empty array because the role check logic automatically grants all permissions to superadmins. You must still include the key so the role is recognized.

### Action string conventions

| Pattern | Example | Meaning |
|---------|---------|---------|
| `resource.verb` | `products.create` | Standard CRUD action |
| `namespace.action` | `admin.view` | Area-level access |
| `resource.*` | N/A (not supported) | Wildcards are NOT supported; list each action |

## Built-in Roles

| Role | Stored Value | Behavior |
|------|-------------|----------|
| `anonymous` | No user record | Unauthenticated visitor; checked when `profile` is nil |
| `authenticated` | Any user with a session | Passes any check that lists `authenticated` |
| `superadmin` | User with `superadmin` role | Bypasses ALL permission checks automatically |

### Assigning roles to users

Roles are stored as a `property_array` on the user record. Set them via GraphQL when creating or updating a user:

```graphql
mutation set_roles($id: ID!, $roles: [String!]!) {
  user_update(id: $id, user: {
    properties: [{ name: "roles", value_array: $roles }]
  }) {
    id
  }
}
```

To read roles back, query with `property_array(name: "roles")`:

```graphql
query get_user($id: ID!) {
  users(per_page: 1, filter: { id: { value: $id } }) {
    results {
      id
      email
      roles: property_array(name: "roles")
    }
  }
}
```

## Session Configuration

### Sign-in options

```liquid
{% sign_in user_id: user.id %}
{% sign_in user_id: user.id, timeout_in_minutes: 60 %}
{% sign_in user_id: user.id, timeout_in_minutes: 1440 %}
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `user_id` | ID | required | The user record ID to authenticate |
| `timeout_in_minutes` | Integer | Platform default | Session duration in minutes |

### Sign-out

```liquid
{% sign_out %}
```

No parameters. Destroys the current session immediately. Under the hood this executes the `user_session_destroy` GraphQL mutation.

## CSRF Token Configuration

Non-GET requests MUST include the CSRF token. Without it, `context.current_user` is `null` and the user appears unauthenticated.

```html
<form method="post" action="/login">
  <input type="hidden" name="authenticity_token" value="{{ context.authenticity_token }}">
  <!-- fields -->
</form>
```

For AJAX requests, include the token as a header or form field:

```javascript
fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    authenticity_token: document.querySelector('[name="authenticity_token"]').value,
    // ...payload
  })
});
```

## File Structure

```
app/
├── authorization_policies/
│   └── admin_only.liquid                          # Page-level authorization policy
├── views/
│   └── pages/
│       ├── sessions/
│       │   ├── new.liquid                        # GET  /sessions/new  (login form)
│       │   ├── create.liquid                     # POST /sessions      (sign in)
│       │   └── destroy.liquid                    # DELETE /sessions     (sign out)
│       └── registrations/
│           ├── new.liquid                        # GET  /registrations/new
│           └── create.liquid                     # POST /registrations
└── graphql/
    └── users/
        ├── create.graphql                        # Registration mutation
        ├── find.graphql                          # Lookup by email
        └── update_role.graphql                   # Role assignment
```

## Environment Considerations

- **Staging vs Production:** Permission files are deployed with the codebase. Role data lives in the database. Ensure test users on staging have appropriate roles.
- **Authorization policies:** When using `authorization_policies/` in page front matter, the platform enforces them before the page renders. This is the cleanest approach for full-page guards.

## See Also

- [Authentication Overview](README.md) -- introduction and key concepts
- [Authentication API](api.md) -- Liquid tags and helpers
- [Authentication Patterns](patterns.md) -- login flow, guards, role-based rendering
- [Authentication Gotchas](gotchas.md) -- common configuration errors
- [Forms Configuration](../forms/configuration.md) -- CSRF and form setup
