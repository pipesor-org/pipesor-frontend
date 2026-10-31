# Pipesor — Pipelines End-to-End Exploration

**Mode:** Strictly read-only. No source, documentation, fixtures, dependencies, Paper artboards, branches, commits, or Pull Requests were changed.

**Evidence used:** the three Paper artboards, full/2× screenshots, component hierarchies, computed styles and measurements; `AGENTS.md`, `README.md`, `docs/frontend-conventions.md`, `docs/architecture/frontend-functional-map.md`; and the relevant routing, navigation, layout, table, filter, schema, token, icon, and i18n source files.

**Not verified:** runtime browser behavior, responsive layouts, EN/ES rendering, dark theme, typecheck, lint, production build, automated tests, backend integration, or persistence. The repository currently has no test runner or CI, and no backend is integrated.

---

## A. Paper design inventory

### A.1 Shared shell and layout

All three artboards are desktop-only, **1440px wide**, and carry a **“Prototype · Demo data”** marker.

| Artboard | Size | Main structure |
|---|---:|---|
| Pipelines — Monitored Workflows | 1440 × 900 | Sidebar + inventory header, filters, table, footer hint |
| Pipeline detail — deploy-production | 1440 × 1445.328 | Sidebar + contextual navigation, identity header, 1040px configuration surface |
| Pipelines — Add monitored workflow | 1440 × 1659.328 | Sidebar + contextual navigation, identity header, long 1040px form |

Measured shell:

- Sidebar: **200px**
- Workspace: **1240px**
- Content width: **1176px**, with **32px** outer padding
- Detail/Add surface: **1040px**, starting at the content’s left edge (`x = 32` within the workspace)
- The detail/Add surface therefore leaves **136px empty on the right** at 1440px. It is **left-aligned, not centered**.
- Inventory uses the full **1176px** width; detail/Add use **1040px** and **24px** internal section padding, giving a **992px** inner row width.

Typography and visual treatment:

- Sora for UI copy; JetBrains Mono for technical identifiers such as repository names, workflow filenames, and slugs.
- Page title: **24px / 32px**, semibold.
- Section title: **18px / 26px**, semibold.
- Body: **14px / 22px**.
- Helper text: **12px / 18px**.
- Table headers: **12px / 18px**, medium, secondary color.
- Primary table identifier: **13px / 20px**, JetBrains Mono.
- Flat white surfaces, 1px `#E4E7EC` separators, 5px control radius. Existing semantic tokens match the Paper palette closely.
- No mobile, tablet, empty, loading, error, or dark-theme artboards are provided.

### A.2 Pipelines — Monitored Workflows

Vertical composition:

- Header area: y = 32–144, **112px**
- Filter bar: y = 144–196, **52px**
- Section heading: y = 196–246, **50px**
- Table: y = 246–834, **588px**
- Footer hint row: approximately **28px**

Header:

- Title: **Pipelines**
- Subtitle: **“Monitored GitHub Actions workflows and operational policies.”**
- “Prototype · Demo data” label at right.
- Primary **Add monitored workflow** button with plus glyph, 36px high.

Filters:

- Search field with placeholder **“Search pipelines”**
- Closed dropdown-style controls: **Criticality**, **Responsible team**, **Monitoring**
- No sort control, active-filter chips, filter-open state, or empty-result state is shown.

Table:

- Table header: **44px**
- Seven rows: **76px** each
- 12px padding above the header
- Content column widths: **280 / 240 / 130 / 110 / 250 / 134**, totaling 1144px inside the 1176px table, with 16px row edges
- Row hover treatment exists; there are no row menus or chevrons

Demo data:

| Pipeline slug | GitHub workflow | Repository | Environment | Criticality | Responsible team | Monitoring |
|---|---|---|---|---|---|---|
| `deploy-production` | Deploy production | `acme/payments-api` | Production | Critical | Platform Engineering | Active |
| `build-and-test` | Build and test | `acme/web-storefront` | Development | Medium | Web Platform | Active |
| `quality-check` | Code quality checks | `acme/identity-api` | QA | High | QA / DevOps | Active |
| `provision-infrastructure` | Provision infrastructure | `acme/platform-infra` | Production | Critical | Platform Engineering | Paused |
| `build-container` | Build container image | `acme/worker-service` | Production | High | Platform Engineering | Active |
| `integration-tests` | Integration tests | `acme/checkout-api` | QA | High | QA / DevOps | Active |
| `build-documentation` | Build documentation | `acme/docs-site` | Development | Low | Web Platform | Paused |

The primary column shows the **pipeline slug** in mono; the second line shows the **GitHub workflow display name** in sans-serif. Criticality and monitoring use a status dot plus text, not an incident-severity badge.

Every row’s Paper layer name explicitly says:

> “whole row opens Pipeline Detail, no drawer”

There is no visible row-level link or action. The footer hint says: **“Select a workflow to configure its operational context.”**

The Add button’s layer name is less conclusive:

> “Add monitored workflow — future Repository to Workflow to Operational context to Start monitoring, no wizard designed”

That annotation conflicts with the existence of the fully designed Add form artboard.

### A.3 Pipeline detail — deploy-production

Header:

- **“← Back to Pipelines”** text link.
- Page title: **`deploy-production`**
- Meta line: `acme/payments-api` · **GitHub Actions** · green **Connected** indicator.
- “Prototype · Demo data” marker at right.
- Contextual navigation: 32px high; identity header: approximately 111px; configuration surface starts at y = 174.667.

