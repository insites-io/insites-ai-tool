---
name: pos-auth-expansion
description: Expansion module for implementing roles, permissions, and authorization in Insites
---

# Role-Based Access Control & User Management

## Overview

This expansion module extends the `user-auth` skill with **Role-Based Access Control (RBAC)**, administrative interfaces, and fine-grained authorization. YOU MUST have completed the base authentication skill before implementing these features.

**PREREQUISITE:** Base authentication MUST be fully functional before adding authorization.

This module covers:
- Profile-based role management
- Permission configuration and customization
- Authorization helpers (`can_do`, `can_do_or_unauthorized`, `can_do_or_redirect`)
- Admin page protection
- Permission-aware navigation
- Role assignment via GUI and code

---

## Part 1: Understanding Roles and Permissions

### 1.1 The RBAC Model

Insites implements authorization through three interconnected elements:

```
User → Profile → Roles → Permissions
```

| Element | Description | Relationship |
|---------|-------------|--------------|
| **User** | Authentication identity (email/password) | One-to-one with Profile |
| **Profile** | Extended identity with roles | Belongs to User |
| **Role** | Named permission bundle | Many-to-many with Profile |
| **Permission** | Specific capability | Contained within Roles |

**CRITICAL RULE:** Roles belong to PROFILES, not Users. Always reference profile ID for role operations.

### 1.2 Built-in Roles

The User Module provides four standard roles:

| Role | Auto-Assigned | Purpose | Typical Permissions |
|------|---------------|---------|---------------------|
| `anonymous` | Yes (logged out) | Guest access | `sessions.create`, `users.register` |
| `authenticated` | Yes (logged in) | Basic user access | `profile.view`, `dashboard.access` |
| `admin` | No (manual) | Administrative access | `admin.view`, `users.manage` |
| `superadmin` | No (manual) | Full system access | All permissions |

### 1.3 Permission Naming Convention

**YOU MUST follow this convention:** `resource.action`

```
admin.view          # View admin pages
users.manage        # Manage user accounts
posts.create        # Create posts
posts.edit          # Edit posts
posts.delete        # Delete posts
settings.modify     # Modify settings
```

**NEVER use:**
- Role names in permission checks
- Generic names like `access` or `allowed`
- Inconsistent naming patterns

---

## Part 2: Configuring Custom Permissions

### 2.1 Override Permissions File

**NEVER modify files in `modules/` directory.** Create an override in `app/`:

```bash
mkdir -p app/modules/user/public/lib/queries/role_permissions
cp modules/user/public/lib/queries/role_permissions/permissions.liquid \
   app/modules/user/public/lib/queries/role_permissions/permissions.liquid
```

Insites automatically prioritizes `app/` over `modules/`.

### 2.2 Permissions File Structure

**File:** `app/modules/user/public/lib/queries/role_permissions/permissions.liquid`

```liquid
{% liquid
  assign permissions = null | hash

  # Anonymous users (not logged in)
  assign permissions['anonymous'] = 'sessions.create,users.register,passwords.reset' | split: ','

  # All authenticated users
  assign permissions['authenticated'] = 'profile.view,profile.edit,dashboard.access,sessions.destroy' | split: ','

  # Manager role (custom)
  assign permissions['manager'] = 'admin.view,users.list,reports.view' | split: ','

  # Admin role
  assign permissions['admin'] = 'admin.view,admin.manage,users.list,users.edit,users.delete,settings.view' | split: ','

  # Superadmin role (all permissions)
  assign permissions['superadmin'] = 'admin.view,admin.manage,users.list,users.edit,users.delete,users.create,settings.view,settings.modify,system.manage' | split: ','

  return permissions
%}
```

### 2.3 Adding New Roles

To add a custom role (e.g., `editor`):

```liquid
# Editor role - can manage content but not users
assign permissions['editor'] = 'admin.view,posts.create,posts.edit,posts.delete,media.upload' | split: ','
```

**After modifying permissions, YOU MUST:**
1. Deploy changes: `insites-cli deploy staging`
2. Test permission grants work correctly
3. Verify permission denials work correctly

---

## Part 3: Authorization Helpers

### 3.1 The `can_do` Helper

Returns `true` or `false`. Use for conditional UI rendering.

