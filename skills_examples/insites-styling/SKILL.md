---
name: insites-styling
description: Strict protocols for implementing consistent, professional UI using the Insites Common Styling module
---

---
# Insites Common Styling Skill

## Overview

This skill provides **absolute, non-negotiable protocols** for implementing the Insites Common Styling module. YOU MUST follow every instruction precisely. Consistent styling across Insites applications is not optional—it ensures accessibility, maintainability, and professional quality.

The Common Styling module provides:
- Reusable design system with CSS custom properties
- Pre-built components (forms, buttons, cards, tables, toasts, navigation)
- Dark mode support (automatic and manual)
- Scoped CSS with `pos-` prefixes
- JavaScript utilities and module system
- Built-in style guide at `/style-guide`

**SUPPORT FILE:** For complete component reference, CSS classes, and code examples, see `./insites-style-guide.md`

---

## Critical Prerequisites

**YOU MUST verify these prerequisites BEFORE writing any styling code:**

### 1. Verify insites-cli Installation

```bash
insites-cli -v
```

### 2. Verify Environment Configuration

```bash
cd project_directory && insites-cli env list
```

### 3. Configure Output Escaping

**File:** `app/config.yml`

```yaml
escape_output_instead_of_sanitize: true
```

**CRITICAL:** This setting is REQUIRED. Without it, HTML output may be incorrectly sanitized.

### 5. Verify Module Installation

```bash
insites-cli modules list <env>
```

**Expected:** `common-styling` appears in the list.

### 4. Install Required Module - SKIP if `common-styling` module already installed

```bash
insites-cli modules install common-styling
insites-cli modules download common-styling
insites-cli deploy staging
```

### 6. Verify Style Guide Accessibility

Navigate to: `https://YOUR-INSTANCE.staging.oregon.platform-os.com/style-guide`

**Expected:** Style guide page renders with component examples.

**NEVER proceed without verifying all prerequisites. Missing configuration causes silent failures.**

---

## Phase 1: Layout Setup

### 1.1 Announce Your Implementation Plan

**YOU MUST announce your plan BEFORE writing any code:**

```
ANNOUNCE: "I am setting up Common Styling. I will:
1. Create application layout with pos-app class
2. Include init partial with CSS reset
3. Configure viewport and meta tags
4. Add toast notification support
5. Test style guide accessibility"
```

### 1.2 Create Application Layout

**File:** `app/views/layouts/application.liquid`

```liquid
<!DOCTYPE html>
<html lang="en" class="pos-app">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes">
  <meta name="description" content="{{ page.metadata.description | default: 'Insites Application' }}">
  <title>{{ page.metadata.title | default: 'My App' }}</title>

  {% comment %} MANDATORY: Initialize Common Styling {% endcomment %}
  {% render 'modules/common-styling/init', reset: true %}

  {% comment %} Custom CSS overrides (MUST come after init) {% endcomment %}
  {% if custom_css %}
    <link rel="stylesheet" href="{{ 'variables.css' | asset_url }}">
  {% endif %}
</head>
<body>

  {% comment %} Page content renders here {% endcomment %}
  {{ content_for_layout }}

  {% comment %} MANDATORY: Toast notifications {% endcomment %}
  {% liquid
    theme_render_rc 'modules/common-styling/toasts'
  %}

</body>
</html>
```

### 1.3 Mandatory Layout Elements

**Every layout MUST include these elements:**

| Element | Purpose | Location |
|---------|---------|----------|
| `class="pos-app"` | Activates design system | `<html>` tag |
| `{% render 'modules/common-styling/init' %}` | Loads CSS/JS | `<head>` |
| `reset: true` | Normalizes browser styles | init parameter |
| `viewport` meta | Responsive design | `<head>` |
| `{{ content_for_layout }}` | Page content slot | `<body>` |
| Toast partial | User notifications | End of `<body>` |

### 1.4 Dark Mode Configuration

**Automatic (system preference):**
```html
<html lang="en" class="pos-app pos-theme-darkEnabled">
```

**Manual (forced dark):**
```html
<html lang="en" class="pos-app pos-theme-dark">
```

**RULE:** Choose ONE approach. Do not mix automatic and manual dark mode.

---

## Phase 2: Typography

### 2.1 Heading Classes

**YOU MUST use these classes for headings:**

