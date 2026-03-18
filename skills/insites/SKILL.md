---
name: insites
description: Consolidated skill for building on the Insites platform. Use decision trees below to find the right component, then load detailed references.
---

## The skill leverages:
- Correct use of Insites file structure
- Deterministic project scaffolding
- Safe data modeling and migrations
- Liquid templating accuracy
- Server-side logic (GraphQL, workflows, policies)
- Repeatable deployment procedures
- Minimal hallucination of unsupported features

---

# CRITICAL!

This skill defines a **strict, non-interpretable, sacred rules to help you avoid mistakes**.
You **MUST follow guidance exactly as written**, without omission, substitution, optimization, or commentary.

**Constraints**
* Failure to follow constitutes NON-COMPLIANCE and VIOLATION.


## 1. Source of Truth

- References provided in this document is the ONLY source of truth
- NEVER invent undocumented behaviors, APIs, configurations, Liquid tags/filters, or directory structures
- The GraphQL schema is strict and closed; you CANNOT create custom GraphQL types
- When uncertain, consult reference files

## 2. Pre-Flight Validation (Required Before Every Change)

- **After ANY file change, you MUST run the linter:**

```bash
platformos-check
```

Must pass with 0 errors before deployment. 

**NO OPTIONAL REVIEW**

- [ ] NO underscore prefix in partial filenames
- [ ] `render 'path/name'` resolves to `app/views/partials/path/name.liquid`
- [ ] Pages have ONE HTTP method each
- [ ] NO raw HTML/JS/CSS in pages (pages = controllers)
- [ ] NO GraphQL calls from partials (pages only)
- [ ] NO hardcoded user-facing text in partials (use translations)
- [ ] NO hardcoded credentials (use `context.constants`)
- [ ] `platformos-check` passes


## 3. Quick Decision Trees

These Quick Decision Trees are designed to deterministically map any developer request to the correct Insites reference domain(s).
They use ASCII tree visualizations for clarity and are exhaustive for all core tasks you would perform.
You MUST fully understand requirements, consult these trees + indicated references and resolve all ambiguity before writing any code.

---

### "I need to build a page/endpoint"

```
Need a page or endpoint?
├─ HTML page with data → pages/ + partials/ + graphql/
├─ JSON API endpoint → pages/ (with .json.liquid extension)
├─ JavaScript endpoint → pages/ (with .js.liquid extension)
├─ Form submission handler → pages/ (method: post) + forms/
├─ File download/redirect → pages/ + routing/
├─ Admin-only page → pages/ + authentication/ (pos-module-user)
├─ Layout wrapper → layouts/
└─ Reusable UI component → partials/
```

### "I need to work with data"

```
Need data operations?
├─ Define a data model/table → schema/
├─ Query records (list/search/filter) → graphql/ (records query)
├─ Query single record by ID → graphql/ (records query with id filter)
├─ Create a record → graphql/ (record_create mutation) + commands/
├─ Update a record → graphql/ (record_update mutation) + commands/
├─ Delete a record → graphql/ (record_delete mutation) + commands/
├─ Related records (belongs-to/has-many) → graphql/ (related_record/related_records)
├─ Paginate results → graphql/ (page/per_page args)
├─ Upload files → schema/ (upload type) + forms/
├─ Seed/migrate data → migrations/
├─ Bulk import/export → migrations/ or insites-cli data commands
└─ Access existing Postgres/ES/Redis → graphql/ (all DB access via GraphQL only)
```

### "I need business logic"

```
Need business logic?
├─ Encapsulate a create/update/delete operation → commands/ (build → check → execute)
├─ Validate user input → commands/ (check stage with core validators)
├─ React to something that happened → events-consumers/
├─ Run code asynchronously → background-jobs/
├─ Run code on a schedule → background-jobs/ (with delay)
├─ Send email after an action → events-consumers/ + emails-sms/
├─ Process payments → modules/payments/
└─ Wrap a data query for reuse → lib/queries/
```

### "I need authentication & authorization"

