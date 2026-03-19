# Partials -- Configuration & File Structure

## File Location

All partials reside in `app/views/partials/`. The path in render/function maps directly:

- `{% render 'products/card' %}` → `app/views/partials/products/card.liquid`
- `{% function r = 'lib/commands/products/create' %}` → `app/views/partials/lib/commands/products/create.liquid`

> **Module path:** In modules, partials live in `modules/<module_name>/public/views/partials/` (accessible to the app and other modules) or `modules/<module_name>/private/views/partials/` (internal only). The render/function path remains the same — the platform resolves the module prefix automatically.

## Naming Rules

- NO underscore prefix (use `card.liquid`, NOT `_card.liquid`)
- Use lowercase with hyphens or underscores for multi-word names
- Extension is always `.liquid`

## Recommended Directory Structure

```
app/views/partials/
├── lib/
│   ├── commands/          # Business logic (build/check/execute)
│   │   ├── products/
│   │   │   ├── create.liquid
│   │   │   ├── update.liquid
│   │   │   └── delete.liquid
│   │   └── orders/
│   ├── queries/           # Data retrieval wrappers
│   │   ├── products/
│   │   │   ├── search.liquid
│   │   │   └── find.liquid
│   │   └── orders/
│   ├── helpers/           # Utility functions
│   │   ├── format_price.liquid
│   │   └── calculate_tax.liquid
│   ├── consumers/         # Event handlers
│   │   └── order_created/
│   │       └── send_email.liquid
│   └── tests/             # Test files (*_test.liquid)
│       └── products/
│           └── create_test.liquid
├── products/              # Feature-specific UI templates
│   ├── card.liquid
│   ├── list.liquid
│   ├── form.liquid
│   └── show.liquid
├── orders/
├── shared/                # Cross-feature UI components
│   ├── navigation.liquid
│   ├── footer.liquid
│   ├── breadcrumbs.liquid
│   └── pagination.liquid
└── layouts/               # Layout sub-components
    └── head.liquid
```

## Invocation Methods

### render (template — produces HTML output)

```liquid
{% render 'products/card', product: product, show_price: true %}
```

Variables must be explicitly passed. The partial cannot access the caller's scope.

### function (returns data via return tag)

```liquid
{% function result = 'lib/commands/products/create', title: "New", price: 19.99 %}
```

The partial must use `{% return value %}` to send data back.

## Variable Scoping

Variables inside a partial are LOCAL. They do not leak to the caller.

### Exporting to context.exports

```liquid
{% export my_var, namespace: 'my_ns' %}
```

Accessible after the partial runs: `{{ context.exports.my_ns.my_var }}`

### Returning from function calls

```liquid
{% return result %}
```

## See Also

- [Partials Overview](README.md)
- [api.md](api.md) — render, function, return, export tags
- [patterns.md](patterns.md) — common partial workflows
- [gotchas.md](gotchas.md) — common errors
- [Pages](../pages/README.md) — pages call partials
- [Liquid Tags](../liquid/tags/README.md) — render, function, return, export reference
