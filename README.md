# Pipesor frontend

Pipesor is an AIOps interface for **monitoring CI/CD workflows, managing incidents, and reviewing operational history and AI-assisted diagnoses**. This repository contains its React frontend.

**Current implementation:** the **Operations** workspace (Active Incidents and Needs Validation), a responsive application sidebar, English/Spanish localization, Pipesor branding, and an accessible Not Found page. Incident information currently comes from **local, Zod-validated demo fixtures**; there is no backend integration.

The approved interface designs are maintained in Paper (file **Pipesor**). Paper access is optional: contributors can work from approved design handoffs and existing components without Paper credentials.

## Requirements and getting started

- [Bun](https://bun.sh/) **1.4.3** (declared in `package.json`).
- A modern browser for local UI verification.

```bash
bun install
bun run dev
```

Open the local URL printed by Vite. To verify changes:

```bash
bun run typecheck
bun run lint
bun run build
```

| Command | Purpose |
| --- | --- |
| `bun install` | Install dependencies from the Bun project |
| `bun run dev` | Start the Vite development server |
| `bun run typecheck` | TypeScript checking |
| `bun run lint` | ESLint |
| `bun run build` | Typecheck and create the production bundle |
| `bun run preview` | Preview the production build |

**Use Bun**, not npm/yarn/pnpm, for dependency operations. Commit `bun.lock`; do not commit build output or credentials. The project does not yet have an established test runner or CI pipeline.

## Technology

React 19 · TypeScript (strict) · Vite 6 · React Router 7 · Zod 4 · i18next/react-i18next · CSS Modules · ESLint 9 · Bun 1.4.3.

Exact resolved dependency versions are defined by `package.json` and `bun.lock`.

## Implemented screens and routing

| Screen | URL | Status |
| --- | --- | --- |
| Operations — Active Incidents | `/operations?queue=active` | Implemented with demo data |
| Operations — Needs Validation | `/operations?queue=validation` | Implemented with demo data |
| Unknown route | Any unmatched path | Not Found page |
| History — Incidents / Insights | Not registered | Planned |
| Pipelines and pipeline details | Not registered | Planned |
| Incident Workspace states | Not registered | Planned |

`/` and the legacy paths `/operations/active-incidents` and `/operations/needs-validation` redirect to the canonical Operations URLs. The routing implementation is in `src/app/App.tsx`, with navigation destinations defined in `src/shared/config/navigation.ts`.

Existing search, scope, filter, sort, row actions, and incident assignment affordances are **presentational unless their behavior has been explicitly implemented and verified**. Do not assume they call an API or persist state.

## Project structure

```text
src/
├── app/                  # Root routing, global CSS and design tokens
├── pages/                # Operations and Not Found screen compositions
├── widgets/              # Sidebar, Operations sections and queue tables
├── entities/
│   └── incident/         # Zod schemas, mock fixtures, selectors and entity UI
├── shared/
│   ├── assets/           # Approved Pipesor SVG assets
│   ├── config/           # Navigation registry
│   ├── i18n/             # EN/ES catalogs and locale-aware formatters
│   ├── lib/              # Shared utilities
│   └── ui/               # Generic UI components and application layout
└── main.tsx
public/                   # Browser-served assets, including favicon.png
```

The project follows **Feature-Sliced Design (FSD)**. Its `features/` layer is intentionally absent until a cohesive user-facing business capability is approved for implementation.

## Design, navigation and localization

- **Design:** CSS Modules and semantic values in `src/app/styles/tokens.css`. The UI supports light and dark themes (preference `system`/`light`/`dark`, persisted in `localStorage` under `pipesor.theme`; theme toggle in the profile menu). New UI should reuse established patterns and approved specifications rather than reinterpret them.
- **Sidebar:** collapsible navigation on desktop, with a narrow-screen overlay. The profile popover contains the language selector.
- **Responsive tables:** queue tables preserve usable column widths and scroll within their containers when horizontal space is limited.
- **Branding:** provided Pipesor SVG assets are stored in `src/shared/assets/branding/`; the favicon and tab title are configured in `index.html`.
- **Localization:** English (`en`) and Spanish (`es`) are bundled with i18next; the selected language is persisted locally. UI labels are translated separately from canonical domain values.
- **Typography:** Sora and JetBrains Mono are loaded through Google Fonts in `index.html`; access to those hosted files may be unavailable offline.

## Domain model and current limitations

`src/entities/incident/model/` contains the current incident contract and demo data. Zod validates incident fixtures; selectors derive queue membership and counts. Incident resolution and diagnosis validation are distinct states.

The frontend does **not** currently implement real persistence, API pagination, authentication, authorization, remote data fetching, or incident lifecycle commands. The following remain proposed business features, subject to approved requirements and contracts:

`onboard-monitored-workflow`, `configure-monitored-pipeline`, `assign-incident`, `manage-incident-lifecycle`, `validate-diagnosis`.

## Working on the project

- [AGENTS.md](AGENTS.md) — shared engineering instructions for developers and coding agents, including boundaries, quality checks and approval rules.
- [Frontend conventions](docs/frontend-conventions.md) — implementation guidance for FSD, tokens, styling, localization, accessibility and domain presentation.
- [Frontend functional architecture map](docs/architecture/frontend-functional-map.md) — implemented functional boundaries, unapproved candidates and unresolved domain decisions.
- [Git workflow](docs/git-workflow.md) — contribution workflow: Git Flow branches, Conventional Commits, Pull Request conventions, merge strategies and release tags.

Implement changes in small, reviewable units. Paper MCP, Context7, Engram and Codex may assist individual developers but are **not required** to install, run, review, or contribute to this frontend. When a design is not directly accessible, request the approved screenshot/specification instead of guessing.