| Class | Element | Usage |
|-------|---------|-------|
| `pos-heading-1` | `<h1>` | Page title (ONE per page) |
| `pos-heading-2` | `<h2>` | Section headings |
| `pos-heading-3` | `<h3>` | Subsection headings |
| `pos-heading-4` | `<h4>` | Minor headings |

```html
<h1 class="pos-heading-1">Page Title</h1>
<h2 class="pos-heading-2">Section Title</h2>
<h3 class="pos-heading-3">Subsection Title</h3>
<h4 class="pos-heading-4">Minor Heading</h4>
```

**NEVER:**
- Use heading classes on non-heading elements
- Skip heading levels (h1 → h3)
- Have multiple h1 elements per page

### 2.2 Text Styles

| Class | Purpose | Example |
|-------|---------|---------|
| `pos-supplementary` | Secondary/muted text | Timestamps, metadata |
| `pos-prose` | Long-form content | Articles, blog posts |
| `pos-tip` | Helpful hints | Via Liquid partial |

```html
<span class="pos-supplementary">Last updated: Jan 28, 2026</span>

<article class="pos-prose">
  <p>Long form content with optimized typography...</p>
</article>
```

**Tip partial:**
```liquid
{% render 'modules/common-styling/tip', content: 'Helpful information here' %}
```

---

## Phase 3: Buttons

### 3.1 Button Classes

**YOU MUST use these classes for buttons:**

| Class | Purpose | Visual |
|-------|---------|--------|
| `pos-button` | Base class (secondary style) | Outlined |
| `pos-button pos-button-primary` | Primary action | Filled/prominent |
| `pos-button pos-button-small` | Compact size | Smaller padding |

### 3.2 Button Examples

```html
{% comment %} Secondary button (default) {% endcomment %}
<button class="pos-button">Cancel</button>

{% comment %} Primary button {% endcomment %}
<button class="pos-button pos-button-primary">Save</button>

{% comment %} Small buttons {% endcomment %}
<button class="pos-button pos-button-small">Edit</button>
<button class="pos-button pos-button-small pos-button-primary">Add</button>

{% comment %} Disabled state {% endcomment %}
<button class="pos-button" disabled>Unavailable</button>
<button class="pos-button pos-button-primary" disabled>Processing...</button>

{% comment %} Link styled as button {% endcomment %}
<a href="/page" class="pos-button">Go to Page</a>
```

### 3.3 Button Rules

**ABSOLUTE RULES:**

1. **Primary buttons:** ONE per form/section (the main action)
2. **Secondary buttons:** Supporting actions (Cancel, Back)
3. **Always include type:** `type="submit"` or `type="button"`
4. **Disabled state:** Add `disabled` attribute, never fake it with CSS
5. **Loading state:** Change text to indicate processing

---

## Phase 4: Forms

### 4.1 Form Container Classes

| Class | Purpose | Use Case |
|-------|---------|----------|
| `pos-form` | Manual styling control | Complex forms |
| `pos-form pos-form-simple` | Auto-styled children | Simple forms |

### 4.2 Standard Form Structure

**File:** `app/views/partials/example_form.liquid`

