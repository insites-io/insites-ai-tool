---
name: pos-crud-generator
description: Generate CRUD resources and scaffolds using pos-module-core generators
---

# Insites CRUD Generator

Generate complete CRUD scaffolds using pos-module-core generators.

## Prerequisites

- pos-module-core must be installed and downloaded
- Generator files must be at `modules/core/generators/crud/`

## Commands

### Generate CRUD with views
```bash
insites-cli generate run modules/core/generators/crud <resource> <properties> --include-views
```

### Generate CRUD without views
```bash
insites-cli generate run modules/core/generators/crud <resource> <properties>
```

### Get help on generator
```bash
insites-cli generate run modules/core/generators/crud --help
```

## Arguments

### Resource Name
- Singular form (e.g., `article`, `product`, `user_profile`)
- Lowercase with underscores
- Will be pluralized for URLs and files (articles, products, user_profiles)

### Properties
Format: `name:type`

| Type | Description | Example |
|------|-------------|---------|
| `string` | Short text (255 chars) | `title:string` |
| `text` | Long text | `body:text` |
| `integer` | Whole numbers | `quantity:integer` |
| `float` | Decimal numbers | `price:float` |
| `boolean` | True/false | `active:boolean` |
| `datetime` | Date and time | `published_at:datetime` |
| `date` | Date only | `birth_date:date` |
| `array` | List of values | `tags:array` |
| `upload` | File upload | `image:upload` |

## Examples

### Blog Article
```bash
insites-cli generate run modules/core/generators/crud article title:string body:text published_at:datetime author_id:string --include-views
```

### E-commerce Product
```bash
insites-cli generate run modules/core/generators/crud product name:string description:text price:float sku:string in_stock:boolean image:upload --include-views
```

### User Profile
```bash
insites-cli generate run modules/core/generators/crud profile first_name:string last_name:string bio:text avatar:upload user_id:string --include-views
```

## Generated Files

### Schema
```
app/schema/<resource>.yml
```

### GraphQL Operations
```
app/graphql/<resources>/create.graphql
app/graphql/<resources>/update.graphql
app/graphql/<resources>/delete.graphql
app/graphql/<resources>/search.graphql
```

### Commands
```
app/lib/commands/<resources>/create.liquid
app/lib/commands/<resources>/create/build.liquid
app/lib/commands/<resources>/create/check.liquid
app/lib/commands/<resources>/update.liquid
app/lib/commands/<resources>/update/build.liquid
app/lib/commands/<resources>/update/check.liquid
app/lib/commands/<resources>/delete.liquid
app/lib/commands/<resources>/delete/check.liquid
```

### Queries
```
app/lib/queries/<resources>/find.liquid
app/lib/queries/<resources>/search.liquid
```

### Pages (with --include-views)
```
app/views/pages/<resources>/index.liquid
app/views/pages/<resources>/show.liquid
app/views/pages/<resources>/new.liquid
app/views/pages/<resources>/create.liquid
app/views/pages/<resources>/edit.liquid
app/views/pages/<resources>/update.liquid
app/views/pages/<resources>/delete.liquid
```

### Partials (with --include-views)
```
app/views/partials/theme/simple/<resources>/index.liquid
app/views/partials/theme/simple/<resources>/show.liquid
app/views/partials/theme/simple/<resources>/new.liquid
app/views/partials/theme/simple/<resources>/edit.liquid
app/views/partials/theme/simple/<resources>/form.liquid
app/views/partials/theme/simple/<resources>/empty_state.liquid
app/views/partials/theme/simple/field_error.liquid
```

### Translations
```
app/translations/en/<resources>.yml
```

## REST Routes Generated

| Method | URL | Page | Action |
|--------|-----|------|--------|
| GET | /<resources> | index | List all |
| GET | /<resources>/new | new | Show create form |
| POST | /<resources> | create | Create record |
| GET | /<resources>/:id | show | Show single |
| GET | /<resources>/:id/edit | edit | Show edit form |
| PUT | /<resources>/:id | update | Update record |
| DELETE | /<resources>/:id | delete | Delete record |

## Post-Generation Steps

1. **Review generated files**
   - Customize validation rules in check.liquid
   - Adjust build.liquid for any transformations

2. **Add authorization** (if needed)
   - Add permission checks to pages
   - Define permissions in user module

3. **Customize UI**
   - Modify partials for your design
   - Update translations for your copy

4. **Add tests**
   - Create `app/lib/test/<resources>_test.liquid`

5. **Deploy and verify**
   ```bash
   insites-cli sync staging
   platformos-check
   insites-cli deploy staging
   ```