```liquid
{% liquid
  function current_profile = 'modules/user/helpers/current_profile'
  function can_view_admin = 'modules/user/helpers/can_do', requester: current_profile, do: 'admin.view'

  if can_view_admin
    echo 'You have admin access'
  else
    echo 'Access denied'
  endif
%}
```

**Use `can_do` when:**
- Conditionally showing/hiding UI elements
- Making non-critical access decisions
- Building permission-aware menus

### 3.2 The `can_do_or_unauthorized` Helper

Halts request and returns HTTP 403 if unauthorized. Use for protecting entire pages.

```liquid
{% liquid
  function current_profile = 'modules/user/helpers/current_profile'

  include 'modules/user/helpers/can_do_or_unauthorized',
    requester: current_profile,
    do: 'admin.view',
    redirect_anonymous_to_login: true
%}

<!-- This content only renders if authorized -->
<h1>Admin Dashboard</h1>
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requester` | object | Yes | The current profile |
| `do` | string | Yes | Permission to check |
| `redirect_anonymous_to_login` | bool | No | Redirect guests to login instead of 403 |

**Use `can_do_or_unauthorized` when:**
- Protecting sensitive pages completely
- Admin dashboards
- User management interfaces
- Any page that should NEVER partially render

### 3.3 The `can_do_or_redirect` Helper

Redirects unauthorized users to a specified URL. Better UX than 403.

```liquid
{% liquid
  function current_profile = 'modules/user/helpers/current_profile'

  include 'modules/user/helpers/can_do_or_redirect',
    requester: current_profile,
    do: 'premium.access',
    return_url: '/upgrade'
%}

<!-- Premium content here -->
```

**Use `can_do_or_redirect` when:**
- Users might gain access through purchase/upgrade
- Soft access restrictions
- Feature gating with upsell opportunity

### 3.4 Helper Selection Matrix

| Scenario | Helper | Reason |
|----------|--------|--------|
| Show/hide nav link | `can_do` | UI conditional only |
| Protect admin page | `can_do_or_unauthorized` | Hard block, security critical |
| Premium feature gate | `can_do_or_redirect` | UX-friendly, conversion opportunity |
| API endpoint protection | `can_do_or_unauthorized` | Must return proper HTTP status |
| Conditional form field | `can_do` | Partial rendering acceptable |

---

## Part 4: Creating Protected Admin Pages

### 4.1 Admin Page Structure

**Directory:** `app/views/pages/admin/`

```
app/views/pages/admin/
├── index.liquid          # Admin dashboard
├── users/
│   ├── index.liquid      # User list
│   └── edit.liquid       # Edit user
└── settings/
    └── index.liquid      # Settings page
```

### 4.2 Basic Admin Dashboard

**File:** `app/views/pages/admin/index.liquid`

```liquid
---
slug: admin
---

{% liquid
  # Load current profile
  function current_profile = 'modules/user/helpers/current_profile'

  # AUTHORIZATION CHECK - MANDATORY
  include 'modules/user/helpers/can_do_or_unauthorized',
    requester: current_profile,
    do: 'admin.view',
    redirect_anonymous_to_login: true
%}

<h1>Admin Dashboard</h1>

<nav class="admin-nav">
  {% liquid
    function can_manage_users = 'modules/user/helpers/can_do', requester: current_profile, do: 'users.manage'
    function can_view_settings = 'modules/user/helpers/can_do', requester: current_profile, do: 'settings.view'
  %}

  <ul>
    <li><a href="/admin">Dashboard</a></li>

    {% if can_manage_users %}
      <li><a href="/admin/users">Manage Users</a></li>
    {% endif %}

    {% if can_view_settings %}
      <li><a href="/admin/settings">Settings</a></li>
    {% endif %}
  </ul>
</nav>

<main>
  <p>Welcome to the admin area, {{ current_profile.email }}.</p>
</main>
```

### 4.3 User Management Page

**File:** `app/views/pages/admin/users/index.liquid`

