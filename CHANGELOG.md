# Changelog

All notable changes to the Insites AI Tools will be documented in this file.

## [1.0.0] - 2026-03-19

### What is this?

Insites AI Tools is a skill documentation package that teaches LLMs (Claude, GPT, etc.) how to write correct code for the Insites platform. When installed, AI assistants can help developers build pages, query data, create commands, handle authentication, deploy code, and follow Insites coding conventions — without hallucinating unsupported features.

### Key Features

- **Liquid Templating** — Complete reference for Insites-specific tags (`graphql`, `function`, `render`, `background`, `cache`, `session`, `sign_in`, etc.), filters, objects, and coding standards including whitespace stripping guidance
- **GraphQL Data Layer** — Queries, mutations, property accessors, relationships (`related_record` / `related_records`), filtering, sorting, and pagination patterns
- **Command Pattern** — Build → Check → Execute workflow with inline validation, contract-based error accumulation, and 16 documented validation patterns (presence, uniqueness, number, email, length, format, date, and more)
- **Authentication & Authorization** — `authorization_policies/` for page guards, `context.current_user` for user access, role-based permission checking, sign-in/sign-out flows
- **Routing** — File-based routing with dynamic parameters, content-type mapping, HTTP method handling, and slug configuration
- **Schema & Migrations** — YAML schema definitions, property types, relationship conventions, migration lifecycle, and deployment
- **Events & Background Jobs** — Asynchronous event consumers, background job dispatch with `{% background %}` tag, priority and retry configuration
- **Sessions, Caching, Flash Messages** — Native session management via `context.session`, cache tag patterns, flash message flows with redirect
- **Module Development** — `public/` vs `private/` path conventions for building reusable modules
- **Code Refactoring Guide** — When and how to extract reusable partials (validations, execute helpers, UI components, authorization policies) with before/after examples
- **CLI Reference** — All `insites-cli` commands (`audit`, `deploy`, `sync`, `logsv2`, `env add`, `gui serve`, `migrations`, `modules`, `data`) with correct syntax and status notices on under-development commands
- **Decision Trees** — Deterministic routing from any developer request to the correct reference docs
