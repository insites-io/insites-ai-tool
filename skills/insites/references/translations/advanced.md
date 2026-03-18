# Translations Advanced Techniques

## Dynamic Language Detection and Switching

Implement intelligent language routing:

```liquid
<!-- Detect from URL, parameter, or Accept-Language header -->
{% assign url_lang = request.path_parts | first %}
{% if context.available_languages | contains: url_lang %}
  {% context language: url_lang %}
{% elsif params.lang %}
  {% context language: params.lang %}
  <!-- Redirect to language-specific URL -->
  {% redirect_to request.path | prepend: '/' | prepend: params.lang %}
{% elsif context.browser_language %}
  {% context language: context.browser_language %}
{% endif %}
```

## Namespace Translation Organization

Organize translations by feature/module:

```yaml
# app/translations/en.yml
# Clear hierarchy prevents key collisions
users:
  profile:
    title: "User Profile"
    edit_button: "Edit Profile"
  settings:
    title: "User Settings"
    save_button: "Save Settings"

products:
  listing:
    title: "Products"
    filters: "Filters"
  detail:
    title: "Product Details"
    add_to_cart: "Add to Cart"
```

## Translation Key Enumeration

List available translations programmatically:

```liquid
{% assign language = context.language %}
{% graphql available_keys = 'get_translation_keys', language: language %}

<ul class="translation-keys">
  {% for key in available_keys.keys %}
    <li>
      {{ key }}: {{ key | t }}
    </li>
  {% endfor %}
</ul>
```

## Custom Translation Filters

Create domain-specific translation helpers:

```liquid
<!-- app/partials/translate-with-fallback.liquid -->
{% capture translation %}{{ key | t: default: default }}{% endcapture %}

{% if translation == key %}
  <!-- Key not found, show placeholder -->
  [MISSING: {{ key }}]
{% else %}
  {{ translation }}
{% endif %}

<!-- Use in templates -->
{% include 'translate-with-fallback', key: 'page.title', default: 'Untitled' %}
```

## Translation Caching Strategy

Cache expensive translation lookups:

```liquid
{% assign cache_key = 'translations-' | append: context.language %}
{% cache cache_key, expire: 86400 %}
  {% graphql all_translations = 'get_all_translations', language: context.language %}
  {{ all_translations | json }}
{% endcache %}
```

## Contextual Plural Forms

Handle complex pluralization rules:

```yaml
# Different plural rules for different languages
# English
items:
  one: "1 item"
  other: "%{count} items"

# Russian (complex rules)
books:
  one: "1 книга"
  few: "%{count} книги"
  many: "%{count} книг"
```

## Rich Text Translation with Markdown

Include formatted text in translations:

```yaml
# app/translations/en.yml
messages:
  important: "**Warning:** This action cannot be undone."
  instructions: "1. Click button\n2. Confirm\n3. Done"
```

```liquid
{{ 'messages.important' | t | markdownify }}
{{ 'messages.instructions' | t | markdownify }}
```

## Translation Performance Optimization

Pre-load translations for current page:

```liquid
{% comment %} Load only needed translations {% endcomment %}
{% graphql page_translations = 'get_translations_for_page',
  page: page.name,
  language: context.language
%}

{% cache 'page-translations-' | append: page.name | append: '-' | append: context.language, expire: 86400 %}
  {{ page_translations | json }}
{% endcache %}
```

## Fallback Language Chain

Implement fallback language hierarchy:

```liquid
{% assign language_chain = context.language | split: '-' %}
<!-- For 'pt-BR', try 'pt-BR' then 'pt' then default -->

{% assign current_translation = 'key' | t %}

{% if current_translation == 'key' and language_chain.size > 1 %}
  <!-- Try parent language -->
  {% context language: language_chain.first %}
  {% assign current_translation = 'key' | t %}
{% endif %}

{{ current_translation }}
```

## Translation Statistics and Coverage

Monitor translation completeness:

```liquid
<div class="translation-stats">
  <p>Language: {{ context.language }}</p>
  {% graphql stats = 'get_translation_stats', language: context.language %}
  <p>Coverage: {{ stats.coverage | multiply: 100 | round: 1 }}%</p>
  <p>Missing Keys: {{ stats.missing_count }}</p>
</div>
```

## Dynamic Translation Updates

Update translations without redeployment:

```liquid
{% if context.current_user.is_admin %}
  <!-- Admin can edit translations live -->
  {% graphql translations = 'get_editable_translations' %}

  {% for key, value in translations %}
    <input name="translations[{{ key }}]" value="{{ value }}" />
  {% endfor %}
{% endif %}
```

Store dynamic translations in database with fallback to YAML.

## See Also

- [Configuration Guide](./configuration.md)
- [API Reference](./api.md)
- [Patterns Guide](./patterns.md)
- [Gotchas & Issues](./gotchas.md)