```liquid
---
slug: admin/users
---

{% liquid
  function current_profile = 'modules/user/helpers/current_profile'

  include 'modules/user/helpers/can_do_or_unauthorized',
    requester: current_profile,
    do: 'users.manage',
    redirect_anonymous_to_login: true

  # Fetch all users
  graphql users = 'admin/users/list'
%}

<h1>User Management</h1>

<table class="pos-table">
  <thead>
    <tr>
      <th>ID</th>
      <th>Email</th>
      <th>Created</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {% for user in users.users.results %}
      <tr>
        <td>{{ user.id }}</td>
        <td>{{ user.email }}</td>
        <td>{{ user.created_at | date: '%Y-%m-%d' }}</td>
        <td>
          <a href="/admin/users/{{ user.id }}/edit">Edit</a>
        </td>
      </tr>
    {% endfor %}
  </tbody>
</table>
```

**GraphQL:** `app/graphql/admin/users/list.graphql`

```graphql
query {
  users(per_page: 100, sort: { created_at: { order: DESC } }) {
    results {
      id
      email
      created_at
    }
  }
}
```

---

## Part 5: Permission-Aware Navigation

### 5.1 Layout with Full Authorization

**File:** `app/views/layouts/application.liquid`

```liquid
<!DOCTYPE html>
<html class="pos-app">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.metadata.title | default: 'My App' }}</title>
</head>
<body>

{% liquid
  # Load profile once, reuse throughout layout
  if context.exports.current_profile
    assign current_profile = context.exports.current_profile
  elsif context.current_user
    function current_profile = 'modules/user/helpers/current_profile'
  endif

  # Pre-compute permissions for navigation
  if current_profile
    function can_view_admin = 'modules/user/helpers/can_do', requester: current_profile, do: 'admin.view'
    function can_manage_users = 'modules/user/helpers/can_do', requester: current_profile, do: 'users.manage'
  endif
%}

<nav>
  <a href="/">Home</a>

  {% if current_profile %}
    <span>Welcome, {{ current_profile.email }}</span>

    {% comment %} Permission-based navigation {% endcomment %}
    {% if can_view_admin %}
      <a href="/admin">Admin</a>
    {% endif %}

    {% if can_manage_users %}
      <a href="/admin/users">Users</a>
    {% endif %}

    <form action="/sessions" method="post" style="display: inline;">
      <input type="hidden" name="authenticity_token" value="{{ context.authenticity_token }}">
      <input type="hidden" name="_method" value="delete">
      <button type="submit">Logout</button>
    </form>

  {% else %}
    <a href="/sessions/new">Login</a>
    <a href="/users/new">Register</a>
  {% endif %}
</nav>

<main>
  {{ content_for_layout }}
</main>

</body>
</html>
```

### 5.2 Navigation Security Rules

**ABSOLUTE RULES:**

1. **Never rely on hidden navigation for security** - Always check permissions on the page itself
2. **Check permissions server-side** - Client-side hiding is UX, not security
3. **Use `can_do_or_unauthorized` on protected pages** - Even if nav is hidden
4. **Cache profile loading** - Use `context.exports` to avoid duplicate queries

---

## Part 6: Assigning Roles to Users

### 6.1 Method 1: Via GUI Admin

1. Run `insites-cli gui serve staging`
2. Navigate to `http://localhost:3333`
3. Go to Database → `modules/user/profiles`
4. Find the user's profile record
5. Edit the `roles` field (JSON array):
   ```json
   ["authenticated", "manager"]
   ```
6. Save the record

### 6.2 Method 2: Via Liquid Commands

**Role Management Commands:**

| Command | Purpose |
|---------|---------|
| `modules/user/commands/profiles/roles/append` | Add role (preserves existing) |
| `modules/user/commands/profiles/roles/remove` | Remove specific role |
| `modules/user/commands/profiles/roles/set` | Replace all roles |

**CRITICAL:** Commands require PROFILE ID, not User ID.

#### Finding Profile ID

```liquid
{% liquid
  # From current user
  function current_profile = 'modules/user/helpers/current_profile'
  assign profile_id = current_profile.id

  # Or query by user
  graphql profile = 'user/profile_by_user_id', user_id: user.id
  assign profile_id = profile.profiles.results.first.id
%}
```

#### Append Role (Add without removing existing)

```liquid
{% liquid
  function result = 'modules/user/commands/profiles/roles/append',
    id: profile_id,
    role: 'manager'

  if result.valid
    echo 'Role added successfully'
  else
    echo result.errors
  endif
%}
```

