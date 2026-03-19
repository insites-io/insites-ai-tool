# Insites Style Guide Documentation

Complete reference documentation for the Insites common-styling module.

---

## Table of Contents

1. [Initialization](#1-initialization)
2. [Colors](#2-colors)
3. [Gradients and Shadows](#3-gradients-and-shadows)
4. [Icons](#4-icons)
5. [Spacings](#5-spacings)
6. [Fonts](#6-fonts)
7. [Headings](#7-headings)
8. [Text Styles](#8-text-styles)
9. [Links](#9-links)
10. [Buttons](#10-buttons)
11. [Forms](#11-forms)
12. [Boxes](#12-boxes)
13. [Tables](#13-tables)
14. [Toasts](#14-toasts)
15. [Tags and Badges](#15-tags-and-badges)
16. [Navigation](#16-navigation)
17. [File Upload](#17-file-upload)
18. [JavaScript API](#18-javascript-api)

---

## 1. Initialization

All CSS (except CSS custom properties) is scoped to containers using the `pos-app` class. Apply this class to the root `html` tag to style your entire app, or add it to a specific container to limit the scope.

### CSS Classes

| Class | Purpose |
|-------|---------|
| `pos-app` | Base container class - required for all styling |
| `pos-theme-darkEnabled` | Automatic dark mode based on system preference |
| `pos-theme-dark` | Force dark mode manually |

### HTML Examples

**Basic initialization:**
```html
<html class="pos-app">
  ...
</html>
```

**With automatic dark mode:**
```html
<html class="pos-app pos-theme-darkEnabled">
  ...
</html>
```

**Force dark mode:**
```html
<html class="pos-app pos-theme-dark">
  ...
</html>
```

---

## 2. Colors

All colors are defined as CSS custom properties for consistent theming and dark mode support.

### General Content Colors

| CSS Custom Property | Purpose |
|---------------------|---------|
| `--pos-color-page-background` | Main page background |
| `--pos-color-content-background` | Content area background |
| `--pos-color-content-text` | Default text color |
| `--pos-color-content-icon` | Icon color |
| `--pos-color-content-text-supplementary` | Secondary/muted text |
| `--pos-color-content-text-prominent` | Emphasized text |
| `--pos-color-frame` | Border/frame color |
| `--pos-color-highlight-background` | Highlighted area background |
| `--pos-color-highlight-text` | Highlighted area text |
| `--pos-color-standout-background` | Standout element background |
| `--pos-color-standout-background-hover` | Standout element hover state |
| `--pos-color-standout-text` | Standout element text |

### Interactive Element Colors

| CSS Custom Property | Purpose |
|---------------------|---------|
| `--pos-color-interactive` | Default interactive color |
| `--pos-color-interactive-hover` | Interactive hover state |
| `--pos-color-interactive-active` | Interactive active state |
| `--pos-color-interactive-disabled` | Interactive disabled state |

### Primary Button Colors

| CSS Custom Property | State |
|---------------------|-------|
| `--pos-color-button-primary-background` | Default |
| `--pos-color-button-primary-frame` | Default |
| `--pos-color-button-primary-text` | Default |
| `--pos-color-button-primary-hover-background` | Hover |
| `--pos-color-button-primary-hover-frame` | Hover |
| `--pos-color-button-primary-hover-text` | Hover |
| `--pos-color-button-primary-active-background` | Active |
| `--pos-color-button-primary-active-frame` | Active |
| `--pos-color-button-primary-active-text` | Active |
| `--pos-color-button-primary-disabled-background` | Disabled |
| `--pos-color-button-primary-disabled-frame` | Disabled |
| `--pos-color-button-primary-disabled-text` | Disabled |

### Secondary Button Colors

| CSS Custom Property | State |
|---------------------|-------|
| `--pos-color-button-secondary-background` | Default |
| `--pos-color-button-secondary-frame` | Default |
| `--pos-color-button-secondary-text` | Default |
| `--pos-color-button-secondary-hover-background` | Hover |
| `--pos-color-button-secondary-hover-frame` | Hover |
| `--pos-color-button-secondary-hover-text` | Hover |
| `--pos-color-button-secondary-active-background` | Active |
| `--pos-color-button-secondary-active-frame` | Active |
| `--pos-color-button-secondary-active-text` | Active |
| `--pos-color-button-secondary-disabled-background` | Disabled |
| `--pos-color-button-secondary-disabled-frame` | Disabled |
| `--pos-color-button-secondary-disabled-text` | Disabled |

### Browser UI Colors

| CSS Custom Property | Purpose |
|---------------------|---------|
| `--pos-color-focused` | Focus ring color |
| `--pos-color-selection-background` | Text selection background |
| `--pos-color-selection-text` | Text selection foreground |

### Form Input Colors

| CSS Custom Property | State |
|---------------------|-------|
| `--pos-color-input-placeholder` | Placeholder text |
| `--pos-color-input-background` | Default |
| `--pos-color-input-frame` | Default |
| `--pos-color-input-text` | Default |
| `--pos-color-input-hover-background` | Hover |
| `--pos-color-input-hover-frame` | Hover |
| `--pos-color-input-hover-text` | Hover |
| `--pos-color-input-active-background` | Active/Focus |
| `--pos-color-input-active-frame` | Active/Focus |
| `--pos-color-input-active-text` | Active/Focus |
| `--pos-color-input-disabled-background` | Disabled |
| `--pos-color-input-disabled-frame` | Disabled |
| `--pos-color-input-disabled-text` | Disabled |

### Status/Utility Colors

| CSS Custom Property | Purpose |
|---------------------|---------|
| `--pos-color-important` | Error/danger states |
| `--pos-color-important-hover` | Error hover |
| `--pos-color-important-disabled` | Error disabled |
| `--pos-color-warning` | Warning states |
| `--pos-color-warning-hover` | Warning hover |
| `--pos-color-warning-disabled` | Warning disabled |
| `--pos-color-confirmation` | Success states |
| `--pos-color-confirmation-hover` | Success hover |
| `--pos-color-confirmation-disabled` | Success disabled |

### Usage Example

```css
.my-custom-element {
  background: var(--pos-color-content-background);
  color: var(--pos-color-content-text);
  border: 1px solid var(--pos-color-frame);
}

.my-custom-element:hover {
  background: var(--pos-color-highlight-background);
}
```

---

## 3. Gradients and Shadows

### Legibility Gradient

When placing text on top of images, use the legibility gradient to ensure contrast remains high.

| CSS Custom Property | Purpose |
|---------------------|---------|
| `--pos-gradient-legibility` | Eased gradient for text legibility over images |

| CSS Class | Purpose |
|-----------|---------|
| `pos-increaseLegibility` | Pre-defined class for legibility enhancement |

**Warning:** The `pos-increaseLegibility` class relies on relative positioning and may affect your layout in some cases. Use with caution.

### Usage Examples

**Using CSS custom property:**
```css
.image-with-text {
  background: var(--pos-gradient-legibility);
}
```

**Using pre-defined class:**
```html
<div class="image-container pos-increaseLegibility">
  <img src="background.jpg" alt="">
  <p>Text over image</p>
</div>
```

---

## 4. Icons

Icons are rendered using the Liquid render function.

### Syntax

```liquid
{% render 'modules/common-styling/icon', icon: 'ICON_NAME' %}
```

### Example

```liquid
{% render 'modules/common-styling/icon', icon: 'dashDown' %}
{% render 'modules/common-styling/icon', icon: 'x' %}
```

---

## 5. Spacings

Consistent spacing using CSS custom properties and utility classes.

### CSS Custom Properties

| Property | Purpose |
|----------|---------|
| `--pos-gap-section-section` | Space between sections |
| `--pos-gap-text-text` | Space between text blocks |

### Utility Classes

| Class | Purpose | Property Used |
|-------|---------|---------------|
| `pos-gap-section-section` | Gap between sections | `--pos-gap-section-section` |
| `pos-mt-section-section` | Margin-top for sections | `--pos-gap-section-section` |
| `pos-gap-text-text` | Gap between text elements | `--pos-gap-text-text` |
| `pos-mt-text-text` | Margin-top for text | `--pos-gap-text-text` |

### Usage Example

```html
<section class="pos-gap-section-section">
  <article>Section 1</article>
  <article>Section 2</article>
</section>

<div class="pos-mt-section-section">
  Content with section margin
</div>
```

---

## 6. Fonts

### CSS Custom Properties

| Property | Purpose |
|----------|---------|
| `--pos-font-default` | Default body font family |
| `--pos-font-heading` | Heading font family |

### Available Font Weights

- Light
- Regular
- Medium
- Semi Bold
- Bold

### Character Set

```
BbCc123 ABCDEFGHIJKLMNOPRSTUVWXYZ abcdefghijklmnoprstuvwxyz 1234567890 <>/@&!%?+
```

### Usage Example

```css
.custom-heading {
  font-family: var(--pos-font-heading);
  font-weight: 600; /* Semi Bold */
}

.custom-body {
  font-family: var(--pos-font-default);
  font-weight: 400; /* Regular */
}
```

---

## 7. Headings

### CSS Classes

| Class | Element | Purpose |
|-------|---------|---------|
| `pos-heading-1` | `<h1>` | Primary page heading |
| `pos-heading-2` | `<h2>` | Section heading |
| `pos-heading-3` | `<h3>` | Subsection heading |
| `pos-heading-4` | `<h4>` | Minor heading |

### HTML Examples

```html
<h1 class="pos-heading-1">The quick brown fox jumps over the lazy dog</h1>
<h2 class="pos-heading-2">The quick brown fox jumps over the lazy dog</h2>
<h3 class="pos-heading-3">The quick brown fox jumps over the lazy dog</h3>
<h4 class="pos-heading-4">The quick brown fox jumps over the lazy dog</h4>
```

---

## 8. Text Styles

### Supplementary Text (Sidenote)

For secondary, less prominent text.

| Class | Purpose |
|-------|---------|
| `pos-supplementary` | Muted/secondary text style |

```html
<span class="pos-supplementary">The quick brown fox jumps over the lazy dog</span>
```

### Tip

For helpful hints and tips.

| Class | Purpose |
|-------|---------|
| `pos-tip` | Tip/hint styling |

```liquid
{% render 'modules/common-styling/tip', content: 'The quick brown fox jumps over the lazy dog' %}
```

### Long-form Content (Prose)

For articles, blog posts, and other long-form content.

| Class | Purpose |
|-------|---------|
| `pos-prose` | Optimized typography for long text |

```html
<article class="pos-prose">
  <p>Long form content here...</p>
</article>
```

---

## 9. Links

Links are styled automatically within `pos-app` containers.

### States

- Default
- Hover
- Active
- Focused

### Link Types

- Text links
- Icon links
- Text with icon

### HTML Example

```html
<p>
  Lorem ipsum dolor sit amet <a href="#">consectetur</a> adipisicing elit.
  Aut quisquam nemo ipsam <a href="#">quo placeat</a> voluptate voluptates
  doloribus magnam error dolorum vero corrupti <a href="#">aliquam nobis nesciunt</a>,
  qui debitis cumque perferendis provident?
</p>
```

### Debug Classes (for Style Guide only)

| Class | Purpose |
|-------|---------|
| `pos-debug-link-hover` | Force hover state display |
| `pos-debug-link-active` | Force active state display |
| `pos-debug-link-focus` | Force focus state display |

**Note:** When overwriting `<a>` classes, remember to also overwrite the debug classes used in the style guide.

---

## 10. Buttons

### CSS Classes

| Class | Purpose |
|-------|---------|
| `pos-button` | Base button class (secondary style) |
| `pos-button-primary` | Primary/emphasized button |
| `pos-button-small` | Smaller button variant |

### States

- Enabled (default)
- Hover
- Active
- Focused
- Disabled

### HTML Examples

**Secondary button (default):**
```html
<button class="pos-button">Button</button>
```

**Primary button:**
```html
<button class="pos-button pos-button-primary">Button</button>
```

**Small button:**
```html
<button class="pos-button pos-button-small">Button</button>
```

**Small primary button:**
```html
<button class="pos-button pos-button-small pos-button-primary">Button</button>
```

**Disabled button:**
```html
<button class="pos-button" disabled>Button</button>
<button class="pos-button pos-button-primary" disabled>Button</button>
```

### Button Variants

- Standard button
- Icon button
- Link styled as button

### Debug Classes (for Style Guide only)

| Class | Purpose |
|-------|---------|
| `pos-debug-button-hover` | Force hover state display |
| `pos-debug-button-active` | Force active state display |
| `pos-debug-button-focus-visible` | Force focus state display |

---

## 11. Forms

### Form Container Classes

| Class | Purpose |
|-------|---------|
| `pos-form` | Complex forms with manual styling control |
| `pos-form-simple` | Simple forms with automatic child styling |

### Form Structure Classes

| Class | Purpose |
|-------|---------|
| `pos-form-fieldset` | Group related form fields |
| `pos-form-fieldset-combined` | Combined/inline fieldset |
| `pos-form-actions` | Form action buttons container |

### Input Classes

| Class | Purpose |
|-------|---------|
| `pos-form-input` | Text inputs and textareas |
| `pos-form-password` | Password input container |
| `pos-form-multiselect` | Multi-select dropdown |
| `pos-form-select` | Standard select dropdown |

### CSS Custom Properties

| Property | Purpose |
|----------|---------|
| `--pos-gap-text-text` | Spacing between form elements |

### Basic Form Example

```html
<form action="" class="pos-form pos-form-simple">
  <fieldset>
    <label for="email">Email</label>
    <input type="email" id="email" placeholder="Email address" required>
  </fieldset>

  <fieldset>
    <label for="password">Password</label>
    <input type="password" id="password" placeholder="••••••••" required>
  </fieldset>

  <fieldset>
    <input type="checkbox" id="agreement" required>
    <label for="agreement">An agreement</label>
  </fieldset>

  <div class="pos-form-actions">
    <button type="submit" class="pos-button pos-button-primary">Submit</button>
  </div>
</form>
```

### Labels

Labels placed in a `fieldset` with a `required` input are automatically marked with an asterisk.

```html
<fieldset>
  <label for="input-id">My label</label>
  <input type="text" id="input-id" required>
</fieldset>
```

### Text Input

| States | Description |
|--------|-------------|
| Placeholder | Empty with placeholder text |
| Filled | Contains user input |
| Default | Normal state |
| Hover | Mouse over |
| Focused | Keyboard focus |
| Disabled | Cannot interact |
| Error | Validation failed |

```html
<input type="text" class="pos-form-input" placeholder="Text input">
<textarea class="pos-form-input" placeholder="Textarea"></textarea>
```

### Debug Classes (for Style Guide only)

| Class | Purpose |
|-------|---------|
| `pos-debug-form-input-hover` | Force hover state |
| `pos-debug-form-input-focus-visible` | Force focus state |

### Password Input

Rendered via Liquid partial with optional strength meter.

```liquid
{% render 'modules/common-styling/forms/password',
  name: 'user-password',
  value: '',
  id: 'user-password',
  meter: true
%}
```

#### Password Input Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Input name attribute |
| `id` | string | Yes | Input id attribute |
| `value` | string | No | Current input value |
| `class` | string | No | Additional classes for container |
| `meter` | bool | No | Show password strength meter |

#### Password Strength Guidelines

Strong passwords consist of:
- Small and capitalized letters
- Numbers
- Special signs
- At least 6 characters long

Strength levels: Weak, Fair, Strong

### Select Input

```html
<select class="pos-form-select">
  <option value="1">Default 1</option>
  <option value="2">Default 2</option>
  <option value="3">Default 3</option>
  <option value="4" disabled>Disabled 1</option>
</select>
```

### Multiselect

```liquid
{% render 'modules/common-styling/forms/multiselect',
  name: 'categories',
  id: 'categories-select',
  list: list,
  selected: selected_values
%}
```

#### Multiselect Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier |
| `list` | array | Yes | Items array: `[{ value: 'val', label: 'Label' }]` |
| `selected` | array | No | Pre-selected values: `['val1', 'val2']` |
| `form` | string | No | Form element reference |
| `name` | string | No | Name for checkbox inputs |
| `required` | bool | No | At least one option required |
| `combine_selected` | bool | No | Show "2 selected" instead of names |
| `multiline` | bool | No | Allow vertical expansion |
| `showFilter` | bool | No | Enable filtering |
| `placeholder` | string | No | Translation key for main input |
| `placeholder_filter` | string | No | Translation key for filter |
| `placeholder_empty` | string | No | Translation key for no results |

#### Multiselect List Format

```liquid
{% parse_json list %}
[
  { "value": "item1", "label": "Item 1" },
  { "value": "item2", "label": "Item 2" },
  { "value": "item3", "label": "Item 3" }
]
{% endparse_json %}
```

### Markdown Editor

```liquid
{% render 'modules/common-styling/forms/markdown',
  id: 'content-editor',
  name: 'content',
  presigned_upload: presigned_upload
%}
```

### Error Handling

#### Input with Error Handler

```html
<input
  type="text"
  name="field-name"
  id="field-name"
  class="pos-form-input"
  {% render 'modules/common-styling/forms/error_input_handler',
    name: 'field-name',
    errors: errors['field-name']
  %}
>
```

#### Error List Display

```liquid
{% render 'modules/common-styling/forms/error_list',
  name: 'field-name',
  errors: errors['field-name']
%}
```

#### Complete Field with Error Handling

```html
<fieldset>
  <label for="email">Email</label>
  <input
    type="email"
    id="email"
    name="email"
    placeholder="Email address"
    required
    {% render 'modules/common-styling/forms/error_input_handler',
      name: 'email',
      errors: errors['email']
    %}
  >
  {% render 'modules/common-styling/forms/error_list',
    name: 'email',
    errors: errors['email']
  %}
</fieldset>
```

---

## 12. Boxes

### Card

Basic card container with padding and rounded corners.

| Class | Purpose |
|-------|---------|
| `pos-card` | Standard card container |

| CSS Property | Purpose |
|--------------|---------|
| `--pos-padding-card` | Card internal padding |
| `--pos-radius-card` | Card corner radius |
| `--pos-color-content-background` | Card background color |

```html
<div class="pos-card">
  Card content here
</div>
```

### Highlighted Card

Card with emphasis/highlight styling.

| Class | Purpose |
|-------|---------|
| `pos-card pos-card-highlighted` | Highlighted card variant |

| CSS Property | Purpose |
|--------------|---------|
| `--pos-color-highlight-background` | Highlighted background |

```html
<div class="pos-card pos-card-highlighted">
  Highlighted card content
</div>
```

### Content Card (Rich)

Pre-built card component with image, title, content, and footer.

```liquid
{% render 'modules/common-styling/content/card',
  url: '/link-destination',
  image: 'https://example.com/image.jpg',
  title: 'Card Title',
  content: 'Card description text',
  footer: '<ul><li>Item</li></ul> Footer text'
%}
```

#### Content Card with Highlight

```liquid
{% render 'modules/common-styling/content/card',
  url: '/link-destination',
  image: 'https://example.com/image.jpg',
  title: 'Lorem ipsum dolor sit amet',
  content: 'Quisque vel velit mi. Proin malesuada iaculis viverra.',
  footer: 'Footer text',
  highlighted: true
%}
```

---

## 13. Tables

Tables use a custom structure for responsive behavior.

### CSS Classes

| Class | Purpose |
|-------|---------|
| `pos-table` | Table container |
| `pos-table-content` | Table body wrapper |
| `pos-table-number` | Right-aligned numeric column |
| `pos-table-content-heading` | Mobile column label |

### CSS Custom Properties

| Property | Purpose |
|----------|---------|
| `--pos-padding-cell` | Table cell padding |

### HTML Structure

```html
<section class="pos-table">
  <!-- Table Header -->
  <header>
    <div>Column 1</div>
    <div>Column 2</div>
    <div class="pos-table-number">Column 3</div>
  </header>

  <!-- Table Body -->
  <div class="pos-table-content pos-card">
    <!-- Row 1 -->
    <ul>
      <li>
        <span class="pos-table-content-heading">Column 1</span>
        Content 1
      </li>
      <li>
        <span class="pos-table-content-heading">Column 2</span>
        Content 2
      </li>
      <li class="pos-table-number">
        <span class="pos-table-content-heading">Column 3</span>
        321
      </li>
    </ul>

    <!-- Row 2 -->
    <ul>
      <li>
        <span class="pos-table-content-heading">Column 1</span>
        Another row
      </li>
      <li>
        <span class="pos-table-content-heading">Column 2</span>
        More content
      </li>
      <li class="pos-table-number">
        <span class="pos-table-content-heading">Column 3</span>
        456
      </li>
    </ul>
  </div>
</section>
```

**Note:** The `pos-table-content-heading` spans are used for mobile layouts where columns stack vertically and need labels.

---

## 14. Toasts

Toast notifications for user feedback.

### Initialization

Add to your layout to enable flash messages:

```liquid
{% liquid
  function flash = 'modules/core/commands/session/get', key: 'sflash'
  if context.location.pathname != flash.from or flash.force_clear
    function _ = 'modules/core/commands/session/clear', key: 'sflash'
  endif
  render 'modules/common-styling/toasts', params: flash
%}
```

### JavaScript API

```javascript
new pos.modules.toast(severity, message);
```

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `severity` | string | Importance level: `'error'`, `'success'`, `'info'` |
| `message` | string | User-readable message text |

### Examples

```javascript
// Error notification
new pos.modules.toast('error', 'Something went wrong. Please try again.');

// Success notification
new pos.modules.toast('success', 'Your changes have been saved.');

// Info notification
new pos.modules.toast('info', 'New updates are available.');
```

### Toast Types

| Type | Use Case |
|------|----------|
| `error` | Failed operations, validation errors |
| `success` | Successful operations, confirmations |
| `info` | Neutral information, updates |

---

## 15. Tags and Badges

### CSS Classes

| Class | Purpose |
|-------|---------|
| `pos-tag` | Base tag class |
| `pos-tag-confirmation` | Success/confirmation variant |
| `pos-tag-warning` | Warning variant |
| `pos-tag-important` | Error/important variant |
| `pos-tag-interactive` | Clickable/interactive variant |

### CSS Custom Properties

| Property | Purpose |
|----------|---------|
| `--pos-radius-tag` | Tag corner radius |
| `--pos-gap-tag-tag` | Space between tags |

### HTML Examples

**Default tag:**
```html
<span class="pos-tag">Default</span>
```

**Confirmation tag:**
```html
<span class="pos-tag pos-tag-confirmation">Approved</span>
```

**Warning tag:**
```html
<span class="pos-tag pos-tag-warning">Pending</span>
```

**Important/Error tag:**
```html
<span class="pos-tag pos-tag-important">Rejected</span>
```

**Interactive tag:**
```html
<button class="pos-tag pos-tag-interactive">Click me</button>
```

### Tags List

Container for multiple tags:

```html
<div class="pos-tags-list">
  <span class="pos-tag">Tag 1</span>
  <span class="pos-tag">Tag 2</span>
  <span class="pos-tag pos-tag-confirmation">Active</span>
</div>
```

---

## 16. Navigation

### Pagination

```liquid
{% render 'modules/common-styling/pagination', total_pages: 20 %}
```

Generates page links with "Go to page X" actions.

### Collapsible Navigation

Multi-level collapsible navigation menu.

| Class | Purpose |
|-------|---------|
| `pos-collapsible` | Collapsible list container |

#### Navigation Data Structure

```liquid
{% parse_json navigation %}
[
  {
    "label": "Insites",
    "url": "https://www.platformos.com"
  },
  {
    "label": "Solutions",
    "url": "https://www.platformos.com/enterprise-solutions",
    "children": [
      {
        "label": "Circularity",
        "url": "https://www.platformos.com/circularity-solutions"
      },
      {
        "label": "MVP",
        "url": "https://www.platformos.com/build-an-enterprise-mvp"
      }
    ]
  },
  {
    "label": "Developers",
    "children": [
      {
        "label": "Documentation",
        "url": "https://docs.insites.io/",
        "children": [
          {
            "label": "Get Started Guide",
            "url": "https://docs.insites.io/get-started"
          }
        ]
      },
      {
        "label": "FAQ",
        "url": "https://www.platformos.com/faq"
      }
    ]
  }
]
{% endparse_json %}
```

#### Render Collapsible Navigation

```liquid
{% render 'modules/common-styling/navigation/collapsible',
  items: navigation,
  active: 'https://docs.insites.io/get-started'
%}
```

### Popover

| Class | Purpose |
|-------|---------|
| `pos-popover` | Popover container |

#### Basic Popover

```html
<button popovertarget="my-popover" class="pos-button">Open Popover</button>
<div popover id="my-popover">
  Popover content here
</div>
```

#### Popover Menu

```html
<div class="pos-popover">
  <button popovertarget="menu-popover" class="pos-button">Menu</button>
  <menu popover id="menu-popover">
    <li><a href="/option1">Option 1</a></li>
    <li><a href="/option2">Option 2</a></li>
    <li><button type="button">Action</button></li>
  </menu>
</div>
```

### Dialog

Modal dialog component.

| Class | Purpose |
|-------|---------|
| `pos-dialog` | Dialog container |
| `pos-dialog-header` | Dialog header area |
| `pos-dialog-close` | Close button |
| `pos-label` | Visually hidden label |

#### Manual Dialog HTML

```html
<button data-dialogtarget="my-dialog">Open Dialog</button>

<dialog class="pos-dialog" id="my-dialog">
  <header class="pos-dialog-header">
    <h2 class="pos-heading-2">Dialog Title</h2>
    <button title="close" class="pos-dialog-close">
      <span class="pos-label">Close</span>
      {% render 'modules/common-styling/icon', icon: 'x' %}
    </button>
  </header>

  <p>Dialog content goes here...</p>

  <div class="pos-form-actions">
    <button class="pos-button pos-dialog-close">Cancel</button>
    <button class="pos-button pos-button-primary">Confirm</button>
  </div>
</dialog>
```

#### Dialog via Liquid Partial

```liquid
<button data-dialogtarget="my-dialog">Open Dialog</button>

{% render 'modules/common-styling/content/dialog',
  id: 'my-dialog',
  title: 'Dialog Title',
  content: '<p>Dialog content goes here...</p>'
%}
```

---

## 17. File Upload

| Class | Purpose |
|-------|---------|
| `pos-upload` | Upload component container |

### Basic Upload

```liquid
{% render 'modules/common-styling/forms/upload',
  id: 'document-upload',
  presigned_upload: presigned_upload,
  name: 'document'
%}
```

### Upload with Existing Files

```liquid
{% parse_json files %}
[
  {
    "id": "1",
    "file": {
      "url": "https://cdn.example.com/uploads/file1.png"
    }
  },
  {
    "id": "2",
    "file": {
      "url": "https://cdn.example.com/uploads/file2.txt"
    }
  }
]
{% endparse_json %}

{% render 'modules/common-styling/forms/upload',
  id: 'document-upload',
  presigned_upload: presigned_upload,
  name: 'document',
  files: files
%}
```

### Upload Attributes

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Input name for uploaded file URLs |
| `presigned_upload` | object | Yes | Upload config from `property_upload_presigned_url` query |
| `files` | array | No | Previously uploaded files from `property_upload` query |
| `image_editor_enabled` | bool | No | Enable image editing |
| `allowed_file_types` | array | No | Accepted types: `['image/*', '.jpg', '.png']` |
| `max_number_of_files` | int | No | Maximum files allowed |
| `aspect_ratio` | float | No | Image crop ratio (1 = square, 1.78 = 16:9) |

### Example with All Options

```liquid
{% render 'modules/common-styling/forms/upload',
  id: 'profile-image',
  presigned_upload: presigned_upload,
  name: 'profile_image',
  image_editor_enabled: true,
  allowed_file_types: ['image/*', '.jpg', '.jpeg', '.png', '.gif'],
  max_number_of_files: 1,
  aspect_ratio: 1
%}
```

---

## 18. JavaScript API

### Global Namespace

```javascript
window.pos = {};
window.pos.modules = {};
window.pos.modules.active = {};
window.pos.translations = {};
window.pos.debug = false;
window.pos.csrfToken = 'your-csrf-token';
```

### Module Loading

Modules are loaded automatically on `DOMContentLoaded` based on selector presence.

| Module | Selector | Instance Variable |
|--------|----------|-------------------|
| Password | `.pos-form-password` | `window.pos.modules.password` |
| Multiselect | `.pos-form-multiselect` | `window.pos.modules.multiselect` |
| Popover | `.pos-popover` | `window.pos.modules.popover` |
| Dialog | `[data-dialogtarget]` | `window.pos.modules.dialog` |
| Collapsible | `.pos-collapsible` | `window.pos.modules.collapsible` |
| Upload | `.pos-upload` | `window.pos.modules.upload` |
| Markdown | `.pos-markdown` | `window.pos.modules.markdown` |
| Code Highlight | `pre code` | `window.pos.modules.code` |

### Load Content Module

Dynamic content loading via AJAX.

```javascript
pos.modules.load();
```

#### Data Attributes

| Attribute | Purpose |
|-----------|---------|
| `data-load-content` | URL to load content from |
| `data-load-target` | Target element selector |
| `data-load-method` | HTTP method (GET, POST) |
| `data-load-trigger-type` | Event trigger type |

### Toast API

```javascript
// Create toast notification
new pos.modules.toast('success', 'Operation completed!');
new pos.modules.toast('error', 'Something went wrong.');
new pos.modules.toast('info', 'Information message.');
```

---

## Quick Reference

### Essential Classes

```
pos-app                    # Root container (required)
pos-theme-darkEnabled      # Auto dark mode
pos-theme-dark             # Force dark mode

pos-heading-1/2/3/4        # Headings
pos-supplementary          # Secondary text
pos-prose                  # Long-form content

pos-button                 # Secondary button
pos-button-primary         # Primary button
pos-button-small           # Small button

pos-form                   # Complex form
pos-form-simple            # Auto-styled form
pos-form-input             # Text inputs
pos-form-select            # Select dropdown
pos-form-password          # Password input
pos-form-multiselect       # Multi-select

pos-card                   # Card container
pos-card-highlighted       # Highlighted card

pos-table                  # Table container
pos-table-number           # Numeric column

pos-tag                    # Base tag
pos-tag-confirmation       # Success tag
pos-tag-warning            # Warning tag
pos-tag-important          # Error tag

pos-collapsible            # Collapsible nav
pos-popover                # Popover container
pos-dialog                 # Dialog modal

pos-upload                 # File upload
```

### Essential Liquid Partials

```liquid
{% render 'modules/common-styling/icon', icon: 'iconName' %}
{% render 'modules/common-styling/tip', content: 'text' %}
{% render 'modules/common-styling/pagination', total_pages: N %}
{% render 'modules/common-styling/toasts', params: flash %}

{% render 'modules/common-styling/forms/password', name: '', id: '', meter: true %}
{% render 'modules/common-styling/forms/multiselect', id: '', list: [], name: '' %}
{% render 'modules/common-styling/forms/markdown', id: '', name: '', presigned_upload: obj %}
{% render 'modules/common-styling/forms/upload', id: '', name: '', presigned_upload: obj %}
{% render 'modules/common-styling/forms/error_input_handler', name: '', errors: [] %}
{% render 'modules/common-styling/forms/error_list', name: '', errors: [] %}

{% render 'modules/common-styling/content/card', url: '', image: '', title: '', content: '' %}
{% render 'modules/common-styling/content/dialog', id: '', title: '', content: '' %}
{% render 'modules/common-styling/navigation/collapsible', items: [], active: '' %}
```