Configuration surface: **1040 × 1238.656**, with five sections:

| Section | Height | Content |
|---|---:|---|
| Identity | 336.656 | Repository, workflow file, environment, default branch, integration |
| Operational policy | 212.656 | Criticality and monitoring |
| Ownership | 208.656 | Responsible team, pipeline owners, ownership note, **Edit ownership** |
| Access | 314.656 | Four role/capability rows |
| Last configuration update | 142.0 | Timestamp, change summary, actor, history link |

Identity values:

- Repository: `acme/payments-api`
- Workflow: `deploy-production.yml`
- Environment: `Production`
- Default branch: `main`
- Integration: `GitHub Actions · Connected`
- **Open repository ↗** and **Open workflow ↗** links
- Section description: **“Read-only GitHub context. Workflow code remains in GitHub.”**

Operational policy:

- Criticality: **Critical**, rendered as a 240 × 36px select-like control.
- Monitoring: **Active**, rendered as a segmented control with 112 × 30px Active/Paused options.
- Help: **“Used as operational context when incidents associated with this workflow are prioritized.”**
- No Save, Cancel, dirty indicator, success message, or error state is shown.

Ownership:

- Responsible team: **Platform Engineering**
- Pipeline owners: **Alex Chen · Maya Patel**
- **Edit ownership** link at the right of the section header.
- Footnote: **“Operational ownership does not grant GitHub permissions.”**
- No ownership editor, save control, or validation state is shown.

Access — static, informational table:

| Role | Capability | Description |
|---|---|---|
| Platform Engineering | Operate | Take incidents, start remediation, resolve and validate diagnoses. |
| QA Team | View | Consult authorized pipelines, incidents, diagnoses and evidence. |
| Technical Lead | View | Consult authorized pipelines, incidents, diagnoses and evidence. |
| Pipeline Administrators | Configure | Change criticality, ownership and operational configuration. |

There is no access editor, actor assignment, or enforcement model. The section is evidence of a capability concept, not an authorization contract.

Last configuration update:

- **Sep 30 · 10:42**
- Change: **Criticality changed**
- **High → Critical**
- Changed by **Alex Chen**
- **View configuration history** link

No configuration-history screen, drawer, or event list is designed. No pipeline-run status, run history, diagnostics, or incident activity is shown.

### A.4 Pipelines — Add monitored workflow

Header:

- **“← Back to Pipelines”**
- Title: **Add monitored workflow**
- Subtitle: **“Select an existing GitHub Actions workflow and configure how AIOps will monitor it.”**
- “Prototype · Demo data” marker.

Surface:

- **1040px** wide, **1452.656px** tall
- Form: **1428.656px**, starting after 24px top padding
- Four sections:

| Section | Height | Content |
|---|---:|---|
| GitHub workflow | 422.656 | Read-only integration context and five fields |
| Operational policy | 390.656 | Criticality, operational environment, monitoring |
| Ownership | 304.656 | Responsible team, pipeline owners |
| Review and add | 310.656 | Summary, registration note, Cancel, Add |

GitHub workflow section:

- Status: **GitHub Actions · Connected**
- Description: **“Select an existing workflow available through the connected GitHub integration.”**
- Note: **“Read-only integration. Workflow files and GitHub permissions remain unchanged.”**
- Repository: `acme/reporting-service`
- Workflow: `Integration checks`
- Workflow file: `.github/workflows/integration-checks.yml`
- Default branch: `main`
- Provider: `GitHub Actions`
- Required note: **“* Required fields”**

Operational policy:

- Criticality: **Medium**, 240 × 36px.
- Operational environment: **QA**, 240 × 36px.
- Monitoring: **Active**, two 112 × 30px segments.
- Help: **“AIOps context only. Does not modify a GitHub Environment.”**
- Help: **“Pipeline context, not incident severity.”**
- Help: **“Active enables AIOps monitoring for this workflow. Paused keeps the workflow registered without active monitoring.”**

Ownership:

- Responsible team: **Web Platform**
- Pipeline owners: **Maya Patel**, **Alex Chen**
- Chips are 440 × 38px with small “×” remove glyphs.
- Footnote: **“Ownership does not assign incidents or grant GitHub permissions.”**
- Footnote: **“Access capabilities can be reviewed in Pipeline configuration after the workflow is added.”**

Review:

- Repository: `acme/reporting-service`
- Workflow: `Integration checks`
- Criticality: Medium
- Operational environment: QA
- Monitoring: Active
- Responsible team: Web Platform
- Pipeline owners: Maya Patel · Alex Chen
- Registration note: **“Registers monitoring in AIOps. No changes are made to GitHub.”**
- **Cancel** and **Add monitored workflow** actions.

Required markers are present on Repository, Workflow, Criticality, Monitoring, and Responsible team. Workflow file, default branch, and provider are read-only. **Operational environment and Pipeline owners have no required marker.**

The form is annotated as a **“Continuous onboarding form — pre-confirmation demo”** and is prefilled with values. There is no blank initial state, no pristine-state screenshot, and no success state.

Hidden conceptual states exist at the same position with `opacity: 0`. They are not visible or approved flows, but they reveal intended validation semantics:

- No repository selected: Workflow disabled; changing Repository resets Workflow, file, and branch; help says “Select a repository first.”
- Duplicate: “This workflow is already monitored.” and “View existing configuration ↗”; the annotation says to prevent Add and open the existing configuration.
- Loading: “Loading available workflows…”
- Error: “Unable to load available workflows. Try again.” with a **Retry** action.
- Required fields: “Complete all required fields before adding the workflow.”
- Unavailable workflow: “The selected workflow is no longer available through this integration.”