```liquid
<form class="pos-form pos-form-simple" action="/endpoint" method="post">
  {% comment %} CSRF Protection - MANDATORY {% endcomment %}
  <input type="hidden" name="authenticity_token" value="{{ context.authenticity_token }}">

  {% comment %} Text Input {% endcomment %}
  <fieldset>
    <label for="name">Name</label>
    <input
      type="text"
      id="name"
      name="user[name]"
      value="{{ user.name }}"
      required
      {% render 'modules/common-styling/forms/error_input_handler', name: 'name', errors: user.errors.name %}
    >
    {% render 'modules/common-styling/forms/error_list', name: 'name', errors: user.errors.name %}
  </fieldset>

  {% comment %} Email Input {% endcomment %}
  <fieldset>
    <label for="email">Email</label>
    <input
      type="email"
      id="email"
      name="user[email]"
      value="{{ user.email }}"
      required
      {% render 'modules/common-styling/forms/error_input_handler', name: 'email', errors: user.errors.email %}
    >
    {% render 'modules/common-styling/forms/error_list', name: 'email', errors: user.errors.email %}
  </fieldset>

  {% comment %} Textarea {% endcomment %}
  <fieldset>
    <label for="message">Message</label>
    <textarea
      id="message"
      name="user[message]"
      rows="6"
      required
      {% render 'modules/common-styling/forms/error_input_handler', name: 'message', errors: user.errors.message %}
    >{{ user.message }}</textarea>
    {% render 'modules/common-styling/forms/error_list', name: 'message', errors: user.errors.message %}
  </fieldset>

  {% comment %} Select {% endcomment %}
  <fieldset>
    <label for="category">Category</label>
    <select id="category" name="user[category]" class="pos-form-select">
      <option value="">Select...</option>
      <option value="support" {% if user.category == 'support' %}selected{% endif %}>Support</option>
      <option value="sales" {% if user.category == 'sales' %}selected{% endif %}>Sales</option>
    </select>
  </fieldset>

  {% comment %} Checkbox {% endcomment %}
  <fieldset>
    <input type="checkbox" id="terms" name="user[terms]" required>
    <label for="terms">I agree to the terms</label>
  </fieldset>

  {% comment %} Form Actions {% endcomment %}
  <fieldset class="pos-form-actions">
    <button type="button" class="pos-button" onclick="history.back()">Cancel</button>
    <button type="submit" class="pos-button pos-button-primary">Submit</button>
  </fieldset>
</form>
```

### 4.3 Form Input Classes

| Class | Element | Purpose |
|-------|---------|---------|
| `pos-form-input` | `<input>`, `<textarea>` | Text inputs |
| `pos-form-select` | `<select>` | Dropdowns |
| `pos-form-password` | Container | Password with toggle |
| `pos-form-multiselect` | Container | Multi-select dropdown |

### 4.4 Error Handling

**EVERY input MUST have error handling:**

```liquid
{% comment %} On the input element {% endcomment %}
{% render 'modules/common-styling/forms/error_input_handler',
  name: 'field_name',
  errors: object.errors.field_name
%}

{% comment %} After the input element {% endcomment %}
{% render 'modules/common-styling/forms/error_list',
  name: 'field_name',
  errors: object.errors.field_name
%}
```

### 4.5 Password Input with Strength Meter

```liquid
{% render 'modules/common-styling/forms/password',
  name: 'password',
  id: 'password',
  value: '',
  meter: true
%}
```

### 4.6 Multiselect Dropdown

```liquid
{% parse_json options %}
[
  { "value": "opt1", "label": "Option 1" },
  { "value": "opt2", "label": "Option 2" },
  { "value": "opt3", "label": "Option 3" }
]
{% endparse_json %}

{% render 'modules/common-styling/forms/multiselect',
  id: 'categories',
  name: 'categories',
  list: options,
  selected: selected_values,
  required: true,
  showFilter: true
%}
```

### 4.7 Markdown Editor

```liquid
{% render 'modules/common-styling/forms/markdown',
  id: 'content',
  name: 'content',
  presigned_upload: presigned_upload
%}
```

### 4.8 Form Rules

**ABSOLUTE RULES:**

1. **CSRF token:** ALWAYS include `authenticity_token`
2. **Labels:** EVERY input MUST have a `<label>`
3. **Fieldsets:** Wrap related inputs in `<fieldset>`
4. **Required indicator:** Auto-added via fieldset + required input
5. **Error handling:** ALWAYS include both error partials
6. **IDs:** EVERY input MUST have unique `id` matching `for`

---

## Phase 5: Cards and Boxes

### 5.1 Card Classes

| Class | Purpose |
|-------|---------|
| `pos-card` | Standard card container |
| `pos-card pos-card-highlighted` | Emphasized card |

### 5.2 Basic Cards

```html
<div class="pos-card">
  <h3 class="pos-heading-3">Card Title</h3>
  <p>Card content goes here.</p>
</div>

<div class="pos-card pos-card-highlighted">
  <h3 class="pos-heading-3">Important Notice</h3>
  <p>This card is highlighted for emphasis.</p>
</div>
```

### 5.3 Content Card Partial

```liquid
{% render 'modules/common-styling/content/card',
  url: '/article/1',
  image: 'https://example.com/image.jpg',
  title: 'Article Title',
  content: 'Article summary text...',
  footer: 'Published Jan 28, 2026'
%}

{% comment %} Highlighted variant {% endcomment %}
{% render 'modules/common-styling/content/card',
  url: '/featured',
  image: '/images/featured.jpg',
  title: 'Featured Post',
  content: 'This is a featured article.',
  footer: 'Editor\'s Pick',
  highlighted: true
%}
```

