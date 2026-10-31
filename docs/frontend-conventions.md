# Pipesor frontend conventions

Practical patterns for implementing and reviewing the Pipesor UI. [AGENTS.md](../AGENTS.md) defines shared mandatory working rules; the [README](../README.md) covers setup and implemented scope. **Source files are authoritative** for actual tokens, component APIs, and runtime behavior. This guide explains how to use them without duplicating their contents.

## 1. Feature-Sliced Design

Follow the dependency direction `app → pages → widgets → features → entities → shared`. Layers may consume lower layers; avoid cross-slice imports within the same layer. Each slice exposes a public API through `index.ts`. Shared utilities and configuration use segment-level APIs where available.

| Layer | Owns | Examples in this repository |
| --- | --- | --- |
| `app` | Bootstrap, route definitions, global theme assets | `src/app/App.tsx`, `src/app/styles/` |
| `pages` | Navigable views and screen composition | Operations, History, Not Found |
| `widgets` | Meaningful UI compositions and local query/presentation state | Operations tabs, summaries, tables, filters, History table, sidebar |
| `features` | Cohesive business actions with their UI and interaction model | Deferred; no feature slices implemented yet |
| `entities` | Reusable domain data, schema, selectors and representations | `src/entities/incident/` |
| `shared` | Domain-agnostic building blocks and cross-cutting services | `ui`, `i18n`, `config`, `lib`, `assets` |

**Decision rule:** a button, tab, search field, or dropdown is not automatically a feature. Place presentation and query interactions with the screen/widget that owns them. Introduce a feature when an approved, meaningful user capability has its own behavior or business consequence. A widget does not have to be reused by multiple pages to be valid.

Create only slices needed for the current task. Do not create placeholder directories for future features or a general-purpose component library in anticipation of reuse.

The [frontend functional architecture map](architecture/frontend-functional-map.md) separates implemented boundaries, agreed target decisions, candidate decomposition and open contracts; this guide remains authoritative for implementation conventions. Agreed read/navigation direction does not approve a new slice or a domain-changing command.

## 2. Visual source of truth and design handoff

The approved **Pipesor** designs in Paper are the visual reference **when accessible**. The codebase remains usable without a paid Paper account. For handoffs to another developer, provide only the information relevant to the task:

- Approved screenshot or frame reference, including state/variant and target viewport.
- Expected layout and visual changes; which existing component should be reused, if known.
- Interactions with approved behavior versus visual-only affordances.
- Acceptance criteria, especially responsive behavior and localization.
- Any missing specifications or unresolved domain decisions.

A Paper frame describes a visual state; it does **not**, by itself, approve backend endpoints, permissions, incident transitions, or persistence. Use direct Paper MCP inspection if available and relevant, but never make it a prerequisite for routine work.

## 3. Tokens, theming and assets

- Inspect `src/app/styles/tokens.css` before defining styles. Reuse existing semantic CSS custom properties for colors, typography, borders, radii and general layout values.
- The UI supports **light and dark** themes. Theme preference follows `system`, `light`, or `dark` and is persisted in `localStorage` under `pipesor.theme` (applied before initial render; `system` tracks `prefers-color-scheme` while active). The theme toggle lives in the profile menu. Semantic tokens live in `src/app/styles/tokens.css` and should be maintained per theme (`[data-theme='dark']`); see also `src/shared/lib/theme.ts` and `src/shared/lib/ThemeProvider.tsx` for the initialization/transition logic.
- Do not paste new arbitrary hex colors or recreate brand assets. New visual themes and design-system extensions require explicit approval and a clear visual use case; a component-specific technical dimension is not automatically a new token.
- Use supplied SVGs from `src/shared/assets/branding/` directly. Keep product name **Pipesor** unchanged across locales. Browser favicon comes from `public/favicon.png` through `index.html`.
- Sora and JetBrains Mono are the existing font families. Respect established weights, spacing rhythm, density and hierarchy; avoid per-screen typography systems.

**Where styling belongs:** global reset/body setup stays in `src/app/styles/global.css`; UI styles belong in component-co-located `*.module.css`. Import CSS Modules as `styles`, follow existing camelCase class naming, and use meaningful state/variant names such as `sidebarCollapsed` or `navItemActive`. Avoid broad `:global`, `!important`, and selectors that depend on unrelated widgets' markup. Compose conditional classes using the existing project pattern instead of introducing a styling dependency.

The existing typography uses **Sora** for UI and **JetBrains Mono** for technical identifiers and durations; fonts are loaded through `index.html` (Google Fonts). Reuse current weight, line-height, density, and spacing patterns before introducing new ones. Component-specific pixel dimensions may be needed to faithfully implement an approved design; do not promote every dimension to a global token.

## 4. Component reuse and presentation

