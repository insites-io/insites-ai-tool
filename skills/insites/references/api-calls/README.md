# API Calls (External API Integration)

Insites can call external REST APIs via the `api_calls` directory or using `download_file` filter.

## Location

`app/api_calls/`

> **Module path:** When building a module, use `modules/<module_name>/public/api_calls/` for API call definitions accessible to the app and other modules, or `modules/<module_name>/private/api_calls/` for API calls only used within the module.

## API Call Definition

```liquid
{% comment %} app/api_calls/slack_notification.liquid {% endcomment %}
---
to: https://hooks.slack.com/services/{{ context.constants.SLACK_WEBHOOK }}
format: http
request_type: POST
request_headers: >
  {
    "Content-Type": "application/json"
  }
---
{
  "text": "{{ data.message }}"
}
```

## Using download_file Filter

For simpler API calls, use the `download_file` filter:

```liquid
{% assign response = 'https://api.example.com/data' | download_file %}
{% assign data = response | parse_json %}
```

With max size:
```liquid
{% assign response = url | download_file: 5242880 %}
```

## Storing API Credentials

Always use constants:

```bash
insites-cli constants set --name SLACK_WEBHOOK --value "T00000000/B00000000/XXXXXXX" dev
insites-cli constants set --name API_BASE_URL --value "https://api.example.com" dev
```

Access in templates:
```liquid
{{ context.constants.API_BASE_URL }}
{{ context.constants.SLACK_WEBHOOK }}
```

## Rules

- NEVER hardcode API keys or URLs
- Store all credentials in constants
- Use `api_calls/` for structured API integrations
- Use `download_file` for simple GET requests
- Handle API calls in background jobs when possible
- Use `try/catch` for error handling on external calls
