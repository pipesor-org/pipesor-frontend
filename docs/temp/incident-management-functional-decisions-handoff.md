# Pipesor — Incident Management: Consolidated Functional & Navigation Handoff

**Purpose:** Reference for Codex to reconcile the repository's *existing documentation* before any further Incident Management implementation.  
**Scope:** Operations, History (Incidents and Insights), and Incident Workspace.  
**Status:** Consolidated functional direction for documentation review; **not** authorization to implement the lifecycle, modify application code, or assume unresolved backend contracts exist.  
**Evidence:** `incidents-e2e-exploration.md` (read-only assessment of `develop` at `5b87902`), the reviewed Paper information architecture/artboards, and the subsequent D01–D07 architectural handoff. The assessment is a historical baseline: inspect the current repository before describing anything as currently implemented.

## 1. Guiding interpretation

Operations and History are legitimate **read projections** of the incident domain. Their existing URL conventions (`/operations?queue=...` and `/history?view=...`) are appropriate; there is no requirement to make them resemble Pipelines routes. What remains incomplete is the **connected incident journey**: discovering a record, inspecting evidence and diagnosis, returning to the originating context, and eventually performing separately authorized human actions.

Distinguish three different levels of certainty throughout the documentation:

- **Consolidated frontend direction:** the intended navigation and read-experience contracts in D01–D07 below. Document them as *target design*, not as implemented functionality.
- **Observed current behavior:** only what the current source actually provides; preserve distinctions between live controls, static affordances, and prototype fixtures.
- **Unresolved domain/backend contract:** identity, authorization, mutations, auditability, provenance, lifecycle transitions, and unsupported evidence. Do not silently promote these to approved behavior.

The seven decisions below are **interdependent**. In particular, History membership, Insights denominators, filter semantics, and contextual return must agree before navigable read journeys can be considered complete.

## 2. Consolidated decisions

### D01 — Single Incident Workspace destination

**Frontend target:** Use one incident-detail route, `/incidents/:incidentId`, independently of where the user selected the incident. Render the Workspace from the incident's lifecycle, diagnosis, and validation dimensions rather than creating one route/page per Paper snapshot.