#### Remove Role

```liquid
{% liquid
  function result = 'modules/user/commands/profiles/roles/remove',
    id: profile_id,
    role: 'manager'

  if result.valid
    echo 'Role removed successfully'
  else
    echo result.errors
  endif
%}
```

#### Set Roles (Replace all)

```liquid
{% liquid
  function result = 'modules/user/commands/profiles/roles/set',
    id: profile_id,
    roles: 'authenticated,editor'

  if result.valid
    echo 'Roles updated successfully'
  else
    echo result.errors
  endif
%}
```

### 6.3 Practical Use Cases for Role Assignment

| Scenario | Command | Trigger |
|----------|---------|---------|
| User purchases premium | `append` with `premium` | Payment webhook |
| Subscription expires | `remove` with `premium` | Cron job |
| Admin promotes user | `append` with `manager` | Admin action |
| New user onboarding | `set` with initial roles | Registration |
| Temporary access grant | `append` + scheduled `remove` | Time-limited feature |

---

## Part 7: Creating Role Assignment Admin Interface

### 7.1 User Edit Page with Role Management

**File:** `app/views/pages/admin/users/edit.liquid`

```liquid
---
slug: admin/users/:id/edit
---

{% liquid
  function current_profile = 'modules/user/helpers/current_profile'

  include 'modules/user/helpers/can_do_or_unauthorized',
    requester: current_profile,
    do: 'users.edit',
    redirect_anonymous_to_login: true

  # Get user and their profile
  assign user_id = context.params.id
  graphql user_data = 'admin/users/get', id: user_id
  assign user = user_data.users.results.first
  assign profile = user_data.profiles.results.first
%}

<h1>Edit User: {{ user.email }}</h1>

<form action="/admin/users/{{ user_id }}/update-roles" method="post">
  <input type="hidden" name="authenticity_token" value="{{ context.authenticity_token }}">
  <input type="hidden" name="profile_id" value="{{ profile.id }}">

  <fieldset>
    <legend>Roles</legend>

    {% assign available_roles = 'authenticated,manager,editor,admin' | split: ',' %}

    {% for role in available_roles %}
      {% assign has_role = false %}
      {% for user_role in profile.roles %}
        {% if user_role == role %}
          {% assign has_role = true %}
        {% endif %}
      {% endfor %}

      <label>
        <input
          type="checkbox"
          name="roles[]"
          value="{{ role }}"
          {% if has_role %}checked{% endif %}
        >
        {{ role | capitalize }}
      </label>
    {% endfor %}
  </fieldset>

  <button type="submit" class="pos-button pos-button-primary">Save Roles</button>
</form>

<a href="/admin/users">Back to Users</a>
```

### 7.2 Role Update Endpoint

**File:** `app/views/pages/admin/users/update-roles.liquid`

```liquid
---
slug: admin/users/:id/update-roles
method: post
---

{% liquid
  function current_profile = 'modules/user/helpers/current_profile'

  include 'modules/user/helpers/can_do_or_unauthorized',
    requester: current_profile,
    do: 'users.edit',
    redirect_anonymous_to_login: true

  assign profile_id = context.params.profile_id
  assign new_roles = context.params.roles | default: '' | join: ','

  # Ensure authenticated role is always present
  unless new_roles contains 'authenticated'
    assign new_roles = 'authenticated,' | append: new_roles
  endunless

  function result = 'modules/user/commands/profiles/roles/set',
    id: profile_id,
    roles: new_roles

  if result.valid
    redirect_to '/admin/users/' | append: context.params.id | append: '/edit?success=1'
  else
    redirect_to '/admin/users/' | append: context.params.id | append: '/edit?error=1'
  endif
%}
```

---

## Part 8: Testing Authorization

### 8.1 Authorization Test File

**File:** `app/lib/test/auth/authorization_test.liquid`

