# Pipesor frontend

Pipesor is an AIOps interface for **monitoring CI/CD workflows, managing incidents, and reviewing operational history and AI-assisted diagnoses**. This repository contains its React frontend.

**Current implementation:** the **Operations** workspace (Active Incidents and Needs Validation), the **History** read views (**Incidents** and **Insights**), Pipelines inventory/read-only Detail/draft onboarding, a responsive application sidebar, English/Spanish localization, Pipesor branding, and an accessible Not Found page. Incident information currently comes from **local, Zod-validated demo fixtures**; there is no backend integration.

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
| History — Incidents | `/history?view=incidents` (bare `/history` also renders Incidents) | Implemented with demo data |
| History — Insights | `/history?view=insights` | Implemented with demo data and provisional metrics |
| Unknown route | Any unmatched path | Not Found page |
| Pipelines inventory, Detail and onboarding draft | `/pipelines`, `/pipelines/:pipelineId`, `/pipelines/new` | Implemented read-only views and local draft; configuration saves and workflow registration are deferred until local API integration |
| Incident Workspace | `/incidents/:incidentId` — target only, not registered | Agreed initially read-only destination; not implemented |

`/` and the legacy paths `/operations/active-incidents` and `/operations/needs-validation` redirect to the canonical Operations URLs. History uses `?view=incidents|insights`; bare `/history` renders Incidents and any other `view` value canonicalizes to `?view=incidents`. The routing implementation is in `src/app/App.tsx`, with the history view contract in `src/shared/config/navigation.ts`.

Incident search, scopes, filters, row actions, assignment and Insights period/filter affordances are **nonfunctional presentation**. Active/Needs Validation ordering captions do not sort; History's newest-resolution-first ordering is implemented but not interactive. Pipelines local inventory queries are separate behavior, not an incident-query contract. Do not assume any of these views call an API or persist business operations.

## Project structure

```text
src/
├── app/                  # Root routing, global CSS and design tokens
├── pages/                # Operations, History, Pipelines/Detail/onboarding and Not Found
├── widgets/              # Sidebar, Operations sections, filters, History table and Insights
├── entities/
│   ├── incident/         # Zod schemas, mock fixtures, selectors and entity UI
│   └── monitored-pipeline/ # Local monitored-workflow demonstration data
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

`src/entities/incident/model/` contains the current incident contract and demo data. Zod validates incident fixtures; selectors derive queue membership, History membership, counts and the fixed-window Insights aggregations. Incident resolution and diagnosis validation are distinct states.

**Implemented now:** six unresolved incidents appear in Active, seven resolved/pending incidents in Needs Validation, and eight resolved/terminal-validation incidents in History. Insights uses the terminal population within its fixed period. These are fixture counts, not production results.

**Agreed target, not implemented:** History includes all operationally resolved incidents, so pending incidents can also remain in Needs Validation. Workspace uses one initially read-only incident route with origin-aware safe return. Search/filter coherence and recurring-context drill-down are agreed directions; exact query, direct-entry fallback and read-model contracts remain open. See [Incident Management functional flows](docs/architecture/frontend-functional-map.md#4-functional-flows) for D01–D07; these decisions do not authorize domain commands or new architecture.

The frontend does **not** currently implement real persistence, API pagination, authentication, authorization, remote data fetching, or incident lifecycle commands. The following remain proposed business features, subject to approved requirements and contracts:

`onboard-monitored-workflow`, `configure-monitored-pipeline`, `assign-incident`, `manage-incident-lifecycle`, `validate-diagnosis`.

History — Insights derives its metrics from the same demo incidents through entity selectors. Its fixed window and definitions are **provisional**: the diagnosis-confirmation rate is not an accuracy metric, missing periods are never interpolated, and the presentational filters do not recompute results. Recurring-group rows and chevrons do not filter or open Incidents.

## Working on the project

- [AGENTS.md](AGENTS.md) — shared engineering instructions for developers and coding agents, including boundaries, quality checks and approval rules.
- [Frontend conventions](docs/frontend-conventions.md) — implementation guidance for FSD, tokens, styling, localization, accessibility and domain presentation.
- [Frontend functional architecture map](docs/architecture/frontend-functional-map.md) — implemented boundaries, agreed target decisions, unapproved candidates and unresolved contracts.
- [Git workflow](docs/git-workflow.md) — contribution workflow: trunk-based branches, Conventional Commits, Pull Requests and target releases.

Implement changes in small, reviewable units. Paper MCP, Context7, Engram and Codex may assist individual developers but are **not required** to install, run, review, or contribute to this frontend. When a design is not directly accessible, request the approved screenshot/specification instead of guessing.
