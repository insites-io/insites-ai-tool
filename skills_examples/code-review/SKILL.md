---
name: code-review
description: Comprehensive code review for Insites applications with focus on quality, security, and architecture compliance.
---

# code-review

## Expertise
- Insites architecture patterns
- Liquid templating best practices
- Security vulnerabilities (injection, XSS, CSRF)
- Performance optimization
- Code quality and maintainability

## Review Checklist

### Architecture Compliance
- [ ] Pages contain only routing and data prep (no HTML/JS/CSS)
- [ ] Business logic is in commands (`app/lib/commands/`)
- [ ] GraphQL only in `.graphql` files
- [ ] Partials use `render` not `include`
- [ ] Partial filenames have no `_` prefix
- [ ] Forms use HTML only (no `{% form %}` tag)

### Code Quality
- [ ] Code follows project style guide
- [ ] No code duplication
- [ ] Clear naming conventions
- [ ] Appropriate comments for complex logic
- [ ] Error handling and edge cases covered

### Security
- [ ] NO `/api/graph` from application or JS code
- [ ] Input validation and sanitization
- [ ] No SQL/GraphQL injection vulnerabilities
- [ ] No XSS vulnerabilities in templates
- [ ] Proper authentication/authorization checks
- [ ] Sensitive data not exposed

### Internationalization
- [ ] All user-facing text in i18n YAML files
- [ ] No hardcoded strings in partials
- [ ] Translations properly referenced

### Testing
- [ ] Unit tests for business logic
- [ ] Tests pass successfully
- [ ] Edge cases covered

## Severity Classification

### Critical (Must Fix)
**Security issues that could lead to:**
- Data breach or unauthorized access
- XSS or injection attacks
- Authentication bypass

**Examples:**
```liquid
# CRITICAL: XSS vulnerability
{{ user_input }}
# Fix: {{ user_input | escape }}

# CRITICAL: GraphQL injection
{% assign q = 'query { users(name: "' | append: params.name | append: '") }' %}
# Fix: Use parameterized queries
```

### Warnings (Should Fix)
**Code quality issues:**
- Architecture violations
- Missing error handling
- No unit tests for commands
- Hardcoded text

**Examples:**
```liquid
# WARNING: Business logic in page
{% liquid
  assign total = 0
  for item in cart.items
    assign total = total | plus: item.price
  endfor
%}
# Fix: Move to app/lib/commands/cart/calculate_total.liquid
```

### Suggestions (Nice to Have)
**Improvements:**
- Code style
- Better naming
- Documentation
- Performance optimizations

## Review Examples

### Critical Issue Report
```markdown
### Critical Issues (Must Fix)

**1. Security: XSS Vulnerability**
- **File:** `app/views/partials/comments/item.liquid:15`
- **Issue:** User content rendered without escaping
- **Code:** `{{ comment.body }}`
- **Risk:** Attackers can inject malicious scripts
- **Fix:** `{{ comment.body | escape }}`
```

### Warning Report
```markdown
### Warnings (Should Fix)

**1. Architecture: Business logic in page**
- **File:** `app/views/pages/orders/create.liquid:12-35`
- **Issue:** Order validation and creation logic in page
- **Impact:** Cannot unit test, code duplication risk
- **Fix:** Move to `app/lib/commands/orders/create.liquid`

**2. i18n: Hardcoded text**
- **File:** `app/views/partials/buttons/submit.liquid:3`
- **Issue:** `<button>Submit</button>`
- **Fix:** `<button>{{ 'buttons.submit' | t }}</button>`
```

### Suggestion Report
```markdown
### Suggestions (Nice to Have)

**1. Naming: Unclear variable name**
- **File:** `app/lib/commands/posts/create.liquid:8`
- **Current:** `assign x = post.title | downcase`
- **Suggested:** `assign slug = post.title | downcase | handleize`
```

## Decision Guidance

**When to mark Critical:**
- Security vulnerabilities
- Data integrity risks
- Production-breaking issues

**When to mark Warning:**
- Architecture violations
- Missing tests
- Code maintainability issues

**When to mark Suggestion:**
- Style improvements
- Optional optimizations
- Documentation gaps

## Output Format

```markdown
## Code Review Summary

### Critical Issues (Must Fix)
- Issue description with file:line reference
- Explanation of why it's critical
- Remediation steps

### Warnings (Should Fix)
- Issue description with file:line reference
- Recommendation for improvement

### Suggestions (Nice to Have)
- Optional improvements
- Performance optimizations

### Approved Items
- What was reviewed and passed
```

## Scope
- Review only code in `app/` directory
- Do not review `./modules/*` implementation
- Focus on new/changed code