The visible **Add** button’s layer annotation describes a more complete intended behavior:

> “validate required fields, authorized workflow and uniqueness; register reference, policy, owners, actor and timestamp; then Pipeline Detail”

There is no designed submitting, success, failure, or post-submit confirmation state. The inventory Add annotation’s “no wizard designed” also leaves the entry flow unresolved: the artboard is a continuous form, while the annotation describes a future staged flow.

### A.5 Visual consistency and quality of the design system

- All three screens use the same shell, page-title scale, section-title rhythm, helper-text treatment, and flat white surfaces.
- Inventory uses 1176px; detail/Add use 1040px. The 136px right gap is visually noticeable at 1440px. This may be intentional, but it is not explained and should be confirmed as a design decision.
- Criticality text colors match existing semantic tokens: Critical `#D92D20`, Active `#16875B`, secondary `#667085`. Any tinted chip backgrounds may require tokenized light/dark variants; raw Paper hex values should not be hard-coded.
- Existing shared components do not cover all visual needs: `Badge` only supports accent/neutral, and the icon set lacks a plus, external-link, and close/remove glyph.
- Only light desktop frames exist. Dark-theme and narrow-screen fidelity are not designed.

---

## B. Cross-screen flow mapping

### B.1 Intended flow

```text
Pipelines inventory
  │
  ├── whole row ─────────────► Pipeline detail
  │                              ├── Back to Pipelines
  │                              ├── edit Operational policy ──► independent save
  │                              ├── Edit ownership ───────────► independent save
  │                              └── View configuration history ─► no designed target
  │
  └── Add monitored workflow ─► Add monitored workflow
                                 ├── Cancel ────────────────► Pipelines, without saving
                                 ├── duplicate state ───────► existing configuration
                                 └── Add ───────────────────► validate/register ─► Pipeline detail
                                                               (no success/error state designed)
```

The arrows describe the intended product flow evidenced by labels and layer annotations. They are not approved backend transitions.

### B.2 Transition requirements and gaps

| Transition | Trigger / evidence | Required state | Current gap |
|---|---|---|---|
| Inventory → Detail | Whole-row annotation: “opens Pipeline Detail, no drawer” | Stable pipeline identity, detail fixture/source, route, back behavior | No detail route; rows are not interactive; no stable pipeline ID |
| Detail → Inventory | “← Back to Pipelines” | Return to list, ideally preserving filters/scroll | No route contract; no decision whether “back” restores prior list state |
| Inventory → Add | Add button visual | Add route and initial form state | No Add route; Add button annotation says “future … no wizard designed”; artboard is a continuous form |
| Add → Inventory | “Cancel — return to Pipelines without saving” | Discard form state; optional dirty confirmation | No dirty tracking, confirmation, or reset behavior designed |
| Add → new Detail | Add annotation: validate, register reference/policy/owners/actor/timestamp, then Pipeline Detail | Created pipeline identity, slug, policies, owners, initial audit event, access data, success/error handling | No success/failure/submitting state; no slug; no initial audit event; no access defaults |
| Detail policy edit → save | Controls look editable; independent save is a stated target behavior | Edit mode or inline save, dirty/saving/success/error, inventory propagation, audit event | No Save control, no dirty state, no success/error, no concurrency model |
| Detail ownership edit → save | “Edit ownership” link | Editor surface, validation, independent save, inventory propagation, audit event | Only the link is designed; no editor or save state |
| Detail → configuration history | “View configuration history” link | History screen/drawer, event model, filtering/pagination | No target screen or event contract |
| Detail → GitHub | “Open repository ↗” / “Open workflow ↗” | URLs and new-tab/accessibility behavior | No URLs or integration URL contract shown |

### B.3 Data and state needed for consistency

1. **Stable pipeline identity.** The inventory title (`deploy-production`), GitHub workflow display name (`Deploy production`), workflow file (`deploy-production.yml`), and repository (`acme/payments-api`) must resolve to one record. A slug alone is insufficient if it can change or collide across repositories.
2. **Uniqueness.** The hidden duplicate state implies a workflow cannot be registered twice. The likely uniqueness key is repository + workflow file, but this is not formally specified.
3. **Single source for list and detail.** Inventory rows must be projections of the same pipeline records used by the detail. The Add review must be derived from live form state, not duplicated literals.
4. **Independent saves.** A policy save must not overwrite ownership, and an ownership save must not overwrite policy. The inventory must reflect saved values when the user returns. No shared mutation, versioning, or optimistic-update contract exists.
5. **Add success data.** The Add review does not show a pipeline slug or pipeline ID. A newly registered detail would need:
   - a stable identity/slug,
   - the read-only GitHub fields,
   - policy and ownership values,
   - an initial “created” configuration event,
   - access capability data,
   - and a route to the new detail.
   Only part of that data is present in the form.
6. **Navigation state.** If inventory search/filter state is implemented, Back and Cancel should not silently reset it. Whether that state lives in the URL or in memory is undecided.
7. **Direct URLs and refresh.** `/pipelines/:id` and the Add route need unknown-id, unsupported-slug, and refresh behavior. Neither is designed.
8. **Persistence.** No backend or persistence contract exists. Demo mutations could live only in memory, but that must be explicit and must not be presented as durable configuration.