```liquid
{% comment %}
  Test: Authorization System
  Purpose: Verify roles and permissions work correctly
{% endcomment %}

{% liquid
  function contract = 'modules/tests/helpers/init'

  # ============================================
  # SETUP: Create test user with profile
  # ============================================
  assign test_email = 'auth_test_' | append: context.now | append: '@example.com'

  graphql user = 'user/create', email: test_email, password: 'TestPass123'
  assign user_id = user.user_create.id

  # Get profile ID
  graphql profile_data = 'user/profile_by_user_id', user_id: user_id
  assign profile_id = profile_data.profiles.results.first.id

  # ============================================
  # TEST: User starts with authenticated role
  # ============================================
  graphql profile = 'user/profile_get', id: profile_id
  assign has_authenticated = false
  for role in profile.profiles.results.first.roles
    if role == 'authenticated'
      assign has_authenticated = true
    endif
  endfor

  function contract = 'modules/tests/assertions/true',
    contract: contract,
    value: has_authenticated,
    field_name: 'user_has_authenticated_role'

  # ============================================
  # TEST: Append role works
  # ============================================
  function append_result = 'modules/user/commands/profiles/roles/append',
    id: profile_id,
    role: 'manager'

  function contract = 'modules/tests/assertions/valid_object',
    contract: contract,
    object: append_result,
    field_name: 'append_role_succeeds'

  # Verify role was added
  graphql profile_after_append = 'user/profile_get', id: profile_id
  assign has_manager = false
  for role in profile_after_append.profiles.results.first.roles
    if role == 'manager'
      assign has_manager = true
    endif
  endfor

  function contract = 'modules/tests/assertions/true',
    contract: contract,
    value: has_manager,
    field_name: 'manager_role_added'

  # ============================================
  # TEST: can_do returns true for granted permission
  # ============================================
  assign mock_profile = profile_after_append.profiles.results.first

  function can_view_admin = 'modules/user/helpers/can_do',
    requester: mock_profile,
    do: 'admin.view'

  function contract = 'modules/tests/assertions/true',
    contract: contract,
    value: can_view_admin,
    field_name: 'can_do_returns_true_for_granted'

  # ============================================
  # TEST: can_do returns false for denied permission
  # ============================================
  function can_manage_system = 'modules/user/helpers/can_do',
    requester: mock_profile,
    do: 'system.manage'

  function contract = 'modules/tests/assertions/not_true',
    contract: contract,
    value: can_manage_system,
    field_name: 'can_do_returns_false_for_denied'

  # ============================================
  # TEST: Remove role works
  # ============================================
  function remove_result = 'modules/user/commands/profiles/roles/remove',
    id: profile_id,
    role: 'manager'

  function contract = 'modules/tests/assertions/valid_object',
    contract: contract,
    object: remove_result,
    field_name: 'remove_role_succeeds'

  # ============================================
  # CLEANUP
  # ============================================
  graphql delete_user = 'user/delete', id: user_id

  return contract
%}
```

### 8.2 Manual Testing Checklist

**YOU MUST verify these scenarios manually:**

| Test | User State | Expected Result |
|------|------------|-----------------|
| Access /admin as guest | Not logged in | Redirect to login |
| Access /admin as regular user | Logged in, no manager role | 403 Forbidden |
| Access /admin as manager | Logged in, has manager role | Page renders |
| Admin nav visibility (guest) | Not logged in | No Admin link |
| Admin nav visibility (regular) | Logged in, no permission | No Admin link |
| Admin nav visibility (manager) | Logged in, has permission | Admin link visible |
| Role assignment via GUI | Admin user | Role persists after save |
| Role assignment via code | Liquid command | Role reflected in profile |

### 8.3 Running Authorization Tests

```bash
# Deploy permission changes first
insites-cli deploy staging

# Run authorization tests
insites-cli test run staging test/auth/authorization_test

# Monitor logs
insites-cli logs staging
```

---

## Part 9: Advanced Patterns

### 9.1 Permission Inheritance

Create hierarchical permissions using role composition:

```liquid
# In permissions.liquid

# Base editor permissions
assign editor_perms = 'posts.create,posts.edit,posts.delete,media.upload'

# Senior editor inherits editor + more
assign senior_editor_perms = editor_perms | append: ',posts.publish,posts.feature'

# Admin inherits senior editor + more
assign admin_perms = senior_editor_perms | append: ',users.manage,settings.view'

assign permissions['editor'] = editor_perms | split: ','
assign permissions['senior_editor'] = senior_editor_perms | split: ','
assign permissions['admin'] = admin_perms | split: ','
```