```
Need auth?
├─ Get current user → authentication/ (modules/user/queries/user/current)
├─ Check if user can do something → authentication/ (modules/user/helpers/can_do)
├─ Block unauthorized access (403) → authentication/ (can_do_or_unauthorized)
├─ Redirect if not permitted → authentication/ (can_do_or_redirect)
├─ Sign in a user → authentication/ (sign_in tag)
├─ Define custom roles/permissions → authentication/ (override permissions.liquid)
├─ OAuth2/social login → modules/user/
├─ CSRF protection → forms/ (authenticity_token)
├─ Spam protection (reCAPTCHA/hCaptcha) → forms/ (spam_protection tag)
└─ NEVER use authorization_policies/ directly → always use pos-module-user
```

### "I need Liquid templating"

```
Need Liquid help?
├─ Insites-specific tags → liquid/tags/
│   ├─ Execute GraphQL → graphql tag
│   ├─ Call partial as function → function tag
│   ├─ Render a partial → render tag
│   ├─ Parse JSON data → parse_json tag
│   ├─ Redirect user → redirect_to tag
│   ├─ Set session data → session tag
│   ├─ Log for debugging → log tag
│   ├─ Cache output → cache tag
│   ├─ Run code in background → background tag
│   ├─ Database transactions → transaction tag
│   ├─ Error handling → try/catch tag
│   ├─ Export variables → export tag
│   ├─ Set response headers/status → response_headers/response_status tags
│   ├─ Sign in user → sign_in tag
│   └─ Spam protection → spam_protection tag
├─ Filters (data transformation) → liquid/filters/
│   ├─ Array operations → array_* filters
│   ├─ Hash/object operations → hash_* filters
│   ├─ Date/time operations → add_to_time, localize, strftime, to_time, etc.
│   ├─ String operations → parameterize, slugify, titleize, humanize, etc.
│   ├─ JSON/encoding → json, parse_json, base64_encode/decode, etc.
│   ├─ Validation → is_email_valid, is_json_valid, matches, etc.
│   ├─ Currency/pricing → pricify, pricify_cents, amount_to_fractional, etc.
│   ├─ Cryptography → encrypt, decrypt, digest, compute_hmac, jwt_encode/decode
│   ├─ Translation → t (translate), t_escape
│   └─ Assets → asset_url, asset_path
├─ Objects (global data) → liquid/objects/
│   ├─ context.params → HTTP parameters
│   ├─ context.session → session storage
│   ├─ context.location → URL info
│   ├─ context.current_user → user data (use module helper instead)
│   ├─ context.constants → secrets/config
│   ├─ context.environment → staging/production
│   ├─ context.exports → exported partial variables
│   ├─ context.headers → HTTP request headers
│   └─ forloop/tablerowloop → iteration helpers
├─ Types → liquid/types/
├─ Variables (assign, capture, parse_json) → liquid/variables/
├─ Flow control (if/elsif/else/unless/case) → liquid/flow-control/
└─ Loops (for, cycle, tablerow) → liquid/loops/
```

### "I need to handle forms"

```
Need forms?
├─ HTML form with CSRF → forms/ (use <form> tag, NOT {% form %})
├─ File upload → forms/ + modules/common-styling/ (upload component)
├─ Form validation → commands/ (check stage)
├─ Display validation errors → partials/ (render errors from command result)
├─ Multi-step form → pages/ + sessions/
├─ AJAX form submission → forms/ + pages/ (.json.liquid endpoint)
└─ Spam protection → forms/ (spam_protection tag)
```

### "I need notifications"

```
Need notifications?
├─ Send email → emails-sms/ (email templates)
├─ Send SMS → emails-sms/ (SMS templates)
├─ Flash messages/toasts → flash-messages/
├─ Send async (after action) → events-consumers/ + emails-sms/
└─ Email layout/styling → layouts/ (mailer layout)
```

### "I need styling & UI"

```
Need UI/styling?
├─ CSS framework → modules/common-styling/ (pos-* classes ONLY)
├─ View available components → /style-guide on your instance
├─ Layout structure → layouts/
├─ Reusable UI snippets → partials/
├─ Static assets (images, fonts, JS) → assets/
├─ Pagination component → modules/common-styling/ (pagination partial)
├─ File upload widget → modules/common-styling/ (upload partial)
└─ NEVER use Tailwind/Bootstrap/custom frameworks
```

### "I need to integrate external services"