---

## C. Data and domain assessment

### C.1 Concept classification

| Concept | Evidence | Classification | Implication |
|---|---|---|---|
| Repository (`owner/name`) | Detail Identity; inventory column; Add selector | **GitHub-sourced** | Read-only; do not allow editing from Pipesor policy forms |
| Workflow display name (`Deploy production`) | Inventory secondary line; Add Workflow field | **GitHub-sourced** | Read-only; distinct from pipeline slug |
| Workflow file (`deploy-production.yml`, `.github/workflows/integration-checks.yml`) | Detail Identity; Add read-only field | **GitHub-sourced** | Canonical technical reference; display may show basename or full path |
| Default branch (`main`) | Detail Identity; Add read-only field | **GitHub-sourced** | Informational; not a Pipesor setting |
| Provider / integration state (`GitHub Actions · Connected`) | Detail meta; Add GitHub section | **GitHub-sourced** | Connection state, not workflow health or run result |
| Pipeline slug / identity (`deploy-production`) | Inventory primary text; Detail h1 | **Unresolved / currently derived** | Used as visible identity, but no stable ID or derivation rule is designed |
| Environment | Detail Identity says read-only GitHub context; Add calls it Pipesor “Operational environment” | **Unresolved** | Direct contradiction; must be resolved before schema design |
| Criticality | Inventory, Detail, Add; explicit “not incident severity” copy | **Pipesor-managed** | Separate enum from incident severity; operational context only |
| Monitoring | Inventory, Detail, Add; Active/Paused help | **Pipesor-managed** | Controls Pipesor monitoring only; does not enable/disable GitHub execution |
| Responsible team | Inventory, Detail, Add | **Pipesor-managed** | Team reference; not incident assignee |
| Pipeline owners | Detail, Add | **Pipesor-managed** | Responsibility within AIOps; not incident assignment or GitHub permission |
| Access roles/capabilities | Detail Access table | **Demonstration-only / unresolved** | No actor model, no editor, no enforcement; cannot be treated as authorization |
| Last configuration update | Detail audit summary | **Pipesor-managed** | Event/timestamp/actor summary; display is localized |
| Configuration history | “View configuration history” link | **Unresolved** | No event schema, screen, drawer, or retrieval contract |
| Demo badge and prefilled Add values | All artboards | **Demonstration-only** | “Prototype · Demo data” and the pre-confirmation form state must not silently become production behavior |
| Incident association | Existing incident fixtures contain repository/workflow strings | **Unresolved** | No `pipelineId` or foreign-key relationship exists today |

### C.2 Relationships

Proposed, not implemented:

- `Repository 1 ── N Workflow`
- `MonitoredPipeline N ── 1 Workflow` (subject to a uniqueness decision)
- `MonitoredPipeline N ── 1 ResponsibleTeam`
- `MonitoredPipeline N ── N PipelineOwners` (cardinality not formally approved)
- `MonitoredPipeline 1 ── N ConfigurationEvents` (proposed)
- `Incident N ── 0..1 MonitoredPipeline` (currently only display strings)
- `AccessRole N ── N Capability` (display-only in current evidence)

A **monitored pipeline is not a GitHub workflow**. It is a Pipesor record that references a workflow and adds monitoring policy, ownership, and operational context.

### C.3 Domain distinctions that must survive implementation

- **Repository vs workflow:** a repository can host multiple workflows; a pipeline row represents one monitored workflow.
- **Configuration vs run:** the design shows configuration and last configuration update, not pipeline runs. “Active” is not a successful run.
- **GitHub metadata vs Pipesor policy:** repository, workflow file, branch, provider, and connection state are read-only GitHub context. Criticality, monitoring, team, and owners are Pipesor-managed.
- **Monitoring vs execution:** Active/Paused enables or pauses AIOps monitoring. It must not be implemented as a GitHub workflow enable/disable control.
- **Criticality vs severity:** overlapping labels such as “Critical” and “High” are separate domains. Do not reuse `IncidentSeverityLevel` or derive incident severity from pipeline criticality.
- **Pipeline ownership vs incident assignment:** owners are responsible for the monitored workflow within AIOps. Ownership does not assign incidents or grant GitHub permissions.
- **Access capability vs authorization:** “Operate / View / Configure” is descriptive. No actor-to-role assignment, enforcement, or permission editor is designed.
- **Last update vs history:** the summary is one event. It is not the full configuration history.
- **Default branch:** informational GitHub context, not a branch selector for Pipesor actions.

### C.4 Cross-data observations

The existing incident fixtures use workflow display strings that largely match the inventory:

- `Deploy production`
- `Provision infrastructure`
- `Integration tests`
- `Code quality checks`
- `Build container image`
- `Build documentation`
- `Build and test`

But:

- Incidents have **no stable pipeline ID**.
- Incident data includes a **“Unit tests”** workflow with no corresponding inventory row.
- The Add demo introduces **`acme/reporting-service`**, which is not in the current inventory.
- The inventory primary key is the slug; the incident data uses the display name. These are not interchangeable identifiers.

This is acceptable as demonstration data, but it is not a relational dataset. Do not build cross-screen joins on display strings.

### C.5 Schema implications

A future `MonitoredPipeline` contract should follow the pattern already used by `src/entities/incident/model/schema.ts`: strict Zod objects, stable IDs, explicit enums, and validation at the fixture/API boundary rather than in presentational components.

Minimum unresolved schema questions:

