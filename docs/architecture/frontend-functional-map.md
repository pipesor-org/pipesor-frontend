# Pipesor frontend functional architecture map

This is the maintained functional architecture reference for Pipesor. It reconciles the original Paper-based FSD proposal with the implemented frontend, preserving its domain analysis without turning future screens or controls into approved requirements. The functional areas are workflow monitoring, incident management, and historical analysis; only the Operations read workspace is currently implemented.

## How to read this map

| Status | Meaning |
| --- | --- |
| **Implemented** | Verified in the current source; not a claim of backend integration or browser acceptance. |
| **Confirmed Constraints** | Established boundaries that future work must preserve; not necessarily implemented integrations. |
| **Proposed — Not Approved** | Candidate behavior, structure or screen requiring scoped approval before implementation. |
| **Open Decision** | Unresolved product/domain rule, contract, permission or operational behavior. |

Status labels apply to the section or table explicitly marked with them. A conceptual domain object is not automatically an FSD slice, database table or endpoint. Paper frames specify visual states, not architectural boundaries or permission to implement operations.

### Documentation responsibilities

- [README](../../README.md): setup and implemented product scope.
- [AGENTS.md](../../AGENTS.md): mandatory engineering constraints and approval gates.
- [Frontend conventions](../frontend-conventions.md): FSD import/public-API rules, component reuse, styling, localization, accessibility and fixture invariants.
- [Git workflow](../git-workflow.md): branches, commits, Pull Requests and releases.
- **This map:** functional decomposition, boundary rationale, candidates and unresolved decisions. Source remains authoritative for actual APIs and runtime behavior.

When approved work changes a functional boundary or resolves an open decision, update its status and supporting source/reference here.

## 1. Current frontend baseline — Implemented

| Area | Verified implementation | Evidence |
| --- | --- | --- |
| Screens and routing | Operations is one page with Active Incidents and Needs Validation read projections, selected by `/operations?queue=active` or `?queue=validation`. Missing/invalid queue values canonicalize to Active. `/` and the two legacy queue paths redirect; unmatched paths render Not Found. | [Route table](../../src/app/App.tsx), [Operations page](../../src/pages/operations/ui/OperationsPage.tsx), [navigation public API](../../src/shared/config/index.ts), [navigation registry](../../src/shared/config/navigation.ts) |
| Page composition | `OperationsPage` composes `AppLayout`, `AppSidebar`, `OperationsHeader`, `OperationsTabs`, `OperationsSummary`, `IncidentFilters`, and the selected queue table. The layout/sidebar remain outside the queue switch. | [Operations page](../../src/pages/operations/ui/OperationsPage.tsx) |
| Shell boundaries | Generic slotted `AppLayout` lives in `shared/ui/app-layout`; navigation and the profile menu live in `widgets/app-sidebar`. There is no `application-shell` slice or authenticated-user integration. | [Layout public API](../../src/shared/ui/app-layout/index.ts), [layout](../../src/shared/ui/app-layout/AppLayout.tsx), [sidebar public API](../../src/widgets/app-sidebar/index.ts), [sidebar](../../src/widgets/app-sidebar/ui/AppSidebar.tsx) |
| Layers and domain | Current slices are Operations/Not Found pages, smaller Operations/sidebar widgets, and a single `entities/incident` slice. There is no `features/` layer or separate diagnosis, pipeline, GitHub-resource or organization entity slice. | [Pages](../../src/pages), [widgets](../../src/widgets), [entities](../../src/entities), [incident public API](../../src/entities/incident/index.ts) |
| Data and summaries | Local incidents are parsed with Zod at module load. Selectors derive queues, tab counts and summary metrics; pending durations use the fixed `INCIDENT_SNAPSHOT_AT`, not a live feed. No backend fetching or domain mutations are integrated. | [Fixtures](../../src/entities/incident/model/incidents.ts), [selectors](../../src/entities/incident/model/selectors.ts), [tabs](../../src/widgets/operations-tabs/ui/OperationsTabs.tsx), [summary](../../src/widgets/operations-summary/ui/OperationsSummary.tsx) |
| Presentation versus behavior | Queue tabs navigate. Search, Mine/Unassigned/All, filter and sort affordances do not filter or query incidents. Table chevrons do not open a detail route; “Assign to me” is presentation, not an assignment command. History and Pipelines are unavailable sidebar destinations, not registered screens. | [Filters](../../src/widgets/incident-filters/ui/IncidentFilters.tsx), [active table](../../src/widgets/incidents-table/ui/IncidentsTable.tsx), [validation table](../../src/widgets/needs-validation-table/ui/NeedsValidationTable.tsx), [tabs](../../src/widgets/operations-tabs/ui/OperationsTabs.tsx), [sidebar](../../src/widgets/app-sidebar/ui/AppSidebar.tsx), [route table](../../src/app/App.tsx) |
| Formatting ownership | `shared/i18n` exports `useFormatters` for locale-aware timestamps, numbers and durations. `shared/lib` exports `durationMs` for arithmetic on structured timestamps, not locale formatting. | [i18n public API](../../src/shared/i18n/index.ts), [formatters](../../src/shared/i18n/lib/useFormatters.ts), [lib public API](../../src/shared/lib/index.ts), [time utility](../../src/shared/lib/time.ts) |