```
Need integrations?
├─ Call external REST API → api-calls/
├─ Stripe payments → modules/payments/
├─ OpenAI/AI features → modules/openai/
├─ WebSocket/chat → modules/chat/
├─ OAuth2 providers → modules/user/ (OAuth2 support)
├─ Webhook receiver → pages/ (POST endpoint)
└─ Store API keys/secrets → constants/
```

### "I need deployment & DevOps"

```
Need deployment?
├─ Deploy to environment → deployment/ (insites-cli deploy)
├─ Watch logs → cli/ (insites-cli logs)
├─ Run Liquid/GraphQL ad-hoc → cli/ (insites-cli exec)
├─ Install modules → cli/ (insites-cli modules install)
├─ Set environment constants → constants/ (insites-cli constants set)
├─ Run migrations → migrations/
├─ Run tests → testing/
├─ Lint/validate code → cli/ (platformos-check)
├─ Sync files in development → cli/ (insites-cli sync)
└─ Environment configuration → configuration/
```

### "I need performance optimization"

```
Need performance?
├─ Cache page fragments → caching/ (cache tag)
├─ Run heavy work in background → background-jobs/ (background tag)
├─ Avoid N+1 queries → graphql/ (related_record/related_records)
├─ Optimize pagination → graphql/ (per_page limits)
├─ Static asset CDN → assets/ (asset_url filter)
├─ Frontend optimization → assets/ (lazy loading, code splitting)
└─ Database query optimization → graphql/ (filters, sorting)
```

## Categories Index

Use the decision trees above to identify which category applies, then load the matching reference below. Each reference directory contains: `README.md`, `configuration.md`, `api.md`, `patterns.md`, `gotchas.md`, `advanced.md`.

### Views & Routing
| Category | Reference |
|----------|-----------|
| Pages | `references/pages/` |
| Layouts | `references/layouts/` |
| Partials | `references/partials/` |
| Routing | `references/routing/` |

### Data & Storage
| Category | Reference |
|----------|-----------|
| Schema | `references/schema/` |
| GraphQL | `references/graphql/` |
| Migrations | `references/migrations/` |

### Business Logic
| Category | Reference |
|----------|-----------|
| Commands | `references/commands/` |
| Events & Consumers | `references/events-consumers/` |
| Background Jobs | `references/background-jobs/` |

### Liquid Templating
| Category | Reference |
|----------|-----------|
| Tags | `references/liquid/tags/` |
| Filters | `references/liquid/filters/` |
| Objects | `references/liquid/objects/` |
| Types | `references/liquid/types/` |
| Variables | `references/liquid/variables/` |
| Flow Control | `references/liquid/flow-control/` |
| Loops | `references/liquid/loops/` |

### Authentication & Security
| Category | Reference |
|----------|-----------|
| Authentication | `references/authentication/` |
| Forms | `references/forms/` |

### Notifications
| Category | Reference |
|----------|-----------|
| Emails & SMS | `references/emails-sms/` |
| Flash Messages | `references/flash-messages/` |

### Modules
| Category | Reference |
|----------|-----------|
| Core | `references/modules/core/` |
| User | `references/modules/user/` |
| Common Styling | `references/modules/common-styling/` |
| Payments | `references/modules/payments/` |
| Tests | `references/modules/tests/` |
| Chat | `references/modules/chat/` |
| OpenAI | `references/modules/openai/` |

### Configuration & Infrastructure
| Category | Reference |
|----------|-----------|
| Constants | `references/constants/` |
| Configuration | `references/configuration/` |
| Assets | `references/assets/` |
| Translations | `references/translations/` |
| Sessions | `references/sessions/` |
| Caching | `references/caching/` |

### External Integrations
| Category | Reference |
|----------|-----------|
| API Calls | `references/api-calls/` |

### Developer Tools
| Category | Reference |
|----------|-----------|
| CLI | `references/cli/` |
| Deployment | `references/deployment/` |
| Testing | `references/testing/` |

## Critical Architecture Rules

### 1. Pages = Controllers (NEVER put HTML in pages)
```
Page files: fetch data via {% graphql %}, delegate to partials via {% render %}
Partials: contain ALL HTML/JS/CSS presentation
```
→ `references/pages/`, `references/partials/`

### 2. GraphQL in Pages Only
```
NEVER call {% graphql %} from partials
Wrap GraphQL calls in query files at app/lib/queries/
Call queries via {% function result = 'lib/queries/...' %}
```
→ `references/graphql/`