- What is the canonical identity: opaque ID, repository + workflow file, or slug?
- Is `Environment` a GitHub value or a Pipesor policy value?
- Are pipeline owners required? Add shows no required marker.
- Is operational environment required? Add shows no required marker.
- Are team/owner values stable references or display names?
- What is the configuration-event shape?
- Are access capabilities stored per pipeline, inherited from roles, or purely informational?

Do not create a `Repository` or `GitHubWorkflow` entity solely because the functional map mentions those concepts. The current flow can represent them as read-only references until a screen needs repository-level behavior.

---

## D. Repository reuse and architectural alignment

### D.1 Reusable existing pieces

| Existing source | Reuse | Caveat |
|---|---|---|
| `src/shared/ui/app-layout/AppLayout.tsx` + CSS | Page shell, 32px content padding, 900px sidebar breakpoint, hint row | Keep 1040/1176 surfaces page-level; do not make `AppLayout` pipeline-specific |
| `src/widgets/app-sidebar/ui/AppSidebar.tsx` + CSS | Global navigation, unavailable-destination pattern, mobile overlay | F-01: closed mobile sidebar remains focusable; adding Pipelines adds another hidden tab stop |
| `src/shared/config/navigation.ts` | `routes.pipelines` and destination flag | `implemented: false` today; no detail/Add routes exist |
| `src/app/App.tsx` | Route composition | Only Operations, History, and Not Found are registered |
| `src/widgets/incidents-table/ui/IncidentsTable.tsx` + CSS | Native table, `table-layout: fixed`, internal horizontal scroll, row hover, 16px edges | Rows are not navigable; its `overflow-x` container is not keyboard-focusable |
| `src/widgets/history-incidents-table/ui/HistoryIncidentsTable.module.css` | 1144px minimum table with internal scroll | Demonstrates the constrained-width pattern; do not import across widget slices |
| `src/widgets/incident-filters/ui/IncidentFilters.tsx` | Visual search/filter pattern | Presentational and F-03-affected; `aria-haspopup="listbox"` exists without a listbox |
| `src/entities/incident/model/schema.ts` | Strict Zod/discriminated-union pattern | Do not reuse incident severity/status enums for pipeline concepts |
| `src/entities/incident/ui/IncidentSeverity.tsx` + `labels.ts` | Entity-local status UI and exhaustive label-key mapping | Criticality and monitoring need their own entity UI and labels |
| `src/pages/operations/ui/OperationsPage.tsx`, `src/pages/history/ui/HistoryPage.tsx` | Page composition and query-parameter view pattern | History/Operations use query parameters for tabs, not entity identity |
| `src/pages/history/ui/HistoryHeader.tsx` | Example of a page-local header | Do not import another page’s internals into Pipelines |
| `src/shared/i18n/config.ts`, `resources.ts`, `lib/format.ts` | Locale-aware copy and date formatting | Only `common`, `operations`, `history` namespaces exist |
| `src/app/styles/tokens.css` | Semantic colors, typography, layout, dark theme | Paper’s raw hex values should not be duplicated |
| `src/shared/ui/icons/Icons.tsx` | Search, chevrons, Pipelines icon | Missing plus, external-link, and close/remove icons |

### D.2 Architectural gaps

- **No Pipelines implementation exists.** The sidebar destination is correctly rendered as unavailable text, not a misleading disabled link.
- **No shared form controls.** There is no reusable text input, select, checkbox, radio group, field row, or save-state pattern in `shared/ui`.
- **No accessible whole-row navigation pattern.** Existing table rows are static; the design explicitly requires whole-row navigation with no drawer.
- **No pipeline entity, fixtures, selectors, or schemas.**
- **No `pipelines` i18n namespace.**
- **No status UI for pipeline criticality or monitoring.**
- **No backend, persistence, or mutation layer.**
- **No test runner or CI.** Verification of new behavior would need to be proposed separately.

### D.3 Recommended FSD shape — not an implementation

A coherent fit with the existing architecture:

- `entities/monitored-pipeline`
  - `model/`: Zod schema, types, enums, fixtures/selectors if needed
  - `ui/`: criticality and monitoring labels/chips, using canonical tokens and translation keys
  - public `index.ts`
- `pages/pipelines` for the inventory, plus separate detail/Add page slices, or one page slice with three exported screens. Separate slices are cleaner if each is a navigable route; one slice is acceptable if shared header composition would otherwise duplicate heavily.
- `widgets/pipelines-table`
- `widgets/pipeline-configuration` for the detail sections
- `widgets/pipeline-onboarding-form` for the Add surface
- `app/App.tsx` route registration
- `shared/config/navigation.ts` for route constants and the inventory destination flag

Do **not** introduce a `features` layer merely to match the functional map. The current screens can be composed from pages, widgets, entities, and shared code. If the project later implements real, independently saved commands and onboarding with validation and side effects, feature slices such as `features/configure-pipeline-policy` or `features/onboard-monitored-workflow` may become justified. That is a future architectural decision, not part of this exploration.

### D.4 Boundary conflicts to avoid

- Do not import `HistoryHeader` or other page internals into Pipelines. Create a Pipelines-specific page header.
- Do not import another widget’s CSS or internal components. The incident table and filter widgets are not public cross-slice primitives.
- Do not reuse the incident severity enum for criticality.
- Do not refactor the incident schema or fixtures to add pipeline references without approval.
- Do not put the 1040px configuration surface or 1176px inventory width into `AppLayout`; those are page-level compositions.
- Do not create a speculative `Repository` or `GitHubWorkflow` entity until a screen needs more than references.
- Do not add a generic form system to `shared/ui` solely for these screens. Native, styled controls can remain local; promote shared primitives only after a second real consumer.