Before creating a component, inspect existing `src/shared/ui/` primitives and any relevant entity UI exports. In particular, check `shared/ui/badge`, `shared/ui/icons`, and `shared/ui/app-layout`; incident-specific representations such as `IncidentSeverity` and `IncidentValidationStatus` belong in `entities/incident/ui`. Consume their public APIs rather than duplicating their markup or importing internal files. Extend the existing icon collection/public API when appropriate instead of redrawing an equivalent icon.

Prefer one coherent implementation over visually similar, duplicated badges, icons or controls. Use shared primitives for genuinely generic UI; use entity UI when a component represents domain concepts (for example severity and diagnosis-validation labels). Promote a new shared primitive when its responsibility is demonstrably generic, not merely because it may be reused someday.

Do not generalize every table into a universal domain table. Share low-level styling and affordances where justified while allowing each queue to own its columns, formatting and empty state. Keep source data and selectors out of reusable visual primitives.

The existing Operations, History, Insights recurring-context and Pipelines tables use native `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>` and `<td>` markup with scoped headers. Flex layout is used for surrounding containers and content inside cells, not as a replacement for table rows. Preserve native table semantics, established column sizing and internal horizontal scrolling when modifying these tables; do not generalize their internal flex helpers into a table-row requirement.

For new screen states, consider a single data-driven composition instead of cloning entire pages when structure is shared. Do not couple UI components to future REST response DTOs that have not been approved.

## 5. Responsive layout

The application layout is fluid around the sidebar; `src/shared/ui/app-layout/` and `src/widgets/app-sidebar/` own current layout and interaction details.

- Desktop navigation can collapse into an icon rail. The expanded/collapsed preference is managed by the sidebar layout logic (currently persisted as `pipesor.sidebar`); keep that persistence centralized rather than adding independent local state elsewhere.
- The narrow-screen sidebar uses an overlay, backdrop and focus/keyboard handling. Focus should move into the open overlay and return to its trigger on close.
- The existing narrow-screen breakpoint is **900px**; ensure `AppSidebar` CSS and the associated `useMediaQuery` behavior remain aligned rather than silently diverging.
- Tables maintain useful minimum column widths and scroll **inside the table/card region** rather than forcing page-wide horizontal overflow. Actual widths are defined in each table's CSS, not in this document.
- At constrained widths, prioritize readability of primary incident information and Diagnosis. Let multiline content expand row height as needed; avoid clipping and avoid reducing font size solely to fit.
- Validate at **100% browser zoom**, including laptop-sized viewports. A 14-inch diagonal is not itself a CSS viewport specification; use actual viewport width for reproduction.

When adding a new component, check overflow, keyboard focus, long Spanish labels, empty states, and narrow widths—not only the Paper desktop frame.

## 6. Accessibility and navigation

Use semantic links for navigation and buttons for actions. Keep visible `:focus-visible` feedback consistent with existing styles and the `.srOnly` approach for accessible supporting text.

