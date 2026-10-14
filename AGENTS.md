# AGENTS.md — Pipesor frontend

Shared, version-controlled instructions for developers and AI coding agents. Read this file before changing the repository. See [frontend conventions](docs/frontend-conventions.md) for detailed implementation patterns and [README](README.md) for setup and project status.

## Product and scope

Pipesor is an AIOps interface for monitoring CI/CD workflows, triaging incidents, and reviewing diagnoses. The currently implemented frontend is the **Operations** workspace (Active Incidents and Needs Validation) plus a Not Found screen. **No backend is integrated**: displayed incidents are local demonstration fixtures.

- Preserve approved product behavior and visual design. Paper is a design reference **when accessible**, not a prerequisite for working on this repository.
- Without Paper access, work from approved screenshots, specifications, and existing components. Ask when essential behavior or design details are missing; do not invent them.
- Do not mistake a visual mockup, placeholder control, or fixture for an approved backend operation.

## Toolchain

- React 19, React Router 7, TypeScript 5.7 (strict), Vite 6, Zod 4, i18next/react-i18next, CSS Modules, ESLint 9.
- Use **Bun** (`packageManager: bun@1.4.3`) for install, scripts, and lockfile updates. Commit `bun.lock`; do not generate another package-manager lockfile.
- Check `package.json` and the lockfile for exact installed versions; this list describes the current major versions, not permanent pins.
- Reuse existing libraries. Obtain approval before adding a dependency or changing major framework conventions.

## Architecture and boundaries

Follow Feature-Sliced Design (FSD): `app → pages → widgets → features → entities → shared`. A module may depend only on lower layers, except on modules within its own slice. Do not import from another slice's internals; consume its `index.ts` public API. For `shared`, prefer the existing segment public APIs.

- `app`: application setup, route composition, global styles and tokens.
- `pages`: navigable screen compositions.
- `widgets`: coherent UI sections composing entities, controls, and features.
- `features`: cohesive user capabilities with meaningful business behavior; this layer is not implemented yet.
- `entities`: reusable domain contracts, selectors, and domain-specific UI.
- `shared`: generic UI, config, formatting, i18n, assets, and utilities.

Search, sorting, scopes, tabs, navigation, and other presentational interactions **do not automatically require** feature slices. You may create a well-scoped page, widget, or entity slice for approved work. Seek approval before introducing a new architectural layer or implementing an unapproved business capability.

See the [frontend functional architecture map](docs/architecture/frontend-functional-map.md) for verified functional boundaries, candidate mappings and open domain decisions. Its proposals are not implementation authorization.

## Visual design, components, and responsiveness

- Reuse existing components and patterns before adding new ones: `shared/ui`, the Operations widgets, and incident UI in `entities/incident`.
- Use CSS Modules for component styles. Keep global CSS limited to its existing application-level responsibilities.
- Prefer semantic values from `src/app/styles/tokens.css`. Do not introduce arbitrary palette values, duplicate styling, or a parallel theming system. Specific CSS layout measurements are acceptable when needed for an approved responsive design; extend tokens only for justified design-system needs.
- Preserve Pipesor SVG assets and branding; do not redraw or recolor logos. The UI supports light and dark themes via the theme toggle in the profile menu. The preference model is `system`, `light`, or `dark`, persisted in `localStorage` under `pipesor.theme`. Theme resolution (`system` follows the OS color scheme) is applied before initial render and synchronized with OS changes while following `system`. New visual themes and design changes require explicit approval.
- Preserve the collapsible desktop sidebar and narrow-screen overlay. Keep the CSS breakpoint and the corresponding media-query logic consistent.
- Tables should remain legible at 100% browser zoom; retain internal horizontal scrolling when columns cannot fit. Never solve overflow solely by shrinking text.
- Provide visible keyboard focus, correct semantic controls, accessible labels, and expected popover/dialog/overlay dismissal and focus behavior.

## Localization and domain data

- Internationalize user-facing UI copy with the existing `common` and `operations` namespaces. Add keys to **both** English and Spanish; introduce another namespace only when required by an implemented screen.
- Keep domain values, IDs, GitHub names, logs, and evidence separate from translated UI labels. Do not automatically translate user- or system-generated technical content.
- Use the existing `shared/i18n` formatting utilities for locale-sensitive presentation. Never sort, filter, or calculate with formatted display strings.
- Zod contracts in `entities/incident/model/schema.ts` and inferred TypeScript types govern incident fixture shape. Validate new data at its boundary, not in every presentational component.
- Derive incident queue membership, counts, and metrics through domain selectors; do not duplicate them as UI literals.

Preserve these domain distinctions: incident lifecycle vs. diagnosis validation; pipeline criticality vs. incident severity; workflow ownership vs. incident assignee. GitHub access is read-only, and starting remediation records human work; it does not execute an automated fix.

## Task workflow and verification

1. Confirm task scope and the approved design or acceptance criteria. Identify relevant existing components and contracts before editing.
2. Make the smallest coherent change, respecting FSD and reuse. Avoid unrelated refactors, speculative abstractions, and needless dependencies.
3. Run `bun run typecheck` and `bun run lint` for code changes. Run `bun run build` for new screens, dependency/configuration changes, or changes affecting production output.
4. For UI changes, verify navigation, both locales, keyboard accessibility, responsive behavior, and visual fidelity where relevant. For domain/schema changes, verify valid and invalid data cases.
5. Report changed files, checks passed/failed, any browser or design comparisons **not performed**, and open decisions. Do not claim verification you did not perform.

The repository currently has no established test runner or CI. Do not claim automated test coverage; propose it separately when justified.

## Git workflow

Follow Git Flow and Conventional Commits (Angular convention) for every change. [Git workflow](docs/git-workflow.md) is the single source of truth for branches, commit format, Pull Requests, merge strategies and release tags.

- Branch from and merge into the correct integration branch: `feature/*` ⇄ `develop`; `release/*` and `hotfix/*` into **both** `main` and `develop`.
- Use `<type>(<optional scope>): <description>` for commit and Pull Request titles, with the approved types (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`).
- Never commit directly to `main` or `develop`; every change goes through a Pull Request.

## Scope, permissions, and escalation

Routine approved UI work (CSS, translations, components, mock-based screens) can proceed autonomously. **Ask before** adding dependencies, changing navigation contracts or approved designs, defining API/backend behavior, introducing authorization rules, or implementing ambiguous domain transitions.

The following are **future feature candidates**, not preapproved implementations: `onboard-monitored-workflow`, `configure-monitored-pipeline`, `assign-incident`, `manage-incident-lifecycle`, and `validate-diagnosis`. In particular, the Needs Validation queue is a read view, not the `validate-diagnosis` operation.

## Optional development tools

- Native OpenCode `explore`: scoped, read-only codebase investigation. `general`: independent scoped tasks; explicitly state whether edits are allowed. Delegate only when it reduces context or effort.
- Context7: check library documentation for nontrivial or version-sensitive API decisions, when available.
- Engram: optional memory aid; durable team decisions belong in repository files, not exclusively in personal memory.
- Paper MCP: optional, account-specific access to design references. Never require its credentials for ordinary development.
- Codex: optional assistance for complex architecture, cross-cutting changes, or decisions requiring deeper analysis; it is not mandatory for routine work.

Do not install agent plugins or introduce a multiagent framework without a concrete need and approval. Never commit credentials, local MCP configuration, API keys, or machine-specific agent state.