---

## E. Interaction and integration assessment

### E.1 Affordance-by-affordance status

| Affordance | Evidence | Contract status |
|---|---|---|
| Pipelines sidebar destination | Nav item and active state in all frames | Visual intent; currently `implemented: false`; no `/pipelines` screen |
| Add monitored workflow — inventory | Primary button; layer annotation says future flow, “no wizard designed” | Entry behavior unresolved; Add artboard is a continuous form |
| Whole row opens detail | Layer annotation explicitly says so, no drawer | Strong navigation intent; no route, no row link, no stable ID |
| Back to Pipelines | Visible link on detail/Add | Navigation intent; list-state behavior unspecified |
| Cancel | “Cancel — return to Pipelines without saving” | Clear discard intent; no dirty confirmation |
| Detail criticality control | Select-like 240 × 36px control | Looks editable; no save/edit contract |
| Detail monitoring control | Segmented Active/Paused | Looks editable; no save/edit contract; must remain monitoring-only |
| Edit ownership | Visible link | No editor surface or save contract |
| Open repository / Open workflow | Visible external-link labels | No URLs or new-tab/accessibility contract |
| View configuration history | Visible link | No target screen or event contract |
| Add repository selector | Required selector | Data source, authorization scope, loading, and error behavior undefined |
| Add workflow selector | Disabled until repository selected; reset dependencies | Dependency intent is clear; options and async behavior are not |
| Add criticality / environment / monitoring / team / owners | Form controls | Values are clear; save/submit semantics are not |
| Add submit | “Add monitored workflow” | Annotation describes validation and registration; no visible success, failure, or loading state |
| Duplicate prevention | Hidden duplicate annotation | Intended to prevent Add and open existing configuration; uniqueness key undefined |
| Retry | Hidden async-error variant | Implies a real retry action; no data source contract |
| Search and filters | Search input and three closed dropdowns | No behavior, query contract, or result states |
| Access table | Four static rows | Display-only; no authorization contract |

### E.2 Independent policy and ownership editing

The target behavior is that Operational policy and Ownership are independently editable and saved. The artboards do not show how:

- Criticality and monitoring look directly editable in the detail. No Save button is present, so inline/automatic saving is plausible.
- Ownership is read-only text plus an **Edit ownership** link. A separate editor, dialog, or edit mode is plausible.
- Neither section has dirty, saving, saved, error, conflict, or revert states.
- Neither section shows how a saved change propagates to the inventory.
- Neither section shows how a save appends to the last-configuration-update summary or the configuration history.
- No decision exists between auto-save and explicit save.
- No concurrency/versioning behavior exists for two actors editing the same pipeline.

This is a **blocker for a faithful interactive detail**, not merely a styling detail.

### E.3 Onboarding state coverage

| State | Designed? | Notes |
|---|---|---|
| Blank initial form | No | Visible form is prefilled “pre-confirmation demo” data |
| Repository selected | Partially implied | Workflow enables and dependent values reset |
| Workflows loading | Hidden conceptual state only | Opacity 0 |
| Workflow loading error | Hidden conceptual state only | Retry shown |
| No workflows available | No | No empty state |
| Validation errors | Hidden conceptual state only | Required-fields and unavailable-workflow copy |
| Duplicate workflow | Hidden conceptual state only | Prevents Add; links to existing configuration |
| Submitting | No | No progress or disabled state |
| Success | No | No confirmation or destination state |
| Submission failure | No | No error or recovery state |
| Cancel with dirty data | No | No confirmation |
| Direct URL / refresh | No | No initial-state or not-found behavior |

### E.4 Integration boundaries

- GitHub is read-only. Add copy explicitly says workflow files and GitHub permissions remain unchanged, and registration changes only AIOps monitoring.
- The source of repositories and workflows is not defined. “Connected GitHub integration” and “authorized repositories” are visual/annotation evidence, not an API or authorization contract.
- There is no repository search, pagination, permission filtering, integration reconnect, or disconnected-integration state.
- There are no pipeline run records, run status, or execution controls.
- There is no backend, persistence, or configuration-history API.
- Route identity is unresolved: only `/pipelines` exists; detail and Add paths, parameters, direct-link handling, and post-submit navigation are not registered or approved.
- Do not invent success/error semantics. The hidden conceptual states are evidence of intended validation, not approved behavior.

### E.5 F-03-specific caution

The existing filter component is a concrete example of what not to repeat:

- Scope buttons have no `onClick`.
- Search has no `onChange`.
- Dropdowns use `aria-haspopup="listbox"` without a listbox.
- The controls are presentational but visually promise behavior.

Pipelines adds many more affordances that could repeat this pattern: search, filters, Add, row navigation, editable-looking policy controls, edit ownership, external links, history, form submits, and chip removal. Every one must either have a real, tested behavior or be rendered as non-interactive content/hint. Do not use `aria-haspopup`, anchors without `href`, or enabled buttons without actions.

---

## F. Visual and quality considerations

### F.1 Responsive behavior — F-02

The artboards show only 1440px desktop. The fixed measurements create concrete constrained-width risks:

- At 1440px, content width is 1176px and the inventory table fits exactly.
- At 1280px, expanded-sidebar content width is approximately **1016px**. The 1040px detail/Add surface already exceeds it by 24px, and the 1176px table requires internal scrolling.
- At 1024px, expanded-sidebar content width is approximately **760px**. The 1040px surface overflows by about **280px**.
- At 768px, with the sidebar as an overlay, content width is approximately **704px**. A field row of 220px label + 440px control + 48px section padding is **708px**, so even the form row overflows slightly.
- At 375px, content width is approximately **311px**; the design cannot adapt without restructuring.

Requirements implied but not designed:

- A fluid maximum width for the 1040px surface, rather than a fixed width.
- Stacked label/control layout at narrow widths.
- Fluid 440px and 240px controls (`width: 100%` with sensible max widths).
- Table internal horizontal scrolling without shrinking text, plus a keyboard-focusable scroll region.
- Preservation of the 900px sidebar breakpoint and mobile overlay behavior.
- Header/action wrapping, filter wrapping, and long-form action accessibility.

The Add artboard is 1659px tall; its surface ends around 1627px. At a 900px viewport, the review and actions are roughly 700px below the fold. No sticky action bar is designed. Detail is also taller than the viewport. This is not necessarily wrong, but it needs an approved narrow-screen and long-form behavior.

Existing tables already use internal overflow with minimum widths, which is a good starting pattern. Their scroll containers are not focusable, so keyboard users cannot independently scroll a clipped table. A new Pipelines table should not inherit that gap.

### F.2 Accessibility — F-01 and related risks

**F-01 — closed mobile navigation retains focusable controls**

This is present in the current `AppSidebar` implementation:

- At `max-width: 900px`, the sidebar is fixed and moved with `transform: translateX(-100%)`.
- It remains mounted; it is not `inert`, `aria-hidden`, or hidden with `visibility`.
- Nav links and buttons remain in the tab order even when the overlay is closed.

Adding Pipelines as another nav destination increases the number of hidden tab stops. This exploration should not remediate the unrelated sidebar code, but the future Pipelines implementation must be tested with the sidebar closed at narrow widths. Do not declare the screen mobile-ready without resolving or explicitly accepting this inherited issue.

**Other accessibility requirements**

- Use a proper heading hierarchy: page title as `h1`, section titles as `h2`.
- Use a semantic `<table>` with `scope="col"` and a caption or `aria-labelledby` referencing “Monitored workflows.”
- Whole-row navigation needs one accessible link/focus target. Do not rely on a clickable `<tr>` alone; provide a visible focus indicator and Enter activation.
- If the table scrolls horizontally, make the scroll region keyboard-focusable and label it, or avoid overflow through responsive column treatment.
- Form controls need persistent visible labels, not placeholder-only labels.
- Required fields need programmatic required state and visible required indicators.
- Help text and errors must be associated with controls (`aria-describedby`), and asynchronous status should be announced with a live region.
- The monitoring segmented control should use radio semantics or buttons with `aria-pressed`; it must expose the current state and group label.
- Disabled Workflow must have an accessible reason (“Select a repository first”), not only reduced opacity.
- Chips with “×” need accessible remove-button names that identify the owner.
- The Access table should use table semantics or a definition structure, not visual columns alone.
- External GitHub links need accessible names and correct new-tab disclosure if they open a new tab.
- Criticality and monitoring must convey meaning with text, not color alone.
- Route changes should move focus to the new page heading/main region and update the document title.
- Dark theme and focus states need contrast checks, including status dots, helper text, disabled controls, and chip borders.

**F-03 — controls and instructions implying unsupported interactions**

The Pipelines mockups contain many such affordances. The design should not be implemented as a facade that looks operational. The existing `IncidentFilters` component is a known caution: controls that do nothing, plus incorrect popup semantics. The same risk applies to:

- Search and filter controls
- Add and Cancel if routes are absent
- Row hover if rows are not navigable
- Criticality/monitoring controls if no save exists
- Edit ownership and configuration history links without targets
- External GitHub links without URLs
- Form submission without validation/success/error behavior
- Chip removal glyphs without behavior

### F.3 Localization

- A new `pipelines` namespace is justified when the screen is implemented. Current namespaces are only `common`, `operations`, and `history`.
- Add keys to both English and Spanish.
- Translate UI labels, section copy, status labels, validation messages, access capability labels, and action labels.
- Do **not** translate GitHub technical values: repository names, workflow filenames, paths, branch names, provider names, or demo team/owner names.
- Keep canonical enum tokens in the domain and map them to translation keys in the UI, following the existing incident label pattern.
- Use `shared/i18n` formatters for dates. The detail mockup shows “Sep 30 · 10:42”; the existing formatter produces a locale-aware month/day/time form. Do not hard-code the display string, and do not sort/filter by formatted values.
- Spanish expansion is a real constrained-width risk: labels such as “Responsible team,” “Last configuration update,” “Pipeline Administrators,” and “Add monitored workflow” are longer. The 220px label column, 240px controls, and 110/130px table columns may need wrapping, wider slots, or a responsive layout.
- The “High → Critical” audit summary needs localized field/value labels; the arrow itself can remain a symbol.
- If the “Prototype · Demo data” marker is retained, treat it as a deliberate demo-only label; it is probably not production copy.

### F.4 Theme and visual fidelity