- React Router routes and redirects are managed in `src/app/App.tsx`; destinations and URLs are centralized under `src/shared/config/`.
- Operations uses `/operations?queue=active` and `/operations?queue=validation`. Preserve the URL's selected queue so browser back/forward and reload behave coherently.
- History uses `/history?view=incidents` and `/history?view=insights`; bare `/history` renders Incidents and invalid values canonicalize to it. Keep unimplemented destinations non-links rather than adding speculative parameters.
- `/incidents/:incidentId` is an agreed, initially read-only Workspace target, **not a registered route**. Its origin-aware safe-return direction and proposed direct-entry fallback are documented in the [functional map](architecture/frontend-functional-map.md#43-incident-workspace--diagnosis-ready); do not invent query parameters, fallback acceptance or history/focus mechanics. Operations/History need not adopt Pipelines' implementation structure.
- Do not create working navigation links to unimplemented screens. Unknown URLs should retain an accessible Not Found experience.
- Sidebar toggles should expose their expanded/collapsed state appropriately. In collapsed mode, the branding/expand control must remain keyboard discoverable, not hover-only.
- The profile popover (currently `widgets/app-sidebar/ui/UserMenu.tsx`) contains the language selector and provides a useful interaction reference: keep it within the viewport, avoid clipping in either sidebar mode, and preserve Escape/outside-click dismissal and sensible focus return.
- An inactive destination must not masquerade as a functional link. Use accessible language to explain its unavailable state.

ARIA choices should describe the component's actual semantics: use `aria-expanded` for disclosure controls, `aria-current` for current navigation, and `aria-pressed` only for true toggle buttons.

## 7. Localization

The current i18n setup is in `src/shared/i18n/`; English and Spanish catalogs live under `src/shared/i18n/locales/`. Existing namespaces are `common`, `operations`, `history` and `pipelines`, registered in `config.ts` and bundled for both locales in `resources.ts`. The module initializes bundled resources synchronously (no translation HTTP backend), and the repository's i18next declaration derives typed translation keys from the English resources.

- Use `useTranslation("<namespace>")` and semantic translation keys for UI strings, including labels, placeholders, tooltips, accessibility text and empty states. Use the public i18n helpers rather than introducing another translation singleton.
- Add or update keys in **both** `en` and `es`; English resources define the typed key surface. Keep catalog structure and keys aligned. Check `resources.ts`, `i18next.d.ts`, and `config.ts` before altering initialization, namespaces or locale resolution.
- Reserve `common` for genuinely shared/application-level strings; keep screen-specific wording in `operations`, `history` or `pipelines` as appropriate. Add another namespace only when implementing its screen.
- Use existing `useFormatters`/`Intl` utilities for locale-aware numbers, dates and durations; compare and sort structured source values, never translated/formatted strings. Preserve the existing saved-language/browser-language/fallback resolution and keep the document language in sync on changes.
- Keep the brand name **Pipesor**, technical identifiers, GitHub workflow/repository names, logs, evidence and arbitrary free text in their source language unless a separate localization capability has been explicitly approved.
- Keep canonical domain enums independent of translation keys. Existing label mappings in `src/entities/incident/ui/labels.ts` bridge domain values to display text.

Test both languages after UI changes. Spanish copy can increase control width; do not fix overflow by truncating crucial content without an explicit design decision.

## 8. Incident domain and demo data

`src/entities/incident/model/types.ts` defines canonical vocabulary (literal arrays/objects); `schema.ts` builds **Zod 4 discriminated unions** from that vocabulary, with TypeScript types inferred from the schemas. Its strict lifecycle branches prevent unresolved records from carrying resolution-only fields, and require resolution data for resolved incidents. `incidents.ts` owns demo fixtures and validates them on load. `selectors.ts` owns queue membership and derived summary values. Domain-label mappings in `src/entities/incident/ui/labels.ts` are intended to be exhaustive over the corresponding union values.

- The current demo dataset contains six unresolved, seven resolved/pending-validation and eight resolved/terminal-validation incidents. History currently selects only the eight terminal records; its agreed all-resolved target would include 15 before date/filter criteria, but is not implemented. **These are fixture counts, not constants to duplicate**; selectors and fixture data remain authoritative for current behavior.
- Lifecycle status, diagnosis-validation outcome, incident severity, pipeline criticality and ownership/assignment are distinct concepts. Do not merge them for UI convenience.
- Keep timestamps and elapsed durations structured; format at the presentation boundary. Respect the fixed demo snapshot (`INCIDENT_SNAPSHOT_AT`) rather than pretending that fixture metrics are live. Never synthesize a timestamp when the design only supplies a duration.
- Prefer domain selectors for derived view data. Do not embed hardcoded metrics in widgets or infer business conditions from translated labels.
- Zod validates data structure and selected invariants; it does not automatically define backend authorization, cross-record consistency or transition permissions.
- Preserve observed evidence, AIOps inference, operational lifecycle and human review as separate dimensions. Do not fabricate missing Workspace references, timestamps, actors or actual causes. A successful run does not automatically resolve an incident or confirm its diagnosis; rejection must not overwrite the original hypothesis/evidence/confidence.

The app currently has no backend integration. Do not implement API clients, domain mutations or permission checks by guessing the future microservice, REST or CQRS contracts.

## 9. Review and acceptance

Use the checks applicable to the change:

| Change | Minimum relevant review |
| --- | --- |
| Any application code | `bun run typecheck`, `bun run lint` |
| New screen, routing, dependencies or build config | Also `bun run build` |
| Styling/responsive | Compare with approved design if available; verify real viewport behavior, no clipping/page overflow |
| Navigation, sidebar or popover | Back/forward, keyboard focus, Escape and link semantics |
| New UI text | Both EN/ES, long labels, appropriate `Intl` formatting |
| Branding or shared UI | Verify existing asset imports, public APIs, and all consuming views |
| Domain/Zod/fixtures | Valid and invalid schema cases, selector invariants, queue totals |
| Documentation | Referenced paths, scripts, links and statements match actual code |

Browser and Paper comparisons are **not** established by TypeScript, ESLint or build success. State explicitly what was checked and what could not be checked. Keep each task independently reviewable and stop at the requested boundary.

## 10. Deferred decisions

The following are potential business features, not tasks to implement just because their names are documented: `onboard-monitored-workflow`, `configure-monitored-pipeline`, `assign-incident`, `manage-incident-lifecycle`, `validate-diagnosis`.

Before implementing domain-changing behavior, obtain approved requirements for API contracts, authorization, workflow identity/scope, incident lifecycle transitions, and diagnosis-validation rules as appropriate. Operations — Needs Validation is a **read projection**; it does not implement the validation command itself.

Routine visual tasks may use approved, local mock interactions without pretending to persist them. Capture durable team decisions in the repository rather than exclusively in Engram or any developer's personal agent setup.
