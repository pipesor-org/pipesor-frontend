# Pipesor frontend functional architecture map

This is the maintained functional architecture reference for Pipesor. It distinguishes the implemented frontend, agreed target decisions and unresolved contracts. Every screen is integrated with the services (see *Service integration status* below); no demonstration fixtures remain. Pipelines inventory, read-only Detail and local onboarding draft are implemented; workflow registration and configuration saves are deferred until local API integration. A shared mutable demonstration collection is no longer an approved target.

## Service integration status

Integration follows the MVP HTTP API v1 and the owner decisions recorded for the deployed MVP (2026-11-22). Where a section below still describes fixture behaviour for Operations or the Workspace, this table supersedes it.

| Area | Status | Contract |
| --- | --- | --- |
| Sign-in / session | Integrated | Ingestion `auth/github/start`, `auth/session`, `auth/logout` |
| Operations — Active | Integrated | Pipeline `GET /incidents?state=OPEN` (every unresolved incident), pipeline read per distinct pipeline, Recommendation diagnosis per loaded row (max 6 concurrent; `404 diagnosis_absent` = Analyzing) |
| Operations — Needs Validation | Integrated | Pipeline `state=RESOLVED&diagnosis=PENDING` (ADR-027), selected before paging; against a Pipeline without that criterion, `state=RESOLVED` joined with diagnosis `status = PENDING` (D03) over the loaded pages, which the view states |
| Incident Workspace | Integrated | Pipeline incident, runs and executions; Recommendation diagnosis. Title `repo · Run #<runId>`; `INC-<displayNumber>` when present, else the abbreviated UUID. The incident's own facts (ADR-027) stand in when the pipeline read fails (repository, workflow, GitHub links) and give the diagnosis status before Recommendation answers |
| Incident lifecycle | Integrated (`features/manage-incident-lifecycle`) | Pipeline `POST /incidents/{id}/remediation`, `/verification` and `/resolve` (OPERATE). Verification: the operator picks a successful run (`GET …/runs?conclusion=success`); Ingestion captures it (`POST …/analysis`, polled until `PUBLISHED`) and its `executionId` is linked. Retry-remediation (failed verification) is not offered because only successful runs are linked |
| Diagnosis review | Integrated (`features/validate-diagnosis`) | Recommendation `GET/POST /diagnoses/{id}/reviews` with `expectedRevision`; Confirm → `CONFIRMED`, Reject → `CORRECTED` with actual cause; notes optional |
| History — Incidents | Integrated | Pipeline `state=RESOLVED` (all resolved, D03) with diagnosis status; search and facets (repository, severity, stage, validation) per D04; diagnosis time = `diagnosis.createdAt − detectedAt`, resolution time = `resolvedAt − detectedAt`; links open the Workspace with `from=history` |
| History — Insights | Integrated | Pipeline `GET /api/v1/insights?top=50` over every resolved incident the caller may view (pipeline-service #29); against a Pipeline without it, computed in the browser over the loaded population (the scope line then states N of M loaded). Last 30 days by `resolvedAt`: mean TMD, MTTR, confirmation rate (`CORRECTED` + `REJECTED` = Rejected, `PENDING` excluded), weekly TMD trend, stage distribution, recurring pipeline + stage groups (first 3 shown; "of 50+" when the service's top list is full). D05 drill-down not implemented |
| About Pipesor (public) | Implemented (`pages/about`) | `/about/:view`, reachable without a session (sign-in links, sidebar "About Pipesor"): How it works (an animated data journey — eight stages with what happens, where, what is kept and an illustrative specimen — the two independent tracks, and a searchable glossary linked to the journey), Getting started, AI transparency and Security. Copy states only implemented behaviour (`docs/content/ficha-tecnica-paginas-informativas.md`); Privacy and Terms follow once their text is drafted |
| Pipelines inventory | Integrated | Pipeline `GET /pipelines` (offset/limit, all pages); search and criticality/team/monitoring filters run in the browser over the complete list and stay in the URL |
| Add monitored workflow | Integrated (`features/onboard-monitored-workflow`) | Ingestion discovery (`/github/repositories`, `/workflows`) with the user's access, browsed by GitHub account (collapsible blocks, one search, 20 repositories per account before "Show all", workflows inside the open repository; monitored workflows are marked instead of being offered — linking to their pipeline when the caller can see it, "ask a repository administrator for access" otherwise, from `GET /api/v1/pipelines/registrations?repositoryId=` (ADR-028; an older Pipeline marks only visible ones)), read page by page (`pageSize=100`, `nextPageToken`, up to 1,000 repositories, stated when reached; legacy `limit=100` against an Ingestion without pages); `POST /pipelines` (409 duplicate); pipeline owners omitted (no contract) |
| Pipeline Detail | Integrated | Pipeline item, grants (per person `tid:oid`) and latest activity; read-only policy (configuration saves stay a non-approved candidate); `features/grant-pipeline-access` shows "People": grants joined with the repository's GitHub collaborators (`GET /github/repositories/{id}/collaborators`, ADR-028) as @login, GitHub role and one access level (view, operate, configure, operate and configure); CONFIGURE holders change levels, add collaborators who have signed in to Pipesor (configure only for GitHub admins) and remove access (never the last CONFIGURE, `409 LAST_CONFIGURE_GRANT`); people missing from the complete collaborator list are marked; "Grant me Operate" stays as the shortcut, using the subject from Ingestion's discovery context; `features/request-run-analysis` lists failed runs (10 per page from GitHub, "Load more" follows `nextPageToken`) and requests their analysis, following the receipt to the incident |
| GitHub connection | Integrated (`widgets/github-connection`) | `GET /github/connection`; Reconnect repeats the GitHub sign-in to the same view |

Search and facets returned to Operations (Active, Needs Validation) and History — Incidents on 2026-11-24 — see D04 implementation status. Still removed: Mine/Unassigned and the assignee column in Operations and History, the static Insights filters, the incident fixtures and selectors, (no server criteria or assignment contract), confidence values, related-PR and full-timeline links, and the local P3 replay/pilot routes.

## How to read this map

| Status | Meaning |
| --- | --- |
| **Implemented** | Verified in the current source; not a claim of backend integration or browser acceptance. |
| **Confirmed Constraints** | Established boundaries that future work must preserve; not necessarily implemented integrations. |
| **Approved — Not Implemented** | Agreed target frontend/functional direction, distinct from current runtime behavior; not approval for implementation work or unresolved integration contracts. |
| **Proposed — Not Approved** | Candidate behavior, structure or screen requiring scoped approval before implementation. |
| **Open Decision** | Unresolved product/domain rule, contract, permission or operational behavior. |

Status labels apply to the section or table explicitly marked with them. A conceptual domain object is not automatically an FSD slice, database table or endpoint. Paper frames specify visual states, not architectural boundaries or permission to implement operations.

Incident Management decisions D01–D07 below consolidate the functional/navigation handoff. They supersede earlier provisional targets only where explicitly stated; current source behavior remains separately labeled. Their documentation does not authorize application changes or select new FSD boundaries.

### Documentation responsibilities

- [README](../../README.md): setup and implemented product scope.
- [AGENTS.md](../../AGENTS.md): mandatory engineering constraints and approval gates.
- [Frontend conventions](../frontend-conventions.md): FSD import/public-API rules, component reuse, styling, localization, accessibility and fixture invariants.
- [Git workflow](../git-workflow.md): branches, commits, Pull Requests and releases.
- **This map:** functional decomposition, approved decisions, boundary rationale, candidates and unresolved decisions. Source remains authoritative for actual APIs and runtime behavior.

When approved work changes a functional boundary or resolves an open decision, update its status and supporting source/reference here.

See the [verified Paper inventory and product reconciliation](paper-product-reconciliation.md) for current artboard evidence, backend contract gaps and the staged advisor proposal.

## 1. Current frontend baseline — Implemented

| Area | Verified implementation | Evidence |
| --- | --- | --- |
| Screens and routing | Operations is one page with Active Incidents and Needs Validation read projections, selected by `/operations?queue=active` or `?queue=validation`. Missing/invalid queue values canonicalize to Active. History has two read views selected by `/history?view=incidents` or `?view=insights`; bare `/history` renders Incidents and an invalid `view` value redirects to `?view=incidents`. `/` and the two legacy queue paths redirect; unmatched paths render Not Found. | [Route table](../../src/app/App.tsx), [Operations page](../../src/pages/operations/ui/OperationsPage.tsx), [History page](../../src/pages/history/ui/HistoryPage.tsx), [navigation public API](../../src/shared/config/index.ts), [navigation registry](../../src/shared/config/navigation.ts) |
| Page composition | `OperationsPage` composes `AppLayout`, `AppSidebar`, `OperationsHeader`, `OperationsTabs`, `OperationsSummary`, `IncidentFilters`, and the selected queue table. `HistoryPage` composes `AppLayout`, `AppSidebar`, `HistoryHeader`, `HistoryTabs`, and either the shared `IncidentFilters` (assignment scope and second sort row hidden) with `history-incidents-table`, or the page-local `HistoryInsightsFilters` with `history-insights`. The layout/sidebar remain outside each screen's content switch. | [Operations page](../../src/pages/operations/ui/OperationsPage.tsx), [History page](../../src/pages/history/ui/HistoryPage.tsx) |
| Shell boundaries | Generic slotted `AppLayout` lives in `shared/ui/app-layout`; navigation and the profile menu live in `widgets/app-sidebar`. There is no `application-shell` slice. `RequireSession` (app layer) guards every product route and redirects to `/login` with a sanitized `return_to`; `entities/session` holds the GitHub-login session and the profile menu shows its `login` and Sign out. | [Layout public API](../../src/shared/ui/app-layout/index.ts), [layout](../../src/shared/ui/app-layout/AppLayout.tsx), [sidebar public API](../../src/widgets/app-sidebar/index.ts), [sidebar](../../src/widgets/app-sidebar/ui/AppSidebar.tsx) |
| Layers and domain | Incident read views use Operations/History pages, smaller Operations/history/insights/sidebar widgets, and `entities/incident`. Pipelines adds inventory/Detail/onboarding pages and `entities/monitored-pipeline`. There is no `features/` layer or separate diagnosis, GitHub-resource or organization entity slice. | [Pages](../../src/pages), [widgets](../../src/widgets), [entities](../../src/entities), [incident public API](../../src/entities/incident/index.ts) |
| Data and summaries | Local incidents are parsed with Zod at module load. Selectors derive queues, History membership, tab counts, summary metrics and the Insights aggregations; pending durations use the fixed `INCIDENT_SNAPSHOT_AT`, not a live feed. Standard product lists use no remote data. The dev-only Workspace replay uses scoped P3 reads. | [Fixtures](../../src/entities/incident/model/incidents.ts), [selectors](../../src/entities/incident/model/selectors.ts), [insights selectors](../../src/entities/incident/model/insights.ts), [tabs](../../src/widgets/operations-tabs/ui/OperationsTabs.tsx), [summary](../../src/widgets/operations-summary/ui/OperationsSummary.tsx) |
| Presentation versus behavior | Queue tabs, History view tabs and sidebar destinations navigate. Incident search, Mine/Unassigned/All and filters do not change results; `All` stays selected. Active/Needs Validation ordering captions have no sorting logic; History has a fixed newest-resolution-first sort, not an interactive sort. Incident ID links open the read-only Workspace. Insights controls are static text and do not recompute aggregations. “Assign to me” is presentation, not an assignment command. Pipelines is a working sidebar destination; its local inventory behavior does not define incident-query behavior. | [Filters](../../src/widgets/incident-filters/ui/IncidentFilters.tsx), [active table](../../src/widgets/incidents-table/ui/IncidentsTable.tsx), [validation table](../../src/widgets/needs-validation-table/ui/NeedsValidationTable.tsx), [history table](../../src/widgets/history-incidents-table/ui/HistoryIncidentsTable.tsx), [insights filters](../../src/pages/history/ui/HistoryInsightsFilters.tsx), [insights widget](../../src/widgets/history-insights/ui/HistoryInsights.tsx), [tabs](../../src/widgets/operations-tabs/ui/OperationsTabs.tsx), [sidebar](../../src/widgets/app-sidebar/ui/AppSidebar.tsx), [route table](../../src/app/App.tsx) |
| Formatting ownership | `shared/i18n` exports `useFormatters` for locale-aware timestamps, numbers and durations. `shared/lib` exports `durationMs` for arithmetic on structured timestamps, not locale formatting. | [i18n public API](../../src/shared/i18n/index.ts), [formatters](../../src/shared/i18n/lib/useFormatters.ts), [lib public API](../../src/shared/lib/index.ts), [time utility](../../src/shared/lib/time.ts) |

### Current incident contract — Implemented

The [vocabulary](../../src/entities/incident/model/types.ts) and [Zod schemas](../../src/entities/incident/model/schema.ts) define the current fixture contract; the [incident public API](../../src/entities/incident/index.ts) exposes inferred types, schemas, selectors and domain UI.

| Concern | Current contract |
| --- | --- |
| Identity | `id` matches `INC-<digits>`; the demo collection enforces uniqueness and supports ID lookup. Durable identity scope and product lookup are separate contracts. |
| Shared fields | `id`, repository/workflow display strings, severity, stage, diagnosis text, optional diagnosis note, and nullable incident assignee. These are not stable GitHub resource models. |
| Unresolved branch | `status` is `Open`, `In remediation` or `Verification`; `validationStatus` must be `NOT_APPLICABLE`; nonnegative integer `elapsedMinutes` is required. Strict objects reject resolution-only fields. |
| Resolved branch | `status` is `Resolved`; ISO timestamp `resolvedAt` is required; `validationStatus` is `PENDING`, `CONFIRMED` or `REJECTED`. Optional nonnegative integer `diagnosisDurationSeconds` and `resolutionDurationSeconds` supply History's demo durations. Strict objects reject `elapsedMinutes`. |
| Queue membership | Active selects operationally unresolved incidents. Needs Validation selects resolved incidents with `PENDING` diagnosis validation; it is not the validation operation. History selects resolved incidents with `CONFIRMED` or `REJECTED` validation, newest `resolvedAt` first; that membership rule is provisional demo presentation. |
| Diagnosis | Diagnosis and confidence/context notes are strings, not structured hypothesis, evidence, recommendation, confidence or analysis-state contracts. The analyzing summary recognizes the fixture text `Analyzing evidence…`; this is not an analysis-state enum. |

These schemas describe legal record shapes, not approved lifecycle commands, validation permissions or backend transition rules. Resolution does not imply confirmation of a diagnosis. The current unresolved `NOT_APPLICABLE` rule must not silently become a universal future validation policy.

The current snapshot has 21 incidents: six unresolved, seven resolved/pending and eight resolved/terminal-validation (five confirmed, three rejected). These are fixture counts, not production statistics or hardcoded UI requirements. D03 changes the target History population, not these fixtures or selectors.

## 2. Confirmed Constraints

The following constrain the functional map without asserting that remote services exist today:

| Boundary | Implication |
| --- | --- |
| GitHub Actions is the operational source | Intended integration reads repositories, workflows, runs and events through authorized access. Today, their visible names are fixture data. |
| GitHub access is read-only | Pipesor does not modify GitHub workflows, code, secrets or permissions. Workflow onboarding configures monitoring in Pipesor, not a new GitHub workflow. |
| Remediation is human-controlled | A future `Start remediation` operation records human intervention and may facilitate GitHub navigation; it does not execute an automated fix. Resolution is also a human operational decision. |
| Diagnosis, evidence and recommendation stay distinct | An AIOps inference is not an observed fact. Evidence supports the hypothesis; recommendations guide human work rather than execute it. |
| Resolution and diagnosis validation are independent | A resolved incident can still await review of its diagnosis. Run success neither automatically resolves the incident nor confirms its hypothesis; rejecting a diagnosis does not reopen the incident. |
| Original diagnosis is preserved | Human review must not overwrite the original AIOps hypothesis, evidence or confidence with the stated actual cause or notes. Review subject/version, attribution and revision contracts remain open. |
| Criticality and severity are independent | Pipeline criticality belongs to workflow policy; incident severity belongs to an individual incident. A mapping rule is not yet approved. |
| Ownership and assignment are independent | Workflow owners need not be the assignees of incidents or the eventual diagnosis reviewers. |
| Privacy precedes display | Future logs/events, excerpts and linked evidence require authorized visibility, minimization, masking and traceable provenance before exposure. Hiding content visually is not access control or redaction; no such ingestion pipeline is implemented here. |
| Existing FSD boundaries are preserved | Use the authoritative [frontend conventions](../frontend-conventions.md#1-feature-sliced-design). Do not create slices or routes merely to match Paper frames or the candidate names below. |

## 3. Conceptual domain map — Proposed — Not Approved

This preserves the original functional vocabulary. Apart from the existing fixture models, these are conceptual responsibilities, not implemented models, approved backend contracts or instructions to create entity slices. Agreed Incident Management direction and approved Pipelines behavior in sections 4.8–4.11 do not approve these physical boundaries.

| Concept | Responsibility | Candidate consumers |
| --- | --- | --- |
| Repository | Identity of a repository accessible through GitHub. | Pipelines, Pipeline Detail, Add Workflow, Operations, Workspace |
| GitHub Workflow | Technical identity of an existing workflow, including file and metadata. | Pipelines, Add Workflow, Pipeline Detail, Workspace |
| Monitored Pipeline | An existing workflow enrolled in Pipesor with operational configuration. | Pipelines, Pipeline Detail, Add Workflow, Operations |
| Pipeline Policy | Criticality, monitoring status and operational environment classification. | Pipelines, Pipeline Detail, Add Workflow |
| User / Team | People and teams associated with workflow ownership and incident responsibility. | Pipelines, Operations, Workspace |
| Pipeline Ownership / Access | Ownership relationships and illustrative capabilities; neither establishes effective authorization. | Pipeline Detail, Add Workflow |
| Incident | Identity, severity, stage, operational state, assignment and incident timing. | Operations, Workspace, History |
| Workflow Run | Original failed execution and subsequent runs potentially associated with verification. | Workspace |
| Diagnosis | Probable hypothesis, explanation, confidence and analysis state. | Operations, Workspace, History |
| Evidence | Observed logs, events or signals supporting the diagnosis. | Workspace |
| Recommendation | Suggested action guiding human intervention. | Workspace |
| Incident Timeline / Activity | Chronological detection, analysis, intervention, verification and resolution events. | Workspace |
| Diagnosis Validation | Human evaluation result, recorded actual cause and audit information. | Workspace, Needs Validation, History, Insights |
| Pipeline Configuration History | Future configuration-change history; full contracts and durable audit guarantees remain unresolved. | Pipeline Detail |

Two conceptual groupings remain useful: **Monitored Pipeline** can group the GitHub workflow reference, operational policy and responsibility relationships; **Incident** can group the failed-run reference, operational state, diagnosis, related evidence, activity and validation. Their physical boundaries depend on model autonomy, query needs and demonstrated reuse.

Insights can initially be analytical projections of incidents and validations. A persistent `Insight` entity or one table per KPI is not implied.

## 4. Functional flows

### 4.1. Operations — Active Incidents

**Implemented:** a read queue of unresolved incidents, with severity, incident/workflow identity, stage, diagnosis summary, operational status, assignee and elapsed time; selector-derived summaries and queue navigation. See the [active table](../../src/widgets/incidents-table/ui/IncidentsTable.tsx) and [summary](../../src/widgets/operations-summary/ui/OperationsSummary.tsx).

**Implemented (D01):** incident IDs link to the single Workspace. The finalized local query contract below (D04) remains unimplemented. Current Active and Needs Validation selectors retain fixture order despite their ordering captions; the target guarantees are not implemented.

The visible dimensions differ by view; this is not a universal filter schema:

| Read view | Current visible search/scopes and filter dimensions — nonfunctional |
| --- | --- |
| Active Incidents | Search; Mine/Unassigned/All; Severity, Repository, Stage, Status, Assignee. |
| Needs Validation | Search; Mine/Unassigned/All; Severity, Repository, Stage, Resolved date, Assignee. |
| History — Incidents | Search; no assignment scopes; Date range, Repository, Stage, Validation, Assignee. |
| History — Insights | No search or assignment scopes; Date range, Repository, Pipeline, Stage, Severity. |

#### D04. Finalized local query contract — Approved — Partially implemented (Active, Needs Validation, History — Incidents)

**Implementation status (2026-11-24).** `widgets/incident-queue` (`IncidentFilterBar` on the shared `FilterBar`, `useIncidentFilterParams`, `useIncidentQueue({ filters })`) and `entities/incident/model/filters.ts`:

- **History — Incidents** offers repository, severity, stage and **Validation** (`validation=pending|confirmed|corrected|rejected|none` in the URL, Pipeline `diagnosis=` with `ABSENT` for "No diagnosis"). Insights stays on the whole loaded population (no criteria). The list asks Pipeline for `sort=resolvedAt` (newest resolution first across pages, pipeline-service #30); a Pipeline without it ignores the parameter and loaded pages are sorted here, as before.
- **Resolved period** (History — Incidents and Needs Validation, the views of resolved incidents): a single-choice facet with rolling windows — last 24 hours, 7, 30 or 90 days (`resolved=24h|7d|30d|90d`) — sent as Pipeline `resolvedFrom` (pipeline-service #30), measured from the moment the queue is read so every page sends the same instant (page tokens are bound to it). D04's free "Date range" is reduced to these presets (no calendar control) for the MVP. Which criteria each view accepts is declared once in `FILTER_SCOPES`.

- **Where it filters.** Criteria go to Pipeline (`GET /api/v1/incidents` with `q`, `repositoryId`, `severity`, `stage`, `status`, and `diagnosis=PENDING` for Needs Validation; ADR-027); when the response echoes `appliedFilters`, the service filtered before paging and `total` is exact. Until then the view reads the whole queue (pages of 100, cap 500) once, filters in the browser, states "N of M" and says when the cap was reached. Diagnoses are read only for shown rows.
- **Row facts and figures (ADR-027).** Queue rows carry repository, workflow and diagnosis summary, so no per-row reads remain when Pipeline provides them. Tab counts and figures use `GET /api/v1/incidents/summary` (exact, no "+"); when it is unavailable they fall back to the loaded pages, as before.
- **Matches D04:** reactive search with URL REPLACE; NFKC/whitespace/lowercase normalization and AND between words; AND across facets; tab counts and summaries stay whole-queue totals; results report N of T; valid zero results keep the criteria and offer Clear; Back from the Workspace restores the criteria (router state, recognized criteria only).
- **Approved deviations (owner, 2026-11-23):** facets are multi-select (OR within a facet, AND across); search covers the incident number (`INC-123`/`123`, exact), repository and workflow — not diagnosis text (diagnoses load per shown row and the service does not filter by it) and not assignee (no contract); repository options come from the pipeline inventory (stable ids, not base-view membership); unknown facet tokens in a URL are dropped rather than marking the query invalid.
- **Not implemented:** a custom resolved-date range (`resolvedTo`, calendar control), assignment scopes, workflow facet, criteria on Insights.

This contract settles local read exploration, not API contracts, domain commands or new architectural boundaries. The current incident controls and selectors remain unchanged. Views share matching/composition rules, not identical facets.

| View | Base population | Search and applicable criteria | Fixed ordering |
| --- | --- | --- | --- |
| Active | Operationally unresolved | Common search; severity, repository, stage, status, assignment | Severity Critical → High → Medium → Low, then elapsed descending |
| Needs Validation | Resolved + `PENDING` | Common search; severity, repository, stage, resolved date, assignment | `resolvedAt` ascending |
| History — Incidents | All resolved, including `PENDING` (D03 target) | Common search; resolved date, repository, stage, validation, assignment; workflow and severity also accepted for D05 | `resolvedAt` descending |
| History — Insights | All resolved within the required analysis period | No search; resolved date, repository, repository/workflow pair, stage, severity | Recurring groups: count descending, repository then workflow ordinal ascending, then canonical stage order |

Incident-list ties use incident ID ordinal ascending, independent of locale. No interactive sort, `sort` query key or pagination contract is introduced.

**Search:** match `id`, `repository`, `workflow`, `diagnosis`, optional `diagnosisNote` and non-null `assignee`. For matching, apply NFKC, trim/collapse whitespace and locale-independent lowercase to query/text. Split query into whitespace tokens: AND between tokens, each matching a literal substring in any searchable field. Blank normalized search removes the restriction. No fuzzy search, regex, quoted grammar, accent folding, translated labels or inferred confidence/analysis predicates. Search is reactive without Enter and uses URL **REPLACE**, matching the observable [Pipelines search experience](../../src/pages/pipelines/ui/PipelinesPage.tsx), not requiring its implementation structure. Preserve editable whitespace, caret and composition; matching normalization must not rewrite an in-progress input or exact facet identities.

**Facets:** one value per dimension, AND across all facets and search. Enums use canonical source values; repository/workflow/named-assignee values use exact decoded source strings, without search normalization. Only omission means unrestricted; explicitly empty/all-whitespace structured facets are invalid. Well-formed unknown names or repository/workflow pairs yield valid zero results, not ignored restrictions. Workflow requires repository; changing repository clears workflow. Options derive from base-view membership rather than progressively narrowed results; workflow choices depend on repository.

**One assignment criterion:** no `assignee` key means All; `assignee=unassigned` means null; `assignee=name:<exact display name>` means that named incident assignee. Scope buttons and the Assignee control are synchronized representations, never independent filters: selecting one replaces the previous criterion. All is selected only with no criterion, Unassigned only for null, and a named selection is reflected truthfully rather than leaving All selected. `Mine` remains unavailable until authenticated subject and responsibility contracts exist; Mine URLs are invalid, never silently All. The decorative profile, workflow owner and reviewer are not substitutes for incident identity/responsibility.

**Counts and empty states:** Operations tab counts and summaries remain whole, unfiltered queue totals T; list results report N of T without changing membership. History T is its all-resolved base population. Distinguish an empty base, valid zero results (retain criteria and offer Reset), and invalid query (do not display result/metric counts as though evaluation succeeded). Fixture counts are implementation assertions below, not UI literals.

#### D04. URL, recovery and demo time basis — Approved — Not Implemented

Keep `queue=active|validation` and `view=incidents|insights`. Generated links name the selector explicitly; bare `/history` remains compatible with Incidents. Criteria keys are `q`, `repository`, `workflow`, `stage`, `severity`, `status`, `validation`, `assignee`, `from`, `to`, restricted by the matrix. Active `status` accepts only `Open`, `In remediation`, `Verification`; History `validation` accepts only `PENDING`, `CONFIRMED`, `REJECTED` (not `NOT_APPLICABLE`). No separate assignment `scope` key.

- Reject duplicate keys, including selectors, **before** selector fallback. Missing/single-invalid queue or view retains its existing default destination and canonical REPLACE behavior; bare History remains valid. Disclose a single-invalid selector and preserve other criteria. If those criteria are incompatible with the default destination, show query error rather than discarding them. Current redirects do not yet preserve this target query behavior.
- Unsupported keys/view-inapplicable criteria, invalid enum subsets/dates, missing repository for workflow, explicit empty structured facets and unavailable Mine produce a recoverable invalid-query state. Identify and retain offending criteria for correction; offer explicit removal or Reset to safe defaults in the selected/default view. Never silently broaden results. Duplicate-selector recovery requires explicit removal/reselection, not implicit acceptance of the first value.
- Reactive search and harmless canonical representation changes REPLACE. Atomic facet/date changes, Reset, tabs and D05 drill-down PUSH one entry. Back/forward/reload reconstruct URL criteria; search keystrokes are not separate Back stops. Ordinary tabs/sidebar open destination defaults; D05 explicitly transfers context. Reset clears all criteria, including inherited workflow/severity, retaining queue/view and fixed ordering; Insights restores explicit default dates.
- Eventual Workspace return carries only allowlisted originating view and recognized criteria, never an arbitrary return URL. Known origin is independent of incident status. This settles list query representation, not D02's proposed no-origin fallback, Workspace history/scroll/focus mechanics.

`from`/`to` are strictly valid `YYYY-MM-DD` inclusive **UTC calendar dates**, applied to `resolvedAt` as `[from 00:00Z, day-after-to 00:00Z)`, intersected with observations through `INCIDENT_SNAPSHOT_AT` (`2026-09-30T10:30:00Z`). No wall-clock/local-timezone or detection-time surrogate. Lists allow either boundary independently; omission is unbounded. Active has no date predicate. Insights requires both boundaries; its default is the 30 UTC dates September 1–30, with a partial last day, and canonical URLs retain explicit dates even for that default. Invalid/reversed dates or dates after the snapshot's UTC day are invalid demo queries. Present the resolution-time cohort basis, UTC period and as-of snapshot explicitly; production time semantics remain separate.

```text
/operations?queue=active&q=PAYMENTS%20secret&severity=Critical
/operations?queue=validation&assignee=unassigned
/history?view=incidents&validation=PENDING&from=2026-09-29&to=2026-09-30
/history?view=insights&severity=High&from=2026-09-01&to=2026-09-30
/history?view=incidents&repository=acme%2Fpayments-api&workflow=Deploy%20production&stage=Deployment&severity=High&from=2026-09-01&to=2026-09-30
```

Open, in-remediation and verification incidents are variations of one queue, as are analyzing, ready and inconclusive diagnosis displays. The table is a read composition, not a collection of lifecycle features. No direct domain operation is authorized by its visual affordances.

### 4.2. Operations — Needs Validation

**Implemented:** a second incident projection: resolved incidents whose diagnosis validation is pending. It displays the proposed diagnosis, original severity, assignee, resolution timestamp and pending age. Its summary differs from Active; a coded empty state exists in the [validation table](../../src/widgets/needs-validation-table/ui/NeedsValidationTable.tsx).

**Implemented (D01/D02 for the demo):** the pending incident link opens the Workspace and returns to this queue. The finalized query and oldest-resolution-first ordering contract in section 4.1 remains unimplemented. Under D03, these incidents also belong in History; Needs Validation is a work queue, not an exclusive historical partition. Confirmation/rejection remains a separate backend-dependent operation, not a `needs-validation` feature or an action authorized by queue membership. Responsibility and review contracts remain open.

### 4.3. Incident Workspace — Diagnosis Ready

**Implemented for the demo (D01/D06):** one read-only Workspace at `/incidents/:incidentId`, independent of entry view, renders unresolved, resolved/pending and resolved/terminal presentations from data. Operations/History remain query-selected read projections; selecting an incident identifies a resource, not another queue or a separate page for each Paper state. Unknown identifiers display an explicit unavailable state. The local fixture ID and the dev-only replay UUID are separate modes. Durable product lookup and authorization remain open.

The read experience separates **observed evidence**, **AIOps inference**, **operational incident state** and **human validation**. Paper sections include **AIOps Inference**, **Observed Evidence**, **Recommended Action**, **Incident Details**, **Ownership**, **Timing** and **Timeline**. Unresolved incidents show current operational/diagnosis state and evidence, hypothesis and recommendation only when supported by approved data. Analyzing/inconclusive and partial/absent-evidence presentations are not fully specified.

Required read-model concerns are not populated existing fields: diagnosis identity/version, structured confidence/evidence/recommendation, original and verification run references, trustworthy timestamps/event chronology, intervention/resolution context, review outcome/provenance and authorized evidence visibility. Do not fabricate reviewer names, actors, actual causes, exact timestamps or run/commit/PR URLs. Display durations are not event timestamps. Any synthetic records must be internally consistent; the conflicting elapsed times in Paper's Open and Verification snapshots of `INC-1039` are not a chronological trace.

`View context`, `View full event timeline`, snippet expansion and genuine approved GitHub references are reading/navigation affordances, not domain commands. The existing incident fixtures cannot supply their full content; timeline destination and timestamp/context interaction details remain unresolved. No assigned identity or command permission follows from the mockup's Ownership section or `Change` control.

**Implemented for existing list context (D02):** Workspace return follows the origin: Active → Active, Needs Validation → Needs Validation, History incident results → those results. Retain recognized search/filter criteria and relevant analytical context; accept no arbitrary/untrusted return URL or open redirect through location state. Incident status must not override a known origin. The allowlisted origin survives reload. Missing or invalid origin returns to Active Incidents for the demo. Criteria, scroll restoration and product fallback remain pending.

**Proposed — Not Approved fallback:** without origin, unresolved → Active; resolved/pending → Needs Validation; resolved/terminal → History — Incidents. This awaits explicit acceptance and grants no authorization. Exact return-query sanitization, retained ordering/scroll/pagination, browser-history/replacement mechanics and route-entry focus remain [open](#9-open-decisions).

### 4.4. Incident Workspace — Verification

**Approved — Not Implemented (D06):** the same read-only Workspace can present supported intervention, verification-run/result and timing context. Original and verification runs need genuine references and coherent associations; existing fixtures do not contain them. Opening an approved run or pull-request URL is external read navigation, not a GitHub mutation. Missing durations or timestamps must not be inferred from inconsistent Paper snapshots.

**Confirmed Constraints (D07):** a successful run is observed evidence, not automatic resolution or diagnosis confirmation. `Start remediation` records human work outside Pipesor; `Resolve incident` records human closure. Neither is implemented or authorized by the read-only target. Run correlation, verification initiation, remediation-completion recording, resolution preconditions and failed-verification exceptions remain [open decisions](#9-open-decisions); no `verification-success`, `workflow-recovery` or `run-succeeded` feature follows from an observed result.

### 4.5. Incident Workspace — Resolved / Diagnosis Validation

**Implemented in the demo (D06):** resolved/pending and resolved/terminal fixtures share the read-only Workspace. Preserve the original diagnosis/evidence and show only supported intervention, verification, resolution and pending/recorded review context. A terminal outcome is `CONFIRMED` or `REJECTED`; initial historical presentation is read-only, while complete analyzing/inconclusive and historical-review details still lack specification.

**Confirmed Constraints (D07):** assignment, start remediation, resolution and diagnosis confirmation/rejection are distinct human operations. Incident assignment is neither workflow ownership nor reviewer eligibility. A rejection's actual cause/notes must not overwrite the original AIOps hypothesis, evidence or confidence; confidence belongs to the diagnosis, not the reviewer verdict. Rejection does not undo operational resolution.

**Open domain/backend contract:** persistent commands remain deferred until authenticated identity, eligibility/authorization, transition/precondition, concurrent-update, preservation and audit/revision contracts are established. The review subject/diagnosis version and required actual-cause/comment fields are unresolved. Paper's hidden rejection form suggests required cause and optional notes, not complete submission rules. Opening/editing/canceling a form is local UI behavior; recording its decision is not. The `validate-diagnosis` slice remains a candidate, not an approved architecture or permission model.

### 4.6. History — Incidents — Implemented

`/history?view=incidents` (and bare `/history`) is the canonical History — Incidents view. Incidents and Insights share the History page, header and view switcher; the selected view comes from the `view` query parameter. This view composes the shared layout, sidebar and filters (assignment scope and second sort row hidden) with the dedicated `history-incidents-table` widget.

**Implemented:** a read-only, fixture-backed projection of resolved incidents whose diagnosis validation has reached a terminal outcome (`CONFIRMED` or `REJECTED`), ordered by `resolvedAt` newest first. It presents incident/workflow identity, stage, diagnosis, validation outcome, assignee, diagnosis duration, resolution duration and resolved date. Durations are read from the optional structured seconds fields and formatted through `shared/i18n`; the resolved date is formatted from `resolvedAt`. A coded empty state covers an empty queue.

**Provisional demo presentation, not an approved backend contract:**

- The current terminal-validation population has eight records; seven resolved/pending incidents appear only in Needs Validation. Newest-first ordering is implemented, not an interactive sort contract.
- Diagnosis-time and resolution-time/MTTR semantics are not defined beyond the frame labels; no timestamps are synthesized from display durations.
- The incident ID links to the same Workspace in historical context. The fixture omits resolution actor, verification result and audit record.

**Approved — Not Implemented (D03):** History contains **all operationally resolved incidents**, whether validation is `PENDING`, `CONFIRMED` or `REJECTED`. A resolved/pending incident may appear in both History and Needs Validation. This supersedes the earlier provisional target, not current selectors: the unrestricted fixture population would be **15 resolved incidents**, before any separately defined date/filter scope. This is a design check, not a changed count or production result. History list membership is separate from each Insights denominator.

**Implemented (D01/D02 demo):** incident links open the same read-only Workspace with historical return. D04 query criteria remain pending. **Presentation boundaries:** search and all five controls (Date range, Repository, Stage, Validation, Assignee) currently do not query; “Sorted by Resolved ↓” describes the fixed selector sort. No lifecycle/review command is exposed. Operations and History share the incident model, filters, formatters and validation-status UI while retaining separate tables; `view-history` and `search-history` are not features.

See [HistoryPage](../../src/pages/history/ui/HistoryPage.tsx), [table](../../src/widgets/history-incidents-table/ui/HistoryIncidentsTable.tsx), [selector](../../src/entities/incident/model/selectors.ts).

### 4.7. History — Insights — Implemented

`/history?view=insights` is the History — Insights view. It shares the History page shell, header and view switcher, and composes the page-local `HistoryInsightsFilters` with the `history-insights` widget. All values are derived through `entities/incident` selectors from the same eight terminal-validation incidents as History — Incidents; no synthetic incidents, analytics backend, chart dependency or separate feature slice is added.

**Implemented:** a fixed-window KPI strip (mean diagnosis time, mean time to resolution/MTTR, diagnosis-confirmation rate and resolved-incident count), a weekly mean diagnosis-time trend with explicit no-data periods, stage and diagnosis-outcome distributions, and the top recurring pipeline/stage contexts. Empty populations and missing periods render explicit no-data states; the trend never interpolates across a gap. The chart's visual plot is hidden from assistive technology and its weekly values are also exposed as text.

**Provisional demo definitions, not an approved analytical contract:**

- The window is `2026-09-01T00:00:00.000Z` through the demo snapshot `2026-09-30T10:30:00.000Z`; weekly buckets are anchored at the window start.
- Membership is the terminal-validation population used by current History — Incidents. Mean diagnosis and resolution times use available optional structured seconds fields. Confirmation is `confirmed / (confirmed + rejected)`: the fixed window contains five confirmed and three rejected incidents, hence 62.5%; it is not model accuracy. These are fixture values, not measured product/thesis outcomes; Paper's illustrative 43 incidents and 84% confirmation are not measurements either.
- Recurring groups count `repository + workflow + stage` combinations; they are not a root-cause taxonomy. The view shows the top three groups and states the total when groups are omitted.
- Date range, Repository, Pipeline, Stage and Severity are static presentation, not interactive filters; they do not recompute the view. Insights has no search, assignment scope or sort control. Exact criteria and period contracts remain open.
- No resolution actor, verification result, audit record or incident drill-down is implemented. Recurring-group rows, chevrons and the filtering hint are presentation only.

**Approved — Not Implemented (D03):** analytical populations are explicit per indicator, not one implicit denominator:

| Indicator | Target population / qualification within the stated period and applicable filters |
| --- | --- |
| Resolved count and breakdowns | All operationally resolved incidents. |
| Recurring repository/workflow/stage contexts | Contributing resolved incidents within the selected analysis scope. |
| Pending-validation count | Resolved incidents whose diagnosis validation is `PENDING`. This population rule does not add a new visible KPI. |
| Diagnosis confirmation rate | `confirmed / (confirmed + rejected)`; pending outcomes are excluded from this denominator. Never divide by all 15 resolved fixtures. |
| Resolution-time indicators | Only records with sufficient trustworthy timestamps; calculation and exclusions must be defined before claiming MTTR. Existing duration-only fixture means remain provisional display definitions. |

This target does not change current selectors or displayed values. Exact periods, metric definitions and exclusions remain open within these population boundaries.

**Approved — Not Implemented (D05):** selecting a recurring context opens History — Incidents with `repository + workflow + stage + analysis period`, including any additional analysis-scope exclusions. Results must reproduce the same contributing incident set, not a broader or narrower implicit population. Current groups use repository/workflow **names**, not stable monitored-pipeline identity or proven root cause. Stable grouping keys and URL/matching representation remain open. Only recurring-context drill-down is agreed; clickable chart bars, points or KPIs are not implied.

See [HistoryPage](../../src/pages/history/ui/HistoryPage.tsx), [Insights filters](../../src/pages/history/ui/HistoryInsightsFilters.tsx), [widget](../../src/widgets/history-insights/ui/HistoryInsights.tsx), [insights selectors](../../src/entities/incident/model/insights.ts).

### 4.8. Pipelines — Monitored Workflows — Implemented

**Status qualification for sections 4.8–4.11:** inventory/local queries, read-only Detail and local onboarding draft are implemented. Workflow registration and configuration saves are deferred until local API integration; their agreed functional boundaries do not authorize a local mutation substitute or define integration contracts. This supersedes the earlier shared mutable demonstration-state decision, including navigation-surviving changes that reset on reload.

`/pipelines` reads the validated local monitored-workflow fixtures, including repository, operational environment, criticality, responsible team and Active/Paused monitoring status. It navigates to read-only Pipeline Detail or Add Monitored Workflow; opening Add does not register anything or change the inventory.

Search is case-insensitive across pipeline label, workflow name and repository. Search and criticality/team/monitoring filters combine conjunctively over the local inventory; URL criteria, reset and return from Detail/onboarding are implemented. Only recognized inventory criteria are retained on return, not an arbitrary URL. No additional sorting or pagination is approved. See [inventory page](../../src/pages/pipelines/ui/PipelinesPage.tsx) and [query/return helpers](../../src/pages/pipelines/model/inventory.ts).

### 4.9. Pipeline Detail / Configuration

**Implemented:** `/pipelines/:pipelineId` displays read-only GitHub metadata separately from Pipesor-managed **Operational Policy** and **Ownership**. There are no configuration editors, drafts or Save/Cancel actions. The latest-update section explicitly reports absent configuration-update data; seeded examples are not audit events and no local-session changes are recorded. Unknown identities render Not Found. See [Detail page](../../src/pages/pipeline-detail/ui/PipelineDetailPage.tsx) and [route lookup](../../src/app/App.tsx).

**Approved — Not Implemented; deferred until local API integration:** Operational Policy and Ownership have independent drafts and explicit Save/Cancel actions. Once supported by approved integration contracts, saving one must not change the other section's draft or committed values; inventory reflects committed values only. These are future operation boundaries, not approval for shared local demo mutations.

Operational Environment belongs to Pipesor operational context. It may appear in the workflow overview, but must not be represented as editable GitHub metadata. Access information is illustrative, not effective authorization; ownership changes do not grant GitHub permissions.

A future latest-update summary must use supplied change data, without fabricating an authenticated actor or implying durable audit guarantees. Full configuration-history behavior, attribution and navigation remain unresolved and unimplemented.

### 4.10. Add Monitored Workflow

**Implemented:** `/pipelines/new` prepares a local onboarding draft in a continuous form, not a wizard. Repository determines available workflows in a clearly identified synthetic catalog; changing repository clears the selected workflow and its derived metadata. Form-input validation and a review derived from the current draft work locally; they do not register a record or define an API payload. See [draft form](../../src/pages/add-monitored-workflow/ui/AddMonitoredWorkflowPage.tsx) and [draft helpers](../../src/pages/add-monitored-workflow/model/draft.ts).

**Required draft selections:** Repository, Workflow, Criticality, Monitoring and Responsible team. **Optional:** Operational Environment and Pipeline Owners. Teams and owners are demonstration choices, not authenticated organization identities. Draft completeness does not establish uniqueness or registration success.

Cancel and Back discard the unsaved onboarding draft and return to inventory with recognized originating criteria when available. Reopening Add starts with a clean form.

**Approved — Not Implemented; deferred until local API integration:** registration enrolls an existing GitHub Actions workflow in Pipesor, not in GitHub. The Add submission is currently disabled and even a complete draft creates nothing. Future successful, validated registration is intended to navigate to the newly registered Pipeline Detail; integration, failure and persistence contracts are not defined here. Repository plus canonical workflow path remains unique across registered records, whether Active or Paused; local draft validation is not a registration-time duplicate check.

### 4.11. Shared Pipelines decisions

These decisions consolidate the explicitly approved subset of the [functional decision register](../temp/pipelines-functional-decision-register.md), with the updated local-API deferral below superseding its shared mutable demonstration-state recommendation. Earlier recommendations are historical, not a competing authority or implicit approval.

| Concern | Preserved boundary across Inventory → Detail → Add |
| --- | --- |
| Identity | Each monitored pipeline has a stable, immutable Pipesor identity independent of display names. Unknown identities must not resolve to unrelated records. Route identity is distinct from repository/workflow-path uniqueness. |
| Operational Environment | Optional Pipesor-managed classification, not a GitHub Environment or branch filter. |
| Read views, draft and deferred commands | Inventory and Detail read validated fixtures; onboarding maintains only an unsaved local form draft. Registration and configuration saves are deferred until local API integration. No shared mutable demonstration collection or navigation-surviving committed local changes are approved. |
| Monitoring scope | Active/Paused controls AIOps monitoring, not GitHub execution state. Monitoring covers authorized workflow runs across branches; default branch is informational, not a monitoring restriction. |
| Domain distinctions | Pipeline criticality is not incident severity. Pipeline ownership is not incident assignment. |
| GitHub destinations | Integration stays read-only. Enable external links only for explicitly supplied, valid destinations; never fabricate URLs or imply a live connection for synthetic catalog data. |
| Responsive behavior | Preserve approved desktop layouts; adapt narrower widths with fluid surfaces, stacked fields, wrapping controls and keyboard-accessible table scrolling. |

Local API integration is the boundary for future registration and configuration saves, not a selected API or persistence design. Live GitHub integration, enterprise authorization, durable persistence, concurrent editing, effective RBAC and full configuration-history contracts remain [open decisions](#9-open-decisions); the implemented read views and onboarding draft do not depend on resolving them. These boundaries do not select API contracts, state management or FSD slices.

## 5. Interaction versus domain operation

**Confirmed Constraints:** classification follows the existing [FSD decision rule](../frontend-conventions.md#1-feature-sliced-design); interaction does not automatically establish a feature. Ownership below remains **Proposed — Not Approved**: D01–D07 and approved local Pipelines behavior in sections 4.8–4.11 do not select feature slices or authorize unresolved domain commands.

| Interaction or capability | Functional classification | Candidate ownership |
| --- | --- | --- |
| Switch queues, open a row, return to a list, open GitHub/PR | Navigation/context | Page/widget/router; no standalone feature |
| Mine/Unassigned/All, search/filter/sort, History/Insights queries | Data exploration | Owning page/widget and query utilities as justified |
| Expand context, inspect timestamp seconds | Presentation/extended reading | Owning composition |
| Select repository/workflow, edit fields before saving | Form/query state | Within onboarding/configuration |
| Register monitoring for a workflow | Domain operation | `onboard-monitored-workflow` candidate |
| Save policy or workflow ownership | Domain operation | `configure-monitored-pipeline` candidate |
| Assign/reassign incident | Domain operation, distinct from lifecycle advancement | `assign-incident` candidate |
| Record start of remediation or incident resolution | Separate commands within one operational process | `manage-incident-lifecycle` candidate |
| Record confirmation/rejection | Alternative outcomes of human review | `validate-diagnosis` candidate |

Local inventory search/filtering exists for Pipelines (section 4.8), without additional sorting or pagination. D04 establishes incident-query direction, not its exact semantics or implementation structure. **Proposed — Not Approved:** small preloaded incident collections may use local filtering; a real paginated queue may require server-side criteria for search/order/filtering. Neither is automatically a feature; no remote query contract is selected here.

## 6. Candidate FSD boundaries — Proposed — Not Approved

These candidates preserve the original rationale, not a scaffold to create now. Existing names/composition in [section 1](#1-current-frontend-baseline--implemented) remain the baseline. Agreed routes/read behavior below do not approve the candidate slice structure. Pages may consume widgets/entities/shared directly; no flow must traverse every layer or access entities only through features. Incident views need not adopt Pipelines' implementation structure.

### Entities

| Candidate slice | Possible responsibility | Current relationship |
| --- | --- | --- |
| `incident` | Incident identity, severity, lifecycle, stage, timing and domain UI | Exists with the narrower fixture contract documented above. |
| `diagnosis` | Structured hypothesis, confidence, evidence, recommendation and validation | Not separate today; diagnosis strings and validation outcome belong to the incident contract. |
| `monitored-pipeline` | Monitoring configuration, operational policy and compact workflow representation | Exists for the local Pipelines demonstration; it does not establish incident-to-workflow identity or operational contracts. |
| `github-resource` | Typed repository/workflow/run references | Not implemented; names alone do not establish identity contracts. |
| `organization` | User/team, ownership and capability references | Not implemented; no authorization model is approved. |

Do not automatically split evidence, recommendation, pipeline-stage, severity, timeline-event, criticality or policy into autonomous slices. Separation depends on independent identity/model/query responsibilities and concrete reuse, not conceptual noun counts.

### Features

The five candidate capabilities in section 5 could be consumed by onboarding, Pipeline Detail and the Workspace. Assignment remains conceptually separate because changing a responsible person does not advance lifecycle and could later be reused in Operations. Start/resolve can remain commands of one lifecycle capability. Confirm/reject can remain outcomes of one review capability; this does **not** establish shared permissions or identical validation rules. Access-capability administration is an additional unresolved candidate, not an implemented or approved sixth feature.

### Widgets

| Original candidate | Functional composition and reconciliation |
| --- | --- |
| `application-shell` | Sidebar/navigation/profile and page structure. Already served by generic `AppLayout` plus `AppSidebar`; no new wrapper, rename or authenticated-user claim is justified. |
| `operations-board` | Tabs, contextual summary, scopes/filters and queue table. Already composed by `OperationsPage` from smaller widgets; no consolidation is required. |
| `incident-workspace` | Header, diagnosis, evidence, recommendation, verification, validation and detail panel; one data-driven composition is preferable to three state-named workspaces. |
| `monitored-pipeline-list` | Inventory controls and monitored-workflow table. |
| `pipeline-configuration` | Identity, policy, ownership, illustrative access and latest-update summary; full history remains unresolved. |
| `incident-history` | Historical table and query controls. Implemented as the `history-incidents-table` widget composed with the shared `IncidentFilters`; the controls remain presentational. |
| `incident-insights` | Metrics, charts, distributions and recurring-context table. Implemented as the `history-insights` widget with page-local presentational filters and entity selectors; no feature slice or chart dependency. |

Inference, evidence and timeline sections can remain internal components or entity representations until reuse justifies promotion. Onboarding may compose its feature UI directly; an `add-workflow-form` widget is not obligatory.

### Pages and navigation

| Candidate page | URL and route status | Composition |
| --- | --- | --- |
| `operations` | `/operations?queue=active` / `?queue=validation` | Existing page and smaller widgets; **Implemented** as described in section 1. |
| `incident-detail` | `/incidents/:incidentId` — **Read-only demo implemented** (D01) | One initially read-only Workspace representing incident contexts from data; candidate slice boundaries remain unapproved. |
| `history` | `/history?view=incidents` / `?view=insights` | **Implemented** for both views: `HistoryPage` with shared filters and `history-incidents-table`, or page-local filters and `history-insights`. |
| `pipelines` | `/pipelines` — **Implemented** route | Read-only local inventory, queries and navigation in section 4.8. |
| `pipeline-detail` | `/pipelines/:pipelineId` — **Implemented** read route | Read-only Detail; configuration saves are deferred until local API integration (section 4.9). |
| `add-monitored-workflow` | `/pipelines/new` — **Implemented** draft route | Local onboarding draft; registration is deferred until local API integration (section 4.10). |

Operations, History and the three Pipelines routes are registered. The Incident Workspace is registered as a shared detail route. None of these URLs is a REST endpoint. History uses `?view=incidents|insights`; bare `/history` renders Incidents and invalid values canonicalize to it. D02 settles origin-aware incident return, not its exact query/history/focus mechanics or proposed direct-entry fallback. Filter semantics and alternate periods remain open. Onboarding Cancel/Back implements discard-and-return as described in section 4.10. The original six-page/seven-widget/five-feature/five-entity sketch is illustrative, not a quota or implementation target.

### Cross-view reuse

**Implemented:** severity/validation representations come from the [incident public API](../../src/entities/incident/index.ts); locale presentation from [shared/i18n](../../src/shared/i18n/index.ts); timestamp arithmetic from [shared/lib](../../src/shared/lib/index.ts); generic badges/icons/layout from [shared/ui](../../src/shared/ui); sidebar navigation from [app-sidebar](../../src/widgets/app-sidebar/index.ts).

**Proposed — Not Approved:** structured diagnosis, workflow identity, users/teams and external GitHub references could gain reusable representations when their contracts and consumers justify them. Future review, assignment and configuration operations belong with their approved capabilities, not generic shared UI. Operations and History currently share the incident model, `IncidentFilters`, formatters and validation-status UI while keeping separate table compositions; column/content ownership stays with the relevant composition. See [component reuse conventions](../frontend-conventions.md#4-component-reuse-and-presentation) rather than building a universal domain table.

## 7. Domain state versus frontend state

### Conceptual domain path — Proposed — Not Approved

The original mockup path was:

```text
OPEN → IN_REMEDIATION → VERIFICATION → RESOLVED
       human start      linked run      human resolution

Diagnosis validation: PENDING → CONFIRMED or REJECTED
Diagnosis analysis:   ANALYZING → DIAGNOSIS_READY or INCONCLUSIVE
```

These uppercase lifecycle/analysis labels are conceptual, not the current runtime vocabulary or an exhaustive approved state machine. The actual lifecycle uses `Open`, `In remediation`, `Verification`, `Resolved`; current validation includes `NOT_APPLICABLE`. `IncidentStatus`, `DiagnosisStatus` and `ValidationStatus` describe distinct conceptual dimensions in D06, not three implemented enums: analysis has no structured status contract today. See the [current contract](#current-incident-contract--implemented).

**Confirmed Constraints:** analysis state must not be collapsed into incident status and validation must not be equated with resolution. Active/Paused AIOps monitoring is approved in section 4.11 and remains distinct from GitHub execution state or run result. The proposal's uppercase pipeline/run tokens (`ACTIVE`/`PAUSED`, `SUCCESS`/`FAILURE`) are not established runtime contracts here.

### Candidate frontend states — Proposed — Not Approved

| Context | UI states to specify when implementing approved scope |
| --- | --- |
| Operations / History | Loading, loaded, empty, query error and selected criteria. |
| Workspace | Loading, diagnosis available, expanded evidence and contextual navigation. |
| Start remediation / Resolve | Idle, submitting, success/error; transient command state, not incident status. |
| Diagnosis review | Pending, rejection form open, invalid input, submitting and decision recorded. |
| Onboarding | No repository, workflow pending, editable/invalid form, submitting, duplicate or added. |
| Pipeline configuration | Viewing, editing, dirty, submitting, saved/error. |

Not all these technical states were represented in Paper. Sections 4.9–4.11 distinguish implemented Pipelines draft/input validation/discard behavior from registration and configuration saves deferred until local API integration; candidate submitting/saved/added states are not implemented or a local mutation target. The original handoff described timestamp hovers and the rejection form as designed but non-executable prototype states; this is historical proposal context, not a fresh Paper/browser verification or approved interaction contract. Current Operations and History use synchronous fixture reads; History adds a coded empty state, and Insights renders explicit no-data states for empty periods and populations. Future asynchronous loading/error states are not already implemented by that fact.

## 8. Prototype-to-application gaps

D01–D07 settle the frontend direction identified below, not unresolved operation contracts or candidate architectures. The initial Workspace is read-only; visible prototype commands do not expand that scope.

| Prototype representation | Remaining gap / approval boundary |
| --- | --- |
| Separate tab/navigation frames | Operations/History tabs already navigate; D01/D02 incident routing and origin-aware return remain unimplemented. |
| Search/filter controls | D04 criteria direction is agreed, but incident controls remain nonfunctional and exact query contracts open. Pipelines inventory queries do not supply those contracts. |
| Incident row hints/chevrons | Incident ID links open the read-only Workspace. Unsupported IDs display an unavailable state. |
| Insights group rows/hint | D05 contributor-preserving History drill-down includes repository, workflow, stage, period and scope exclusions; not implemented. |
| Expanded `View context` | Read/display of authorized, sanitized context. |
| Timestamp hover | Precision-to-seconds tooltip and accessible equivalent. |
| Simulated Start remediation | Persistent record of human intervention and actor. |
| Static successful verification run | Run association and read-only observation from GitHub. |
| Resolve incident control | Validated, persisted human closure; preconditions remain open. |
| Confirm/Reject controls and form | Auditable human-review record and approved validation rules. |
| Pipeline configuration values/editors | Detail is read-only; independent configuration saves are deferred until local API integration (section 4.9). Persistence, concurrency and authorization contracts remain unresolved. |
| Add Workflow fixture form | Local draft, input validation, review and discard are implemented; registration is disabled and deferred until local API integration (section 4.10). Discovery and durable enrollment contracts remain unresolved. |
| Insights metrics | Current fixed-window terminal-only aggregations are provisional; D03 target populations differ by indicator. Exact calculations, alternate periods and criteria remain open. |

For future integration, typed domain-facing contracts can keep widgets independent of external DTOs; boundary adapters can translate approved integration data. Keep queries conceptually separate from commands so submission errors, validation and eventual authorization are not scattered through presentation. Centralize mock data/operation simulation at data boundaries rather than distributing mock-only branches through components. These are integration recommendations, not approval for API clients, transport abstractions or new providers today. Current fixture validation already supplies a data boundary; see [domain/data conventions](../frontend-conventions.md#8-incident-domain-and-demo-data).

**Proposed — Not Approved:** preserve the original data-quality recommendation that the same incident must not be represented as both unresolved and resolved within a single snapshot. The current schemas validate individual record shapes; they do not enforce cross-record consistency or duplicate-ID checks.

Authorization cannot be inferred from a visible button. Any future frontend capability display complements, never replaces, backend enforcement; neither roles nor enforcement contracts are defined by this document.

The prior navigation audit supplies NAV-01 (unavailable advertised row destinations), NAV-02 (inert query affordances) and NAV-04 (cross-module route-entry focus) evidence; this map does not repeat its technical audit. NAV-01/NAV-02 describe unfinished capabilities, not a permanent-disabled-control target. Current `IncidentFilters` still renders active-looking buttons/input without query behavior; the interim disabled-controls NAV-02 correction is not present on this branch and must not be reported as implemented. NAV-03 is a separate sidebar accessibility concern, not an incident-domain decision; NAV-04 remains an open cross-cutting convention.

## 9. Open Decisions

Every row's outstanding question is an **Open Decision**. Its established-boundary column preserves agreed D01–D07 direction and existing constraints; it must not reopen those decisions or imply their implementation.

| Topic | Preserved context / established boundary | Decision still required | Affected scope |
| --- | --- | --- | --- |
| Live GitHub integration | Local Pipelines uses a synthetic catalog, immutable Pipesor identity and repository + canonical workflow-path uniqueness. Monitoring covers authorized runs across branches; default branch is informational. | Live APIs/discovery, GitHub identifiers, rename/move continuity and synchronization; do not infer them from the local catalog. | Repository / Workflow / monitoring integration |
| Persistence and concurrent editing | Registration and configuration saves are deferred until local API integration; current fixtures are read-only and onboarding has only an unsaved local draft. The shared mutable demonstration-state target is superseded. | Local API contracts, persistence guarantees, concurrent editing and conflict semantics. | Pipeline configuration / onboarding |
| Configuration history | Detail reports absent configuration-update data; seeded examples are not audit events and no local-session changes are recorded. | Full history behavior, navigation, attribution and audit contracts using supplied change data. | Pipeline Detail |
| Incident identity / lookup | D01 agrees `/incidents/:incidentId` and explicit unknown-ID not-found handling; current schema checks only the ID shape. | Collection uniqueness, durable identity scope, lookup failures and non-not-found error behavior. | Workspace / incident read contract |
| Incident–run relationship | D06 needs original/verification references and coherent chronology; Paper's `INC-1039` states have conflicting elapsed times. | Stable references, multiplicity, correlation and association rules; trustworthy event timestamps. | Workspace / backend |
| Remediation start/completion | Intervention is human-controlled. | Formal recording of start, actor and `Remediation completed`; how verification begins. | Lifecycle / timeline |
| Resolution | Human closure is distinct from run success. | Preconditions, completion evidence and exceptions after failed verification. | Lifecycle commands |
| Workspace read completeness | D06 agrees three initially read-only contexts and separation of evidence, inference, lifecycle and human review. Existing incident data lacks structured diagnosis/evidence, run and review provenance. | Approved internally consistent synthetic detail records, diagnosis identity/version, evidence/recommendation, event history, intervention/resolution and historical-review details; full timeline destination and context/timestamp interactions. | Workspace read model |
| Incomplete diagnosis states | Current fixtures display analyzing/insufficient-evidence text; D06 does not invent a `DiagnosisStatus` enum or missing facts. | Analyzing/inconclusive and partial/absent-evidence presentation, available actions and review eligibility. | Workspace / analysis |
| Diagnosis-validation scope | D07 preserves the original hypothesis, evidence and confidence; review is independent of closure. Current unresolved records carry `NOT_APPLICABLE`. | Review subject/version and timing, eligible actors, required cause/comment fields, persistence/concurrency, preservation mechanics, audit and later revisions. | Human-review capability |
| Historical scope / queries | D03 settles all-resolved membership, including pending; current implementation remains terminal-only. D01/D06 settle one read-only Workspace, not its missing detail data. | Date criteria, ordering guarantees, pagination and exact historical query contract; historical-review detail presentation. | History read model |
| Incident criteria | D04 agrees combinable, view-specific criteria with comparable reset/URL behavior; controls remain nonfunctional. | Searchable fields/matching, facet keys, conjunction, date bounds/timezone, empty/reset behavior, filtered versus queue counts, ordering, URL names and invalid-value normalization. | Operations / History / Insights |
| Assignment | Incident assignee differs from pipeline owner. | Who may assign/reassign; whether assignee and reviewer responsibilities are related. | Assignment / authorization |
| Mine scope | Original proposal interprets Mine by incident assignee; current controls do not filter. | Confirm that meaning and whether validation needs a distinct responsible reviewer. | Operations queues |
| View / Operate / Configure | Capability information is illustrative; ownership changes do not grant GitHub permissions. | Enterprise authorization, effective RBAC, matrix and inheritance/scope. | Pipeline access |
| Access configuration | Visual capability representation is not enforcement. | Whether/how editing is supported and where enforcement occurs under approved contracts. | Future access capability |
| Criticality → severity | They remain independent dimensions. | Classification rules and any mapping. | Domain/backend / presentation |
| Return navigation | D02 settles origin-aware return to Active, Needs Validation or History with recognized criteria, never an arbitrary return URL. The status-based no-origin fallback in section 4.3 is only proposed. | Accept/revise the direct-entry/reload fallback; exact safe query representation, retained ordering/scroll/pagination, browser-history/replacement behavior and route-entry focus (NAV-04). | Routing / detail navigation |
| Insights | D03 settles per-indicator population boundaries and excludes pending from confirmation rate; D05 settles contributor-preserving drill-down. Current demo remains fixed-window and terminal-only. | Exact periods, metric calculations/exclusions and interpretation; stable grouping key and query/matching representation reproducing contributors. | Analytical read contracts |
| Evidence visibility / provenance | Authorized, minimized and masked evidence is a confirmed constraint, not an implemented data pipeline. External navigation needs a genuine approved reference. | Redaction/minimization points, evidence-access authorization, sensitive-log handling and traceable provenance. | Workspace / integration / compliance |
| Human command execution | D07 separates assignment, remediation start, resolution and diagnosis review; run success grants none automatically. | Authenticated identity, eligibility/authorization, transitions/preconditions, concurrent updates, durable preservation and auditable decision contracts. | Assignment / lifecycle / review |

Do not resolve these questions by inventing frontend rules or treat all backend concerns as prerequisites for unrelated approved local read work. Existing fixtures support current read views and basic exploration of available fields, not the missing Workspace evidence/history or authenticated commands. D01–D07 settle target direction only; Pipelines identity, monitoring scope and Operational Environment remain settled in section 4.11. Existing approval gates remain in [AGENTS.md](../../AGENTS.md#scope-permissions-and-escalation).

## 10. Using the reference

For a scoped change, start with the implemented baseline, agreed target decisions, relevant candidates and open decisions. Do not treat D01–D07 or complete Pipelines targets as implemented, or infer approval for unresolved contracts, candidate slices or business commands. The incident-detail destination and initially read-only contexts are agreed; their candidate physical decomposition is not. Obtain any remaining required approval before introducing behavior or boundaries.

The original proposal's recommendation to “start” by creating all candidate pages/features is superseded: implementation has already begun with Operations. Preserve its functional reasoning, not its old starting sequence. Apply the existing [frontend conventions](../frontend-conventions.md) for feature cohesion, same-layer boundaries, actual reuse, typed presentation and fixture invariants rather than maintaining a second convention list here. This document itself authorizes no runtime work.