A stable incident identity is required; the current `INC-<digits>` shape is validated but collection-level uniqueness and durable lookup are not yet guaranteed. An unknown ID should receive explicit not-found handling (consistent with the app's existing resource routing), not a fabricated incident.

**Do not infer** that all designed actions are available merely because a record can be opened. Paper variants communicate presentation intent, not a fully specified state machine.

### D02 — Origin-aware, safe return navigation

**Frontend target:** Workspace return navigation must reflect **where the user came from**, not merely the incident's status:

| Origin | Return destination |
|---|---|
| Operations / Active Incidents | Active queue with applicable original search/filter context |
| Operations / Needs Validation | Validation queue with applicable original search/filter context |
| History / Incidents | History incident results with applicable original search/filter context |

Retain recognized query criteria and relevant analytical context where applicable. Do not accept arbitrary/untrusted return URLs or allow a location state to create an open redirect. Direct entry and reload require a documented, safe fallback.

**Proposed fallback for explicit approval:** no origin → unresolved incident: Operations / Active; resolved + pending validation: Operations / Needs Validation; resolved + terminal validation: History / Incidents. This is a *navigation fallback only*, not an authorization rule, and must remain flagged as proposed until accepted.

Specific mechanics for scroll position, ordering, pagination, and history replacement remain unresolved. A contextual Back link is not necessarily equivalent to `history.back()`.

### D03 — History contains all operationally resolved incidents

**Revised target decision (supersedes the earlier provisional selector semantics):** History / Incidents should contain **all operationally resolved incidents**, regardless of whether diagnosis validation is `PENDING`, `CONFIRMED`, or `REJECTED`.

Needs Validation is a **work queue**, not an exclusive historical partition. One resolved/pending incident may appear in **both** Needs Validation and History; that is expected. A resolved incident does not become unresolved when its diagnosis is rejected.

The assessed fixtures contained 21 records: six unresolved, seven resolved/pending, and eight resolved with terminal validation. Accordingly, the *unrestricted fixture population* for the new History rule would be **15 resolved records**, subject to any separately defined date/filter criteria. This is a fixture-derived design check, not a measured production statistic.

**Analytics must not use one implicit denominator for all indicators:**

| Measurement | Appropriate population / qualification |
|---|---|
| Resolved incident count and breakdowns | Operationally resolved incidents within the selected period and applicable filters |
| Recurring repository/workflow/stage contexts | Contributing resolved incidents within the selected analysis scope |
| Pending-diagnosis-validation count | Resolved incidents with `PENDING` validation, within the applicable scope |
| Diagnosis confirmation rate | **Confirmed / (Confirmed + Rejected)** diagnoses whose review is complete, within the same stated analysis period/scope; exclude pending outcomes from this denominator |
| Resolution-time indicators | Resolved incidents with sufficient trustworthy timestamps; document the calculation and exclusions before claiming an MTTR |

The previously displayed **5 confirmed / 8 terminally reviewed = 62.5%** applies only to the assessed fixture population (and only to a stated analysis period that actually includes those records). Do **not** use 15 resolved incidents as the denominator for diagnosis confirmation. Paper's illustrative figures (e.g., 43 incidents, 84% confirmation) are **not** measured prototype or thesis outcomes.

**Documentation implication:** distinguish the History list's membership from the specific denominator of each Insights metric. Revising History membership requires reviewing Insights calculations/definitions, but this documentation task must **not** change selectors or displayed values.

### D04 — Coherent search and filter semantics across read views

**Frontend target:** Support combinable search/filter criteria over the data genuinely available for each view. Prefer URL-representable query state when users need deep links, browser navigation, or return-context preservation. Consistency means comparable rules for composition, reset, and URL behavior—not necessarily identical filter sets.

- Operations / Active, Operations / Needs Validation, History / Incidents, and History / Insights have **different supported dimensions**. Their controls must be verified against both Paper and the current source; do not invent a universal filter schema.
- Define matching semantics, date bounds/timezone, filter conjunction, empty results, reset, and sort guarantees before calling filters functional. The current Active and Needs Validation ordering captions are not backed by sorting logic, unlike History's fixed resolution-time sort.
- `Mine` cannot be operationally defined by a decorative/static profile. It requires a real authenticated subject and a settled meaning of responsibility. `Unassigned` and assignee filtering must refer to **incident assignment**, not monitored-pipeline ownership.
- A visually present input or button that does not change results is not functional. The interim NAV-02 disabled-controls correction addresses truthful semantics, but does **not** settle the intended filter contract or authorize permanent removal of planned filters.

**Still unresolved:** exact supported keys, match rules, ordering, URL parameter names, invalid-parameter normalization, and which counts summarize the filtered set versus the entire queue. Record these explicitly; do not invent them while editing documentation.

### D05 — Insights recurring-context drill-down

**Frontend target:** Selecting a recurring context in **History / Insights** navigates to **History / Incidents**, applying the contributor criteria:

`repository + workflow + stage + analysis period`

The destination set must reproduce the **same contributing incident population** as the selected aggregate, including its time window and any additional analysis-scope exclusions. A user should not see a larger or smaller set simply because Insights and the History list use different implicit populations.

Current grouping is by repository *name*, workflow *name*, and stage—not by verified root cause or a stable monitored-pipeline ID. Do not relabel these groups as proven causal classifications or silently substitute pipeline ownership/identity. A stable grouping key and URL representation require confirmation.

Only the recurring-context drill-down is supported by the assessed Paper intent; do not invent clickable chart bars, points, or KPIs.

### D06 — One coherent, initially read-only Workspace

**Frontend target:** Prepare a navigable **read-only** Workspace, using approved internally consistent synthetic records, with three principal presentations:

| Incident context | Minimum conceptual presentation |
|---|---|
| Unresolved / active | Current operational status, diagnosis state, observed evidence, AIOps hypothesis and recommendation when present |
| Resolved / pending validation | Original diagnosis/evidence plus supported intervention, verification, resolution and pending-review context |
| Resolved / terminal validation | Preserved diagnosis, recorded `CONFIRMED` or `REJECTED` outcome, and supporting historical context; initially read-only |

Maintain explicit separation between **(a) observed evidence**, **(b) AIOps inference**, **(c) operational incident state**, and **(d) human validation**. `IncidentStatus`, `DiagnosisStatus`, and `ValidationStatus` are distinct dimensions. A confidence value belongs to the preserved diagnosis, not to a subsequent reviewer verdict.

Required read-model concerns to document (not fabricate as populated existing fields): incident identity; diagnosis identity/version and evidence references; originating and verification GitHub runs; timestamps and relevant event history; intervention/resolution context; recorded validation outcome and provenance; authorized evidence visibility.

The Paper Open and Verification snapshots of `INC-1039` are **not a trustworthy chronological trace**: their elapsed times conflict. Reconcile identities, timestamps, and run associations *before* constructing coherent fixtures. Likewise, analyzing/inconclusive states and historical confirmed/rejected presentations lack complete source specification; record these as open rather than guessing.

Where an underlying value is unavailable, do not fabricate reviewer names, exact timestamps, commit/PR/run URLs, actual causes, or audit actors. Do not treat display durations as event timestamps. Explicit loading/error/empty states for future API access remain separate implementation concerns.

**Privacy:** any logs, event payloads, excerpts, or linked evidence must be subject to minimization, masking, authorized access, and traceable provenance before exposure. GitHub integration remains read-only; external navigation is permitted only for a genuine approved reference.

### D07 — Distinct human operations; backend-dependent execution

Keep **incident assignment**, **start remediation**, **incident resolution**, and **diagnosis confirmation/rejection** separate in the domain and documentation. Monitored-pipeline ownership is not incident assignment and neither establishes the right to review a diagnosis.

A successful verification run is **observed evidence**; it must not automatically resolve the incident or confirm its diagnostic hypothesis. Human remediation occurs outside Pipesor/GitHub automation; there is no authorized workflow mutation implied by the mockup.

Do **not** implement persistent commands until the contracts for authenticated identity, eligibility/authorization, transitions and preconditions, concurrent updates, data preservation, and auditable decisions are established. A rejection's stated actual cause and notes must not overwrite the original AIOps hypothesis or confidence. Paper's hidden rejection form suggests an interaction but does not establish complete submission rules.

## 3. Cross-cutting consistency and explicit open decisions

The functional map should clearly distinguish **decided frontend direction** from the following unresolved matters:

| Area | Still to define / verify before feature implementation |
|---|---|
| Workspace routing | Incident collection uniqueness; identity scope, lookup/error behavior; direct-entry fallback acceptance |
| Return context | Exact query contract, sanitization, retained sorting/scroll/pagination, browser history behavior, route-entry focus |
| Filtering | Searchable fields, matching rules, supported facets per view, combined criteria, date handling, counts, and ordering |
| Insights | Per-indicator populations and periods, denominator/exclusions, recurring-group key, exact drill-down matching |
| Read model | Structured diagnosis/evidence/recommendation, original and verification run references, coherent event chronology, historical review details |
| Incomplete diagnosis states | Presentation for analyzing/inconclusive hypotheses, partial/absent evidence, unsupported actions |
| Human operations | Assignment/reviewer identity and roles, review subject/version, transition rules, resolution criteria, permissions, audit and revision semantics |
| Compliance | Redaction and minimization points, evidence visibility authorization, handling of sensitive logs and external links |

**Additional observations from the assessments:**

- NAV-01 (rows and instructions promising unavailable destinations) and NAV-02 (filter controls with misleading behavior/ARIA) are connected symptoms of unfinished *user flows*, not a reason to permanently disable intended features. Document the capability gap; do not treat the presentational workarounds as the desired end state.
- NAV-03 (closed mobile sidebar focus) is a separate shell accessibility fix, not part of the incident domain. NAV-04 (focus after cross-module route entry) is a cross-cutting navigation convention to address when routes become usable; neither changes D01–D07.
- The assessment found a documentation/source mismatch: History currently exposes **five** filter dimensions, and Insights uses date/repository/**pipeline**/stage/**severity**; reconcile descriptions with current Paper/source without calling static filters implemented.
- Repository availability differs by branch. Inspect the current branch and working tree rather than relying on an older assessment or on another branch's commits. Preserve uncommitted changes.

## 4. Documentation reconciliation instructions for Codex

**Task:** Update existing repository documentation to reflect the consolidated functional direction and remaining decisions. This document is the reference, not a request to implement those features.

1. Read `AGENTS.md`, `docs/architecture/frontend-functional-map.md`, and the relevant current navigation, incident-schema/selector, and UI sources. Use `incidents-e2e-exploration.md` and the Paper artboards to distinguish demonstrated behavior from design intent.
2. Update **`docs/architecture/frontend-functional-map.md`** as the primary decision record. Reconcile its Operations/History/Insights/Workspace sections, open-decision section, and documented route availability. Preserve its existing organization and conventions rather than appending contradictory parallel descriptions.
3. Inspect `README.md` and other **directly relevant existing documentation** only for contradictions introduced by these clarified decisions or stale implementation status; update them only where necessary. Do not broaden into an architecture rewrite, redesign Paper, or alter unrelated project docs.
4. Mark each claim clearly as **implemented now**, **agreed target/frontend direction**, **proposed clarification awaiting acceptance**, or **unresolved backend/domain contract**. In particular, D03 is a **new target population** while the assessed implementation remains terminal-validation-only; D02's status-based direct-entry fallback is **proposed**, not final.
5. Follow the current Git workflow and preserve unrelated local changes. Do not modify TypeScript, styling, fixtures, tests, dependencies, or GitHub workflows. Do not create an API specification or a development task breakdown.
6. Report: updated documentation files/sections; material contradictions resolved; any evidence gaps or choices that still require explicit product approval. Do not claim feature implementation or updated metrics without code/runtime evidence.

## 5. Documentation acceptance criteria

The updated docs should let a future agent answer, without inference:

- Why Operations/History use query-selected read views while Workspace uses `/incidents/:incidentId`.
- Why return navigation follows **origin** rather than incident status, with a safe unresolved direct-entry fallback policy.
- Why Needs Validation and History can include the **same resolved/pending** incident.
- Which Insights figures draw from all resolved incidents versus only terminally reviewed diagnoses, with explicit denominator and period.
- How a recurring context reconstructs its contributing incidents, without presenting correlation as proven root cause.
- Which Workspace data are observed, inferred, operational, and human-validated—and which fields do not yet exist.
- Why human commands remain deferred until verified backend/auth/audit contracts exist.
- Which present UI affordances are nonfunctional today, instead of claiming they already work.

**Stop at documentation reconciliation. No application implementation is authorized by this handoff.**