### 9.2 Resource-Specific Permissions

Check ownership alongside permissions:

```liquid
{% liquid
  function current_profile = 'modules/user/helpers/current_profile'
  function can_edit_any = 'modules/user/helpers/can_do', requester: current_profile, do: 'posts.edit_any'

  # Can edit if: owns the post OR has edit_any permission
  assign is_owner = post.author_id == current_profile.id
  assign can_edit = is_owner or can_edit_any

  if can_edit
    render 'partials/post_edit_form', post: post
  endif
%}
```

### 9.3 Temporary Role Grants

Grant time-limited access:

```liquid
{% liquid
  # Grant trial access
  function result = 'modules/user/commands/profiles/roles/append',
    id: profile_id,
    role: 'trial_premium'

  # Schedule removal (implement via background job)
  function schedule = 'lib/commands/jobs/schedule',
    job: 'remove_trial_role',
    profile_id: profile_id,
    run_at: context.now | plus: 604800  # 7 days in seconds
%}
```

---

## Security Checklist - Authorization

**Before deploying authorization, YOU MUST verify:**

- [ ] All admin pages use `can_do_or_unauthorized`
- [ ] Permissions file is in `app/` not `modules/`
- [ ] Navigation hides links users can't access
- [ ] Hidden nav is NOT the only protection
- [ ] Check permissions, not role names
- [ ] Profile ID used for role commands (not User ID)
- [ ] `authenticated` role preserved when setting roles
- [ ] Tests cover permission grants AND denials
- [ ] 403 pages are user-friendly
- [ ] Login redirect works for anonymous users

---

## File Structure Summary

```
app/
├── modules/
│   └── user/
│       └── public/
│           └── lib/
│               └── queries/
│                   └── role_permissions/
│                       └── permissions.liquid    # CUSTOM PERMISSIONS
├── graphql/
│   └── admin/
│       └── users/
│           ├── list.graphql
│           └── get.graphql
├── views/
│   ├── layouts/
│   │   └── application.liquid                   # Permission-aware nav
│   └── pages/
│       └── admin/
│           ├── index.liquid                      # Dashboard
│           └── users/
│               ├── index.liquid                  # User list
│               ├── edit.liquid                   # Edit user
│               └── update-roles.liquid           # Role update endpoint
└── lib/
    └── test/
        └── auth/
            └── authorization_test.liquid
```

---

## Quick Reference - Authorization

### Authorization Helpers

```liquid
# Simple boolean check
function can = 'modules/user/helpers/can_do', requester: profile, do: 'permission.name'

# Block with 403
include 'modules/user/helpers/can_do_or_unauthorized', requester: profile, do: 'permission.name', redirect_anonymous_to_login: true

# Redirect if denied
include 'modules/user/helpers/can_do_or_redirect', requester: profile, do: 'permission.name', return_url: '/upgrade'
```

### Role Management Commands

```liquid
# Add role
function r = 'modules/user/commands/profiles/roles/append', id: profile_id, role: 'rolename'

# Remove role
function r = 'modules/user/commands/profiles/roles/remove', id: profile_id, role: 'rolename'

# Set roles (replace all)
function r = 'modules/user/commands/profiles/roles/set', id: profile_id, roles: 'role1,role2'
```

### Current Profile Access

```liquid
# Load current profile
function current_profile = 'modules/user/helpers/current_profile'

# Or reuse if exported
if context.exports.current_profile
  assign current_profile = context.exports.current_profile
endif
```

---

## References

- [Adding an Admin Page](https://documentation.platformos.com/tutorials/user-management/add-admin-page)
- [Assigning Roles to Users](https://documentation.platformos.com/tutorials/user-management/assign-roles)
- [Authorization with can_do](https://documentation.platformos.com/tutorials/user-management/authorization-can-do)
- [Roles and Permissions](https://documentation.platformos.com/tutorials/user-management/roles-and-permissions)
- [Understanding User Module Endpoints](https://documentation.platformos.com/tutorials/user-management/understand-endpoints)
- [Display Admin Link Based on Permissions](https://documentation.platformos.com/tutorials/user-management/display-admin-permission)