### 3. Command Pattern (build → check → execute)
```
All create/update/delete operations go through Commands
Commands use pos-module-core helpers for build, check, execute
Validation errors are returned, not thrown
```
→ `references/commands/`

### 4. Module System (READ-ONLY)
```
modules/ directory is READ-ONLY — never edit files there
Override module behavior via documented override mechanism only
Required: core, user, common-styling
Optional: payments, payments_stripe, tests, chat, openai
```
→ `references/modules/`

### 5. Liquid Coding Standards
```
Do NOT line-wrap statements within {% liquid %} blocks
Keep each statement on a single line
Variables in Insites are LOCAL to the partial (use export tag to share)
```
→ `references/liquid/`

## Project Structure

```
project-root/
├── app/
│   ├── assets/                    # Static files (images, fonts, styles, scripts)
│   ├── views/
│   │   ├── pages/                 # Controllers (NO HTML here)
│   │   ├── layouts/               # Wrapper templates
│   │   └── partials/              # Reusable template snippets (ALL HTML here)
│   ├── lib/
│   │   ├── commands/              # Business logic (build → check → execute)
│   │   ├── queries/               # Data retrieval wrappers
│   │   ├── events/                # Event definitions
│   │   └── consumers/             # Event handlers
│   ├── schema/                    # Database table definitions (YAML)
│   ├── graphql/                   # GraphQL query/mutation files (.graphql)
│   ├── emails/                    # Email templates
│   ├── smses/                     # SMS templates
│   ├── api_calls/                 # Third-party API integrations
│   ├── translations/              # i18n content (YAML)
│   ├── migrations/                # Data seeding and schema migrations
│   ├── authorization_policies/    # DO NOT USE — use pos-module-user
│   └── config.yml                 # Feature flags and configuration
├── modules/                       # Downloaded/custom modules (READ-ONLY)
├── .pos                           # Environment endpoints/project root sentinel file
└── package.json                   # (optional) Node.js dependencies
```

## File Extension Conventions

| Extension | Content-Type | URL |
|-----------|--------------|-----|
| `*.liquid` or `*.html.liquid` | `text/html` | `/path` |
| `*.json.liquid` | `application/json` | `/path.json` |
| `*.js.liquid` | `application/javascript` | `/path.js` |

## REST CRUD Convention

| Method | Page File | GraphQL Operation |
|--------|-----------|-------------------|
| GET | index, show, new, edit | records (search/find) |
| POST | create | record_create |
| PUT | update | record_update |
| DELETE | delete | record_delete |

## Forbidden Behaviors

- Editing files in `./modules/` (read-only)
- Breaking long lines in `{% liquid %}` blocks (causes syntax errors)
- Inventing Liquid tags, filters, or GraphQL types not in the platform
- Using `{% form %}` tag for HTML forms (use plain `<form>` with CSRF token)
- Bypassing security (CSRF tokens, authorization)
- Direct database access outside GraphQL
- Deploying without running `platformos-check`
- Syncing files outside `./app/`
- Using `context.current_user` directly (use pos-module-user)
- Using `authorization_policies/` directly (use pos-module-user)
- Using Tailwind, Bootstrap, or custom CSS frameworks (use common-styling)
- Hardcoding user-facing text (use translations)
- Hardcoding API keys or secrets (use `context.constants`)

## Documentation Links

| Resource | URL |
|----------|-----|
| Official Docs | https://documentation.platformos.com |
| GraphQL Schema | https://documentation.platformos.com/api/graphql/schema |
| Liquid Filters | https://documentation.platformos.com/api-reference/liquid/platformos-filters |
| Liquid Tags | https://documentation.platformos.com/api-reference/liquid/platformos-tags |
| Liquid Objects | https://documentation.platformos.com/api-reference/liquid/platformos-objects |
| Core Module | https://github.com/Platform-OS/pos-module-core |
| User Module | https://github.com/Platform-OS/pos-module-user |
| Common Styling | https://github.com/Platform-OS/pos-module-common-styling |
| Payments Module | https://github.com/Platform-OS/pos-module-payments |
| Payments Stripe | https://github.com/Platform-OS/pos-module-payments-stripe |
| Tests Module | https://github.com/Platform-OS/pos-module-tests |