- Use semantic tokens from `src/app/styles/tokens.css`; do not copy Paper’s raw `#FFFFFF`, `#F1F3F5`, or status hex values into components.
- Paper’s Critical and Active text colors already align with existing `--color-critical` and `--color-success`; dark theme uses different token values.
- Any tinted criticality/monitoring backgrounds need semantic light/dark tokens. Do not create a parallel theme or arbitrary palette.
- Preserve the Pipesor logo and branding.
- The 1040px surface’s left alignment and 136px right gap should be confirmed as intentional before implementation. If it is accidental, centering is a visual change requiring approval.

### F.5 State and quality gaps

- Inventory has no loading, empty, error, or no-results state.
- Add has no blank initial state, visible duplicate state, submitting state, success state, or submission error state.
- Detail has no policy edit state, ownership editor, save feedback, or configuration history.
- No unsaved-change protection exists for Back or Cancel.
- No persistence or mutation contract exists.
- No count, pagination, or large-inventory behavior is designed.
- No dark-theme or narrow-screen frames exist.
- No automated tests or CI exist to verify new behavior.

---

## G. Unresolved decisions and implementation readiness

### G.1 Decisions required before a faithful full implementation

1. **Environment ownership.** Is “Environment” read-only GitHub context, as the detail Identity section implies, or a Pipesor-managed “Operational environment,” as the Add policy section says? This changes the schema, the section grouping, the read-only rules, and possibly whether the field is required.
2. **Pipeline identity and routing.** What is the stable identity: opaque ID, repository + workflow file, or slug? What are the detail and Add URLs? Is `/pipelines/new` distinct from a dynamic detail route? How are direct URLs, unknown IDs, and back navigation handled?
3. **Independent save contract.** Are policy and ownership saved inline, on change, or through explicit Save controls? What are the dirty, saving, saved, error, conflict, and revert states? How does a save propagate to inventory and configuration history?
4. **Onboarding entry and submission.** Is the Add action the continuous form artboard, or the future staged flow described in the button annotation? What is the blank initial state? What happens on submit, duplicate, network failure, and success? What data creates the new detail: slug, initial audit event, access capabilities, and route?
5. **Cancel/back dirty-state behavior.** Does Cancel always discard? Is there a confirmation? Does Back preserve list filters and scroll? Does a direct route rehydrate the form?
6. **Configuration history.** Is “View configuration history” a screen, drawer, or deferred link? What events are stored, with what actor/timestamp/field-change shape?
7. **Access semantics.** Is the Access table informational only, or is it expected to enforce authorization? If informational, remove any implication that it controls editing. Do not invent roles or enforcement.
8. **Responsive approval.** The mockups define only 1440px desktop. Approve the narrow-screen behavior, especially the 1040px surface, 440px fields, 220px label column, long form actions, and table overflow.
9. **Integration data contract.** What supplies repositories and workflows? How are “authorized” repositories scoped? What are the loading, empty, disconnected, permission-denied, and retry behaviors? This can remain mock-only only if the UI is explicitly non-operational.
10. **Demo affordances.** Are search, filters, Add submission, external links, and configuration history in scope for the first implementation? If not, omit them or render them as non-interactive content rather than false controls.

### G.2 Decisions that can follow existing conventions

These do not need new product approval if the approved visual and behavior are otherwise clear:

- FSD placement: entity, page, widget, shared boundaries.
- CSS Modules and semantic tokens.
- Native table structure and internal horizontal scrolling.
- Native form controls with CSS Modules.
- Zod validation at the data boundary.
- `pipelines` i18n namespace with EN/ES resources.
- Locale-aware date formatting via `shared/i18n`.
- Entity-local criticality/monitoring labels and exhaustive label-key maps.
- Focus-visible styling, reduced-motion handling, and dark-theme token usage.
- Page-local Pipelines header; do not import History’s header.
- No new dependencies.
- No `features` layer unless real commands later justify it.

### G.3 Readiness by slice

| Slice | Readiness | Assessment |
|---|---|---|
| Inventory read-only | Medium-high | Visually clear and close to existing table/page patterns. Needs route registration, a row-link accessibility pattern, stable demo identity, and responsive table behavior. |
| Detail read-only | Medium | The visual hierarchy is clear, but identity/environment semantics and the meaning of Access/History must be decided. Can be built read-only only after those are clarified. |
| Add visual-only | Medium | The continuous form is specified in detail, but the entry flow, blank state, validation, and post-submit behavior are unresolved. A non-submitting visual prototype is possible; a real onboarding flow is not ready. |
| Full interactive flow | Not ready | Requires environment classification, stable identity/routing, edit/save contracts, onboarding submission and recovery states, configuration history, responsive approval, and integration data/authorization contracts. |

### G.4 Overall assessment

The three views are visually coherent and clearly belong to one flow. The existing foundation is sufficient for a coherent implementation: React 19, TypeScript strict, CSS Modules, semantic tokens, React Router, native tables, Zod, and the existing i18n and layout infrastructure cover the structural needs. No new dependency or architectural layer is required now.

They are **not implementation-ready as a complete interactive flow**. The most material blockers are:

- the contradictory classification of Environment,
- the absent stable pipeline identity and detail/Add routes,
- the missing independent-save interaction and feedback,
- the incomplete onboarding state model and post-submit contract,
- the undefined configuration-history and access semantics,
- and the unresolved responsive/accessibility behavior around F-01, F-02, and F-03.

A read-only, fixture-backed inventory, a read-only detail, and a non-submitting Add visual could be implemented coherently after the route/identity and responsive decisions. The full flow—editing, registration, history, filters, and inventory propagation—should wait for the corresponding behavior and data contracts. No implementation or verification was performed in this exploration.