### Current incident contract — Implemented

The [vocabulary](../../src/entities/incident/model/types.ts) and [Zod schemas](../../src/entities/incident/model/schema.ts) define the current fixture contract; the [incident public API](../../src/entities/incident/index.ts) exposes inferred types, schemas, selectors and domain UI.

| Concern | Current contract |
| --- | --- |
| Shared fields | `id`, repository/workflow display strings, severity, stage, diagnosis text, optional diagnosis note, and nullable incident assignee. These are not stable GitHub resource models. |
| Unresolved branch | `status` is `Open`, `In remediation` or `Verification`; `validationStatus` must be `NOT_APPLICABLE`; nonnegative integer `elapsedMinutes` is required. Strict objects reject resolution-only fields. |
| Resolved branch | `status` is `Resolved`; ISO timestamp `resolvedAt` is required; `validationStatus` is `PENDING`, `CONFIRMED` or `REJECTED`. Strict objects reject `elapsedMinutes`. |
| Queue membership | Active selects operationally unresolved incidents. Needs Validation selects resolved incidents with `PENDING` diagnosis validation; it is not the validation operation. |
| Diagnosis | Diagnosis and confidence/context notes are strings, not structured hypothesis, evidence, recommendation, confidence or analysis-state contracts. The analyzing summary recognizes the fixture text `Analyzing evidence…`; this is not an analysis-state enum. |

These schemas describe legal record shapes, not approved lifecycle commands, validation permissions or backend transition rules. Resolution does not imply confirmation of a diagnosis. The current unresolved `NOT_APPLICABLE` rule must not silently become a universal future validation policy.

## 2. Confirmed Constraints

The following constrain the functional map without asserting that remote services exist today:

| Boundary | Implication |
| --- | --- |
| GitHub Actions is the operational source | Intended integration reads repositories, workflows, runs and events through authorized access. Today, their visible names are fixture data. |
| GitHub access is read-only | Pipesor does not modify GitHub workflows, code, secrets or permissions. Workflow onboarding configures monitoring in Pipesor, not a new GitHub workflow. |
| Remediation is human-controlled | A future `Start remediation` operation records human intervention and may facilitate GitHub navigation; it does not execute an automated fix. Resolution is also a human operational decision. |
| Diagnosis, evidence and recommendation stay distinct | An AIOps inference is not an observed fact. Evidence supports the hypothesis; recommendations guide human work rather than execute it. |
| Resolution and diagnosis validation are independent | A resolved incident can still await review of its diagnosis. |
| Criticality and severity are independent | Pipeline criticality belongs to workflow policy; incident severity belongs to an individual incident. A mapping rule is not yet approved. |
| Ownership and assignment are independent | Workflow owners need not be the assignees of incidents or the eventual diagnosis reviewers. |
| Privacy precedes display | Future logs/events must be authorized, minimized and masked before exposure to the frontend. Hiding content visually is not access control or redaction; no such ingestion pipeline is implemented here. |
| Existing FSD boundaries are preserved | Use the authoritative [frontend conventions](../frontend-conventions.md#1-feature-sliced-design). Do not create slices or routes merely to match Paper frames or the candidate names below. |

## 3. Conceptual domain map — Proposed — Not Approved

This preserves the original functional vocabulary. Except for the current incident fixture contract, these are conceptual responsibilities, not implemented models, approved backend contracts or instructions to create entity slices.

| Concept | Responsibility | Candidate consumers |
| --- | --- | --- |
| Repository | Identity of a repository accessible through GitHub. | Pipelines, Pipeline Detail, Add Workflow, Operations, Workspace |
| GitHub Workflow | Technical identity of an existing workflow, including file and metadata. | Pipelines, Add Workflow, Pipeline Detail, Workspace |
| Monitored Pipeline | An existing workflow enrolled in Pipesor with operational configuration. | Pipelines, Pipeline Detail, Add Workflow, Operations |
| Pipeline Policy | Criticality, monitoring status and operational environment classification. | Pipelines, Pipeline Detail, Add Workflow |
| User / Team | People and teams associated with workflow ownership and incident responsibility. | Pipelines, Operations, Workspace |
| Pipeline Ownership / Access | Ownership relationships and conceptual access capabilities. | Pipeline Detail, Add Workflow |
| Incident | Identity, severity, stage, operational state, assignment and incident timing. | Operations, Workspace, History |
| Workflow Run | Original failed execution and subsequent runs potentially associated with verification. | Workspace |
| Diagnosis | Probable hypothesis, explanation, confidence and analysis state. | Operations, Workspace, History |
| Evidence | Observed logs, events or signals supporting the diagnosis. | Workspace |
| Recommendation | Suggested action guiding human intervention. | Workspace |
| Incident Timeline / Activity | Chronological detection, analysis, intervention, verification and resolution events. | Workspace |
| Diagnosis Validation | Human evaluation result, recorded actual cause and audit information. | Workspace, Needs Validation, History, Insights |
| Pipeline Configuration History | Auditable changes to workflow monitoring configuration. | Pipeline Detail |

Two conceptual groupings remain useful: **Monitored Pipeline** can group the GitHub workflow reference, operational policy and responsibility relationships; **Incident** can group the failed-run reference, operational state, diagnosis, related evidence, activity and validation. Their physical boundaries depend on model autonomy, query needs and demonstrated reuse.

Insights can initially be analytical projections of incidents and validations. A persistent `Insight` entity or one table per KPI is not implied.

## 4. Functional flows

### 4.1. Operations — Active Incidents

**Implemented:** a read queue of unresolved incidents, with severity, incident/workflow identity, stage, diagnosis summary, operational status, assignee and elapsed time; selector-derived summaries and queue navigation. See the [active table](../../src/widgets/incidents-table/ui/IncidentsTable.tsx) and [summary](../../src/widgets/operations-summary/ui/OperationsSummary.tsx).

**Proposed — Not Approved:** actual Mine/Unassigned/All scoping, search, filtering, ordering and navigation from an incident to its Workspace. Loading, query error and empty-result behavior need acceptance criteria when real querying is approved. The original functional analysis associates this queue with Incident, Monitored Pipeline, Repository, Diagnosis and User concepts; it does not require five slices.

Open, in-remediation and verification incidents are variations of one queue, as are analyzing, ready and inconclusive diagnosis displays. The table is a read composition, not a collection of lifecycle features. No direct domain operation is authorized by its visual affordances.

### 4.2. Operations — Needs Validation

**Implemented:** a second incident projection: resolved incidents whose diagnosis validation is pending. It displays the proposed diagnosis, original severity, assignee, resolution timestamp and pending age. Its summary differs from Active; a coded empty state exists in the [validation table](../../src/widgets/needs-validation-table/ui/NeedsValidationTable.tsx).

**Proposed — Not Approved:** actual search, filters, scopes, age-based ordering and navigation to the resolved Workspace. Confirmation/rejection belongs to a future review capability, not a `needs-validation` feature or an operation inferred from this queue. Incident, Diagnosis, Diagnosis Validation, User and Monitored Pipeline are its conceptual inputs.

### 4.3. Incident Workspace — Diagnosis Ready — Proposed — Not Approved

One incident-centered composition would combine Incident, Diagnosis, Evidence, Recommendation, Workflow Run, User and Activity. Candidate sections are **AIOps Inference**, **Observed Evidence**, **Recommended Action**, **Incident Details**, **Ownership**, **Timing** and **Timeline**. They present the hypothesis, confidence, explanation, correlated evidence/logs, recommended action, ownership and run context.

`View context`, `View full event timeline`, expanding snippets and opening GitHub links are presentation, extended reading or navigation. They do not become features merely because they have buttons. `Start remediation` differs: it would record entry into human intervention. Assignment would be a separate domain capability if approved for the operator. Neither is currently implemented.

### 4.4. Incident Workspace — Verification — Proposed — Not Approved

The same Workspace would add a verification run, its observed result, intervention/verification durations and contextual actions. Candidate interactions include opening the run or pull request and inspecting timestamp precision on hover.

A successful GitHub run is observed information, not a command issued by the Pipesor user; it does not justify `verification-success`, `workflow-recovery` or `run-succeeded` features. `Resolve incident` would record a human closure decision. Correlation, preconditions and failed-verification exceptions remain [open decisions](#9-open-decisions).

### 4.5. Incident Workspace — Resolved / Diagnosis Validation — Proposed — Not Approved

The resolved Workspace would retain historical diagnosis/evidence and add resolution time/actor, verification result and diagnosis-review state. A contextual Confirm/Reject interaction would register an auditable human decision on a specific hypothesis.

One candidate `validate-diagnosis` capability can cover both outcomes rather than separate confirm/reject features. The proposed confirmation records outcome, actor and time; rejection records the actual cause and optional comments without altering the original hypothesis, evidence or confidence. Opening/editing/canceling a rejection form is local UI behavior; recording the decision is a domain operation. Actor eligibility, validation scope, required fields and later revisions are unresolved, not implied by grouping both outcomes together.

### 4.6. History — Incidents — Proposed — Not Approved

A read view would combine Incident, Diagnosis, Diagnosis Validation, Monitored Pipeline and User information: diagnosis, validation outcome, diagnosis/resolution durations and closure date. It would offer date/query controls and navigation to historical Workspaces, not domain operations from the table.

It can reuse incident models without copying the Active queue's full table: historical questions require different columns and presentation. `view-history` and `search-history` are not automatically features.

### 4.7. History — Insights — Proposed — Not Approved

An analytical composition would use incident/validation read models and pipeline references for mean diagnosis time, MTTR, diagnosis-confirmation rate, resolved-incident counts, stage distribution and recurring contexts. Candidate visuals include KPI cards, a time series, stage/validation distributions and a context table, with period/analytical filters if approved. Loading, loaded, empty and error are candidate query states.

Do not create a feature per KPI or chart. Diagnosis-confirmation rate is distinct from experimental system-accuracy metrics; Paper demonstration values are not empirical thesis results. Formulas, periods and denominators remain open.

### 4.8. Pipelines — Monitored Workflows — Proposed — Not Approved

An inventory would show monitored workflows with repository, operational environment, criticality, responsible team and Active/Paused monitoring status. Conceptual inputs are Monitored Pipeline, Repository, GitHub Workflow and Team. Search/filter controls and navigation to Pipeline Detail or Add Monitored Workflow are read/navigation behavior, not mutations from the approved table design.

The header's Add action opens the onboarding form; it is not itself workflow registration. Registration occurs only after a future approved submission flow.

### 4.9. Pipeline Detail / Configuration — Proposed — Not Approved

Candidate sections are **Identity**, **Operational Policy**, **Ownership**, **Access** and **Configuration History**. They would combine GitHub identity, criticality, monitoring, environment, teams/owners, conceptual capabilities and auditable configuration changes. Contextual editors and external GitHub links are presentation/navigation; saving policy or ownership is a domain operation.

Initially, `configure-monitored-pipeline` could group criticality, monitoring and ownership updates while keeping their internal operations distinct. Separate features would be justified only by demonstrably independent forms, permissions or validation lifecycles. The visual View/Operate/Configure section does not approve an access editor or authorization matrix.

### 4.10. Add Monitored Workflow — Proposed — Not Approved

A cohesive onboarding flow would select an existing Repository/GitHub Workflow and record its Pipesor monitoring policy and ownership. Candidate information includes YAML file, default branch, criticality, environment, Active/Paused status, team and multiple owners. Sections are **GitHub Workflow**, **Operational Policy**, **Ownership** and **Review and Add**.

Dependent selectors, summary/review and cancel belong within the form, not separate features. The candidate flow covers no repository, repository selected, workflow selected, valid/invalid configuration, submitting, duplicate and added/error states. Resource discovery is read-only GitHub integration; recording monitoring configuration is a Pipesor operation whose identity, scope and contract remain open.

## 5. Interaction versus domain operation

**Confirmed Constraints:** classification follows the existing [FSD decision rule](../frontend-conventions.md#1-feature-sliced-design); interaction does not automatically establish a feature. **Proposed — Not Approved:** the unimplemented capabilities below illustrate its application, not implementation authorization.

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

**Proposed — Not Approved:** small preloaded collections may use local filtering; a real paginated queue may require server-side criteria for search/order/filtering. These are different query implementations, neither automatically a feature. No pagination or query contract is selected here.

## 6. Candidate FSD boundaries — Proposed — Not Approved

These candidates preserve the original rationale, not a scaffold to create now. Existing names/composition in [section 1](#1-current-frontend-baseline--implemented) remain the baseline. Pages may consume widgets/entities/shared directly; no flow must traverse every layer or access entities only through features.

### Entities

| Candidate slice | Possible responsibility | Current relationship |
| --- | --- | --- |
| `incident` | Incident identity, severity, lifecycle, stage, timing and domain UI | Exists with the narrower fixture contract documented above. |
| `diagnosis` | Structured hypothesis, confidence, evidence, recommendation and validation | Not separate today; diagnosis strings and validation outcome belong to the incident contract. |
| `monitored-pipeline` | Monitoring configuration, operational policy and compact workflow representation | Not implemented. |
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
| `pipeline-configuration` | Identity, policy, ownership, access presentation and change history. |
| `incident-history` | Historical table and query controls. |
| `incident-insights` | Metrics, charts, distributions and recurring-context table. |

Inference, evidence and timeline sections can remain internal components or entity representations until reuse justifies promotion. Onboarding may compose its feature UI directly; an `add-workflow-form` widget is not obligatory.

### Pages and navigation

| Candidate page | Illustrative URL | Composition |
| --- | --- | --- |
| `operations` | `/operations?queue=active` / `?queue=validation` | Existing page and smaller widgets; **Implemented** as described in section 1. |
| `incident-detail` | `/incidents/:incidentId` | One Workspace representing incident states from data. |
| `history` | `/history` | Incident History or Insights. |
| `pipelines` | `/pipelines` | Monitored workflow inventory. |
| `pipeline-detail` | `/pipelines/:pipelineId` | Pipeline configuration. |
| `add-monitored-workflow` | `/pipelines/new` | Workflow onboarding. |

Except for Operations, these are **Proposed — Not Approved** frontend routes, not registered screens, navigation contracts or REST endpoints. History tabs could preserve selection via query parameters; return context from details needs a decision. The original six-page/seven-widget/five-feature/five-entity sketch is illustrative, not a minimum, quota or implementation target; it does not describe today's pages (which also include Not Found).

### Cross-view reuse

**Implemented:** severity/validation representations come from the [incident public API](../../src/entities/incident/index.ts); locale presentation from [shared/i18n](../../src/shared/i18n/index.ts); timestamp arithmetic from [shared/lib](../../src/shared/lib/index.ts); generic badges/icons/layout from [shared/ui](../../src/shared/ui); sidebar navigation from [app-sidebar](../../src/widgets/app-sidebar/index.ts).

**Proposed — Not Approved:** structured diagnosis, workflow identity, users/teams and external GitHub references could gain reusable representations when their contracts and consumers justify them. Future review, assignment and configuration operations belong with their approved capabilities, not generic shared UI. Operations and History may share incident models without sharing an entire business table; column/content ownership stays with the relevant composition. See [component reuse conventions](../frontend-conventions.md#4-component-reuse-and-presentation) rather than building a universal domain table.

## 7. Domain state versus frontend state

### Conceptual domain path — Proposed — Not Approved

The original mockup path was:

```text
OPEN → IN_REMEDIATION → VERIFICATION → RESOLVED
       human start      linked run      human resolution

Diagnosis validation: PENDING → CONFIRMED or REJECTED
Diagnosis analysis:   ANALYZING → DIAGNOSIS_READY or INCONCLUSIVE
```

These uppercase lifecycle/analysis labels are conceptual, not the current runtime vocabulary or an exhaustive state machine. The actual lifecycle uses `Open`, `In remediation`, `Verification`, `Resolved`; current validation includes `NOT_APPLICABLE`; analysis has no structured enum. See the [current contract](#current-incident-contract--implemented).

**Confirmed Constraints:** analysis state must not be collapsed into incident status, validation must not be equated with resolution, and pipeline monitoring (`ACTIVE`/`PAUSED` in the proposal) must remain distinct from a GitHub run result (`SUCCESS`/`FAILURE` in the proposal). Those pipeline/run tokens are not established contracts here.

### Candidate frontend states — Proposed — Not Approved

| Context | UI states to specify when implementing approved scope |
| --- | --- |
| Operations / History | Loading, loaded, empty, query error and selected criteria. |
| Workspace | Loading, diagnosis available, expanded evidence and contextual navigation. |
| Start remediation / Resolve | Idle, submitting, success/error; transient command state, not incident status. |
| Diagnosis review | Pending, rejection form open, invalid input, submitting and decision recorded. |
| Onboarding | No repository, workflow pending, editable/invalid form, submitting, duplicate or added. |
| Pipeline configuration | Viewing, editing, dirty, submitting, saved/error. |
| Insights | Loading, loaded, empty/error. |

Not all these technical states were represented in Paper. The original handoff described timestamp hovers and the rejection form as designed but non-executable prototype states; this is historical proposal context, not a fresh Paper/browser verification or approved interaction contract. Current Operations uses synchronous fixtures; future asynchronous states are not already implemented by that fact.

## 8. Prototype-to-application gaps — Proposed — Not Approved

| Prototype representation | Functional work that would require approval/contracts |
| --- | --- |
| Separate tab/navigation frames | Real navigation and preserved context; Operations queue URLs already cover this limited case. |
| Search/filter controls | Local filtering or queries over actual data. |
| Expanded `View context` | Read/display of authorized, sanitized context. |
| Timestamp hover | Precision-to-seconds tooltip and accessible equivalent. |
| Simulated Start remediation | Persistent record of human intervention and actor. |
| Static successful verification run | Run association and read-only observation from GitHub. |
| Resolve incident control | Validated, persisted human closure; preconditions remain open. |
| Confirm/Reject controls and form | Auditable human-review record and approved validation rules. |
| Pipeline configuration values/editors | Reading/saving Pipesor operational configuration. |
| Add Workflow fixture form | Authorized resource discovery and persistent monitoring enrollment. |
| Insights demonstration metrics | Real aggregations with agreed definitions and evidence. |

For future integration, typed domain-facing contracts can keep widgets independent of external DTOs; boundary adapters can translate approved integration data. Keep queries conceptually separate from commands so submission errors, validation and eventual authorization are not scattered through presentation. Centralize mock data/operation simulation at data boundaries rather than distributing mock-only branches through components. These are integration recommendations, not approval for API clients, transport abstractions or new providers today. Current fixture validation already supplies a data boundary; see [domain/data conventions](../frontend-conventions.md#8-incident-domain-and-demo-data).

**Proposed — Not Approved:** preserve the original data-quality recommendation that the same incident must not be represented as both unresolved and resolved within a single snapshot. The current schemas validate individual record shapes; they do not enforce cross-record consistency or duplicate-ID checks.

Authorization cannot be inferred from a visible button. Any future frontend capability display complements, never replaces, backend enforcement; neither roles nor enforcement contracts are defined by this document.

## 9. Open Decisions

Every row is an **Open Decision**. The design context explains why it matters, not an approved domain rule.

| Topic | Preserved context / established boundary | Decision still required | Affected scope |
| --- | --- | --- | --- |
| Monitored-workflow scope | Onboarding concerns an existing workflow, not a GitHub write. | All branches or restricted scope; identity of a monitoring enrollment. | Monitored Pipeline / onboarding |
| GitHub identity | Names appear in the design and current fixtures. | Stable identifiers, renames and synchronization. | Repository / Workflow contracts |
| Incident–run relationship | Design depicts an original failed run and a verification run. | Multiplicity, correlation and association rules. | Workspace / backend |
| Remediation start/completion | Intervention is human-controlled. | Formal recording of start, actor and `Remediation completed`; how verification begins. | Lifecycle / timeline |
| Resolution | Human closure is distinct from run success. | Preconditions, completion evidence and exceptions after failed verification. | Lifecycle commands |
| Inconclusive diagnosis | Current fixtures display insufficient-evidence text. | Available actions and review eligibility when no reliable hypothesis exists. | Workspace / analysis |
| Diagnosis-validation scope | Review is independent of closure. Preserving the original hypothesis, evidence and confidence is proposed review behavior, not approved policy. Current unresolved records carry `NOT_APPLICABLE`. | Which incident/diagnosis/version can be reviewed and when; eligible actors, required cause/comment fields, audit contract, preservation policy and later revisions. | Human-review capability |
| Assignment | Incident assignee differs from pipeline owner. | Who may assign/reassign; whether assignee and reviewer responsibilities are related. | Assignment / authorization |
| Mine scope | Original proposal interprets Mine by incident assignee; current controls do not filter. | Confirm that meaning and whether validation needs a distinct responsible reviewer. | Operations queues |
| View / Operate / Configure | Capabilities appear conceptually in the design. | Authorization matrix, inheritance/scope and final editor interaction. | Pipeline access |
| Access configuration | Visual capability representation is not enforcement. | Whether/how editing is supported and where enforcement occurs under approved contracts. | Future access capability |
| Environment | Design treats environment as operational classification. | Relationship, if any, to GitHub Environment. | Pipeline policy |
| Criticality → severity | They remain independent dimensions. | Classification rules and any mapping. | Domain/backend / presentation |
| Return navigation | Design includes `Back to Operations`; current queues have canonical URLs. | Contextual return to Active, Needs Validation or History; future route/selection contracts. | Routing / detail navigation |
| Insights | Candidate metrics and visuals exist, not empirical results. | Formulas, periods, denominators and metric interpretation. | Analytical read contracts |

Do not resolve these questions by inventing frontend rules. They do not all block unrelated approved visual work. Before implementing the respective operations, prioritize workflow identity/scope, incident-transition rules and the human-validation contract. Existing approval gates remain in [AGENTS.md](../../AGENTS.md#scope-permissions-and-escalation).

## 10. Using the reference

For a scoped change, start with the implemented baseline, identify any relevant candidate and open decision, and obtain the required approval before introducing behavior or boundaries. Keep Incident Workspace data-driven if its shared composition remains appropriate; it is the most coupled candidate because it combines inference, evidence and operational/review capabilities.

The original proposal's recommendation to “start” by creating all candidate pages/features is superseded: implementation has already begun with Operations. Preserve its functional reasoning, not its old starting sequence. Apply the existing [frontend conventions](../frontend-conventions.md) for feature cohesion, same-layer boundaries, actual reuse, typed presentation and fixture invariants rather than maintaining a second convention list here. This document itself authorizes no runtime work.