---

## Phase 6: Tables

### 6.1 Table Structure

**Common Styling uses a custom table structure for responsiveness:**

```html
<section class="pos-table">
  {% comment %} Table Header {% endcomment %}
  <header>
    <div>Name</div>
    <div>Email</div>
    <div class="pos-table-number">Amount</div>
    <div>Actions</div>
  </header>

  {% comment %} Table Body {% endcomment %}
  <div class="pos-table-content pos-card">
    {% for item in items %}
      <ul>
        <li>
          <span class="pos-table-content-heading">Name</span>
          {{ item.name }}
        </li>
        <li>
          <span class="pos-table-content-heading">Email</span>
          {{ item.email }}
        </li>
        <li class="pos-table-number">
          <span class="pos-table-content-heading">Amount</span>
          {{ item.amount | money }}
        </li>
        <li>
          <span class="pos-table-content-heading">Actions</span>
          <a href="/items/{{ item.id }}/edit">Edit</a>
        </li>
      </ul>
    {% endfor %}
  </div>
</section>
```

### 6.2 Table Classes

| Class | Purpose |
|-------|---------|
| `pos-table` | Table container |
| `pos-table-content` | Body wrapper |
| `pos-table-number` | Right-aligned numeric column |
| `pos-table-content-heading` | Mobile column label |

**RULE:** The `pos-table-content-heading` spans are REQUIRED for mobile layouts.

---

## Phase 7: Tags and Badges

### 7.1 Tag Classes

| Class | Purpose | Color |
|-------|---------|-------|
| `pos-tag` | Base tag | Neutral |
| `pos-tag pos-tag-confirmation` | Success state | Green |
| `pos-tag pos-tag-warning` | Warning state | Yellow/Orange |
| `pos-tag pos-tag-important` | Error/danger | Red |
| `pos-tag pos-tag-interactive` | Clickable tag | Interactive |

### 7.2 Tag Examples

```html
<span class="pos-tag">Draft</span>
<span class="pos-tag pos-tag-confirmation">Published</span>
<span class="pos-tag pos-tag-warning">Pending Review</span>
<span class="pos-tag pos-tag-important">Rejected</span>
<button class="pos-tag pos-tag-interactive">Filter: Active</button>
```

### 7.3 Tags List

```html
<div class="pos-tags-list">
  <span class="pos-tag">JavaScript</span>
  <span class="pos-tag">Liquid</span>
  <span class="pos-tag">CSS</span>
</div>
```

---

## Phase 8: Navigation Components

### 8.1 Pagination

```liquid
{% render 'modules/common-styling/pagination', total_pages: total_pages %}
```

### 8.2 Collapsible Navigation

```liquid
{% parse_json nav_items %}
[
  { "label": "Home", "url": "/" },
  {
    "label": "Products",
    "url": "/products",
    "children": [
      { "label": "Category A", "url": "/products/a" },
      { "label": "Category B", "url": "/products/b" }
    ]
  },
  { "label": "Contact", "url": "/contact" }
]
{% endparse_json %}

{% render 'modules/common-styling/navigation/collapsible',
  items: nav_items,
  active: context.location.pathname
%}
```

### 8.3 Popover Menu

```html
<div class="pos-popover">
  <button popovertarget="actions-menu" class="pos-button">
    Actions
  </button>
  <menu popover id="actions-menu">
    <li><a href="/edit">Edit</a></li>
    <li><a href="/duplicate">Duplicate</a></li>
    <li><button type="button" class="danger">Delete</button></li>
  </menu>
</div>
```

### 8.4 Dialog Modal

```liquid
<button data-dialogtarget="confirm-dialog">Delete Item</button>

{% render 'modules/common-styling/content/dialog',
  id: 'confirm-dialog',
  title: 'Confirm Deletion',
  content: '<p>Are you sure you want to delete this item? This action cannot be undone.</p><div class="pos-form-actions"><button class="pos-button pos-dialog-close">Cancel</button><button class="pos-button pos-button-primary">Delete</button></div>'
%}
```

---

## Phase 9: Toast Notifications

### 9.1 Layout Setup

**MANDATORY:** Add to layout (already included in Phase 1):

