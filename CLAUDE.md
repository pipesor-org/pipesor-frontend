# CLAUDE.md — Pipesor frontend

@AGENTS.md

[AGENTS.md](AGENTS.md) is the authoritative, tool-neutral guide for this repository. The notes below only add what is specific to Claude Code; if they ever conflict with AGENTS.md, AGENTS.md wins.

## Sources of truth

- Visual language: the [design system](docs/design-system.md) ("Ink on paper") and its tokens. Product UX and screen content: the Paper file **Pipesor**, Page 1, read through the Paper MCP server when it is connected; [Paper product reconciliation](docs/architecture/paper-product-reconciliation.md) records the frame inventory and the agreed deviations. Paper no longer defines colors, typography or component styling.
- API: [MVP HTTP API v1](https://github.com/pipesor-org/pipesor-docs/blob/main/docs/architecture/contracts/mvp-http-api-v1.md) and the [platform identity contract](https://github.com/pipesor-org/pipesor-docs/blob/main/docs/architecture/contracts/platform-identity-v1.md) (login flow §5). Running services publish OpenAPI at `/v3/api-docs`; prefer it over guessing response shapes.
- Never render a value the backend does not provide (confidence, PR links, assignees, display IDs). Omit the element or show an explicit unavailable state.

## Tools

- **Paper MCP**: read-only use (`get_basic_info`, `get_screenshot`, `get_jsx`, `get_computed_styles`). Do not write to the design file.
- **chrome-devtools MCP**: verify screens in a real browser against the local stack (both locales, both themes, 1440 px and 390 px, keyboard navigation).
- **Context7**: when available, check version-sensitive React 19, React Router 7, Zod 4 and Vite 6 APIs before relying on memory.

## Runtime and security

- The local stack (services on 8081–8087, dashboard origin `http://127.0.0.1:5173`) is described in the [runtime manifest](https://github.com/pipesor-org/pipesor-docs/blob/main/docs/development/runtime-manifest.md). Do not start, stop or reconfigure backend services unless asked.
- Never print, log, commit or screenshot session tokens, handoff values, GitHub codes or private log content. Redact them in reports.
- Backend or contract changes are out of scope for this repository: describe the need (endpoint, field, error) and hand it to the backend owner instead of working around it in the client.