```liquid
{% liquid
  theme_render_rc 'modules/common-styling/toasts'
%}
```

### 9.2 JavaScript API

```javascript
// Success notification
new pos.modules.toast('success', 'Changes saved successfully!');

// Error notification
new pos.modules.toast('error', 'Something went wrong. Please try again.');

// Info notification
new pos.modules.toast('info', 'New updates are available.');
```

### 9.3 Severity Levels

| Severity | Use Case |
|----------|----------|
| `success` | Completed actions, saved changes |
| `error` | Failed operations, validation errors |
| `info` | Neutral information, updates |

---

## Phase 10: File Upload

### 10.1 Basic Upload

```liquid
{% render 'modules/common-styling/forms/upload',
  id: 'document',
  name: 'document',
  presigned_upload: presigned_upload
%}
```

### 10.2 Image Upload with Editor

```liquid
{% render 'modules/common-styling/forms/upload',
  id: 'profile-image',
  name: 'profile_image',
  presigned_upload: presigned_upload,
  image_editor_enabled: true,
  allowed_file_types: ['image/*', '.jpg', '.jpeg', '.png'],
  max_number_of_files: 1,
  aspect_ratio: 1
%}
```

### 10.3 Upload with Existing Files

```liquid
{% parse_json existing_files %}
[
  { "id": "1", "file": { "url": "https://cdn.example.com/file1.pdf" } },
  { "id": "2", "file": { "url": "https://cdn.example.com/file2.pdf" } }
]
{% endparse_json %}

{% render 'modules/common-styling/forms/upload',
  id: 'documents',
  name: 'documents',
  presigned_upload: presigned_upload,
  files: existing_files,
  max_number_of_files: 5
%}
```

---

## Phase 11: CSS Customization

### 11.1 Override CSS Variables

**File:** `app/assets/variables.css`

```css
:root {
  /* Brand colors */
  --pos-color-button-primary-background: #1a73e8;
  --pos-color-button-primary-hover-background: #1557b0;
  --pos-color-interactive: #1a73e8;
  --pos-color-interactive-hover: #1557b0;

  /* Typography */
  --pos-font-heading: 'Inter', sans-serif;
  --pos-font-default: 'Inter', sans-serif;

  /* Spacing */
  --pos-gap-section-section: 3rem;
  --pos-gap-text-text: 1rem;

  /* Cards */
  --pos-padding-card: 1.5rem;
  --pos-radius-card: 8px;
}
```

### 11.2 Dark Mode Overrides

```css
:root {
  /* Light mode */
  --pos-color-page-background: #ffffff;
  --pos-color-content-text: #1f2937;
}

.pos-theme-dark {
  /* Dark mode */
  --pos-color-page-background: #111827;
  --pos-color-content-text: #f9fafb;
}
```

### 11.3 Load Order

**CRITICAL:** Custom CSS MUST load AFTER common-styling init:

```liquid
{% render 'modules/common-styling/init', reset: true %}
<link rel="stylesheet" href="{{ 'variables.css' | asset_url }}">
```

**NEVER load custom CSS before init—your overrides will be ignored.**

---

## Phase 12: JavaScript API

### 12.1 Global Namespace

```javascript
window.pos = {
  modules: {},         // Module APIs
  modules.active: {},  // Active instances
  translations: {},    // i18n strings
  debug: false,        // Debug mode
  csrfToken: '...'     // CSRF token
};
```

### 12.2 Available Modules

| Module | Selector | Access |
|--------|----------|--------|
| Toast | N/A | `pos.modules.toast` |
| Password | `.pos-form-password` | `pos.modules.password` |
| Multiselect | `.pos-form-multiselect` | `pos.modules.multiselect` |
| Popover | `.pos-popover` | `pos.modules.popover` |
| Dialog | `[data-dialogtarget]` | `pos.modules.dialog` |
| Collapsible | `.pos-collapsible` | `pos.modules.collapsible` |
| Upload | `.pos-upload` | `pos.modules.upload` |
| Markdown | `.pos-markdown` | `pos.modules.markdown` |

### 12.3 Custom Events

```javascript
// Dispatch custom event
document.dispatchEvent(new CustomEvent('pos-myEvent', {
  bubbles: true,
  detail: { data: 'value' }
}));

// Listen for events
document.addEventListener('pos-myEvent', (e) => {
  console.log(e.detail.data);
});
```

### 12.4 Debug Mode

```javascript
// Enable in browser console
pos.debug = true;

// Debug logging in modules
pos.modules.debug(condition, 'module-id', 'Debug message');
```

---

## Verification Checklist

**Before deploying, YOU MUST verify:**

- [ ] `escape_output_instead_of_sanitize: true` in config.yml
- [ ] `pos-app` class on `<html>` or container
- [ ] `init` partial rendered in `<head>`
- [ ] `reset: true` parameter included
- [ ] Custom CSS loads AFTER init
- [ ] Toast partial in layout body
- [ ] All forms have `authenticity_token`
- [ ] All inputs have labels and error handling
- [ ] One `pos-button-primary` per form max
- [ ] `/style-guide` accessible and renders correctly
- [ ] Dark mode tested if enabled

---

## Common Errors and Fixes

### Styles Not Applied

**Cause:** Missing `pos-app` class

**Fix:**
```html
<html class="pos-app">
```

### Custom CSS Ignored

**Cause:** Loaded before init partial

**Fix:** Move custom CSS link AFTER init render

### Form Errors Not Showing

**Cause:** Missing error partials

**Fix:** Add both `error_input_handler` and `error_list`

### Buttons Look Wrong

**Cause:** Missing `pos-button` base class

**Fix:**
```html
<button class="pos-button pos-button-primary">Save</button>
```

### Dark Mode Not Working

**Cause:** Wrong class or competing styles

**Fix:** Use `pos-theme-darkEnabled` (auto) OR `pos-theme-dark` (forced)

### Toasts Not Appearing

**Cause:** Missing toast partial in layout

**Fix:** Add `{% theme_render_rc 'modules/common-styling/toasts' %}` to body

---

## Quick Reference

### Essential Classes

```
Layout:         pos-app, pos-theme-darkEnabled, pos-theme-dark
Typography:     pos-heading-1/2/3/4, pos-supplementary, pos-prose
Buttons:        pos-button, pos-button-primary, pos-button-small
Forms:          pos-form, pos-form-simple, pos-form-input, pos-form-select
Cards:          pos-card, pos-card-highlighted
Tables:         pos-table, pos-table-content, pos-table-number
Tags:           pos-tag, pos-tag-confirmation, pos-tag-warning, pos-tag-important
Navigation:     pos-collapsible, pos-popover, pos-dialog
```

### Essential Partials

```liquid
{% render 'modules/common-styling/init', reset: true %}
{% render 'modules/common-styling/icon', icon: 'iconName' %}
{% render 'modules/common-styling/tip', content: 'text' %}
{% render 'modules/common-styling/toasts' %}
{% render 'modules/common-styling/pagination', total_pages: N %}

{% render 'modules/common-styling/forms/password', name: '', id: '', meter: true %}
{% render 'modules/common-styling/forms/multiselect', id: '', list: [], name: '' %}
{% render 'modules/common-styling/forms/markdown', id: '', name: '', presigned_upload: obj %}
{% render 'modules/common-styling/forms/upload', id: '', name: '', presigned_upload: obj %}
{% render 'modules/common-styling/forms/error_input_handler', name: '', errors: [] %}
{% render 'modules/common-styling/forms/error_list', name: '', errors: [] %}

{% render 'modules/common-styling/content/card', url: '', title: '', content: '' %}
{% render 'modules/common-styling/content/dialog', id: '', title: '', content: '' %}
{% render 'modules/common-styling/navigation/collapsible', items: [], active: '' %}
```

### Essential JavaScript

```javascript
new pos.modules.toast('success', 'Message');
new pos.modules.toast('error', 'Message');
new pos.modules.toast('info', 'Message');
```

---

## Support Files

For complete component reference with all CSS classes, custom properties, HTML examples, and Liquid partials, see:

**`./insites-style-guide.md`**

This support file contains:
- All CSS custom properties for colors, spacing, typography
- Complete HTML examples for every component
- All Liquid partial parameters and options
- JavaScript API documentation
- Quick reference tables

---

## References

- [Using Common Styling Tutorial](https://docs.insites.io/get-started/contact-us-tutorial/using-common-styling)
- [Insites Documentation](https://docs.insites.io/)
- [Style Guide (on your instance)](https://YOUR-INSTANCE/style-guide)
