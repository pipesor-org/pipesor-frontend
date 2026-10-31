# Incident Management User Flow Assessment

**Conclusion:** Operations and History form coherent **read views**, but none of the requested journeys into Incident Workspace is executable end-to-end. Paper supplies investigation, verification, and pending-review states; it does not complete the operational rules, historical experience, or return-navigation contract.

**Baseline:** `develop` at `5b87902`, matching GitHub; working tree clean. Inspected the seven relevant [Pipesor Paper artboards](https://app.paper.design/file/01M3SGMN2N9NPNEKH3TMXGBZG2/p-1-0), including Workspace layer annotations and its hidden rejection form. No repository, Git, documentation, or Paper changes.

## 1. End-to-end user flow map

The table distinguishes **implemented navigation** from **Paper/documented intent**. Intended behavior is not authorization to implement business operations.

| Journey and user intent | Intended interaction and destination | Implemented behavior | Unfinished or undefined boundary |
|---|---|---|---|
| **Active Incidents → investigate an incident** | Select a row; open its Workspace with diagnosis, evidence, recommendation, ownership, timing, and run context. | Active queue, summaries, and queue switching work. Records include `Open`, `In remediation`, and `Verification`. | Rows do not navigate; Workspace is absent. Paper shows Open and Verification examples, but not complete investigating/analyzing/inconclusive interaction states. |
| **Needs Validation → review a diagnosis** | Select a resolved incident; inspect its original diagnosis/evidence; confirm or reject it. | Queue correctly selects `Resolved` + `PENDING`, displaying resolution time and pending age. | No Workspace or review command. Being in this queue establishes neither reviewer identity nor permission. |
| **History / Incidents → inspect historical context** | Select a row; open historical Workspace with recorded diagnosis outcome and resolution context. | Terminal-validation incidents are displayed, newest resolution first. | No historical detail route. No confirmed/rejected Workspace artboard was available; current records lack actual cause, reviewer, resolution actor, and audit history. |
| **History / Insights → inspect contributing incidents** | Select a recurring group; show Incidents filtered by pipeline and stage, as Paper’s footer specifies. | Fixture-derived KPIs, distributions, trend, and recurring groups render. | Group selection does nothing. Result criteria, retained analysis window, and navigation contract remain undefined. |
| **Workspace → resume originating work** | Return to Active, Needs Validation, or historical results without losing relevant context. | Queue/view URLs identify existing read views. | No incident return journey. Every Workspace mockup says only **Back to Operations**; none defines History return or which Operations queue to restore. |

Sources: [registered routes](src/app/App.tsx#L34-L55), [queue and History selectors](src/entities/incident/model/selectors.ts#L23-L82), [functional flows](docs/architecture/frontend-functional-map.md#L93-L157).

### What the designed lifecycle establishes—and does not

Paper depicts:

- **Start remediation:** records human intervention, not an automatic GitHub fix.
- **Verification:** a successful subsequent run is observed evidence; the incident still requires human resolution.
- **Resolved / Pending validation:** operational closure does not confirm the diagnosis.
- **Diagnosis review:** confirmation or rejection evaluates the original hypothesis separately from incident resolution.

The repository represents these dimensions as data, **not executable transitions**. Its 21 distinct fixtures comprise six unresolved incidents, seven resolved/pending incidents, and eight resolved/terminal-validation incidents. They demonstrate different states; they do not show one incident progressing through the journey.

## 2. Interaction inventory

**Implemented** means functional now. **Incomplete** identifies a broken end-to-end connection. **Deferred** means deliberately outside the approved implementation. **Undefined** means the intended behavior lacks a settled functional contract.

| Visible control or interaction | Classification | Actual behavior |
|---|---|---|
| Operations Active / Needs Validation tabs | **Implemented** | URL-selected queues; counts derive from fixtures. |
| History Incidents / Insights tabs | **Implemented** | URL-selected views. |
| Sidebar Operations / History | **Implemented** | Opens the default queue/view; not a contextual return mechanism. |
| Sidebar collapse/overlay and profile, language, theme controls | **Implemented local UI** | Shell/preferences behavior; profile content is not authentication. Prior navigation-audit limitations remain separate evidence. |
| Operations Mine / Unassigned / All | **Deferred** | `All` remains selected; no filtering. Mine’s eventual responsibility semantics are **undefined**. |
| Operations and History search | **Deferred** | Text can be entered, but records and summaries do not change. |
| Active: Severity, Repository, Stage, Status, Assignee | **Deferred** | No menus or filtering. |
| Needs Validation: Severity, Repository, Stage, Resolved date, Assignee | **Deferred** | No menus or filtering. |
| History: Date range, Repository, Stage, Validation, Assignee | **Deferred** | No menus or filtering; assignment scopes are absent. |
| Active / Needs Validation ordering captions | **Deferred interaction** | Descriptive only. Existing fixture order matches the captions, but selectors do not sort. |
| History “Sorted by Resolved” | **Implemented fixed ordering** | Selector sorts newest first; caption is not an interactive sort control. |
| Incident rows and chevrons in all three queues | **Deferred; journey incomplete** | No row navigation or selection behavior. |
| Active “Assign to me” | **Deferred; rules undefined** | Plain text, not an assignment command. |
| Insights Date range, Repository, Pipeline, Stage, Severity | **Deferred** | Static presentation; no period or population changes. |
| Insights KPIs, chart points, stage/outcome graphics | **Implemented read display** | No chart drill-down is evidenced by the design. |
| Insights recurring-group rows and chevrons | **Deferred; journey incomplete** | No filtering or navigation despite the footer instruction. |
| Workspace **View context** | **Deferred** | Paper annotations specify adjacent-line expansion inline, not a modal. Context data is absent from current incident fixtures. |
| Workspace **View full event timeline** | **Deferred; destination undefined** | No implemented destination or complete interaction specification. |
| Workspace GitHub run, commit, PR, and verification-run links | **Deferred** | Designed external navigation; current incident records lack their stable references and URLs. |
| Workspace Ownership **Change** | **Undefined** | No editor shown; whether it changes incident assignment, team responsibility, or another relationship is unsettled. |
| Workspace **Start remediation / Resolve incident** | **Deferred; operational rules undefined** | No commands. **Remediation completed** is a designed recorded-state display, not evidence of a completion action. |
| Workspace **Confirm / Reject diagnosis** | **Deferred; review contract undefined** | No review command or durable review record. |
| Rejection form: Actual cause, optional notes, Cancel, Submit rejection | **Deferred** | Hidden Paper form specifies required actual cause and retaining `Resolved`; these are design intentions, not finalized submission rules. |
| Precise timestamp inspection | **Deferred** | Paper annotations describe exact-time hover/focus information. |
| Pagination, bulk selection, selection checkboxes | **Not present** | No such controls were found; their behavior cannot be inferred. |

Evidence: [shared incident filters](src/widgets/incident-filters/ui/IncidentFilters.tsx#L35-L101), [History composition](src/pages/history/ui/HistoryPage.tsx#L49-L75), [Insights filters](src/pages/history/ui/HistoryInsightsFilters.tsx#L9-L49), [historical rows](src/widgets/history-incidents-table/ui/HistoryIncidentsTable.tsx#L97-L179), [recurring groups](src/widgets/history-insights/ui/HistoryInsightsRecurringContexts.tsx#L83-L119).

## 3. Cross-view consistency analysis

### Consistent boundaries

- **Lifecycle and diagnosis validation remain independent.** A resolved incident may be pending, confirmed, or rejected.
- **Incident assignment is not workflow ownership.** Neither establishes diagnosis-review responsibility.
- **History and Insights share their fixture population.** Both use the eight terminal-validation incidents; Insights additionally applies its fixed analysis window.
- **GitHub remains read-only.** Remediation means human work outside Pipesor, not automated execution.

These distinctions are explicit in the [incident contract](src/entities/incident/model/schema.ts#L20-L100) and [confirmed constraints](docs/architecture/frontend-functional-map.md#L52-L65).

### Contradictions and limitations

1. **Advertised continuations are unavailable.** Operations/History row instructions and Insights’ group-filtering instruction describe interactions the tables do not perform. This carries forward the prior navigation-audit evidence; it does not turn deliberately deferred Workspace work into an unauthorized implementation requirement.

2. **“Resolved incidents” does not mean every resolved incident.** Seven resolved/pending records appear in Needs Validation but not History or Insights. This was explicitly approved as provisional demo membership; final historical completeness remains undecided.

3. **Paper’s analytics numbers are illustrative, not current results.** Paper shows 43 incidents and 84% confirmation. The approved implementation derives results from eight records: five confirmed and three rejected, producing **62.5% confirmation**. This is an intentional data substitution, not a numerical implementation defect.

4. **Ordering guarantees differ.** History actually sorts. Active and Needs Validation currently depend on fixture arrangement matching their ordering captions.

5. **Workspace snapshots are not a consistent observed execution.** For the same INC-1039 example, Open displays `3h 06m` elapsed while Verification displays `15m 27s`. These frames establish presentation states, not a reliable event history.

6. **Documentation misdescribes some controls.** The functional map says four History filters, while source renders five. It describes Insights period/repository/stage/validation controls, while source and Paper show date/repository/**pipeline**/stage/**severity**. See [History boundaries](docs/architecture/frontend-functional-map.md#L133-L139) and [Insights definitions](docs/architecture/frontend-functional-map.md#L149-L155).

The requested **NAV-01/NAV-02/NAV-04 evidence** was reused for unavailable advertised navigation, inert query affordances, and cross-view focus continuity. Their technical audit was not repeated.

## 4. Data and navigation dependencies

| Information needed for coherent journeys | Available now | Missing or unsettled |
|---|---|---|
| **Incident identity** | Validated `INC-<digits>` IDs | Collection uniqueness is not enforced; durable scope and detail-lookup behavior are undefined. |
| **Origin and return context** | Queue/view in URL | Incident origin, criteria, ordering, pagination/scroll retention, direct-entry fallback, and post-action return behavior. |
| **Workflow/run identity** | Repository/workflow display names and stage | Stable repository, workflow, monitored-workflow, original-run, verification-run, commit, and PR references. |
| **Diagnosis subject** | Diagnosis text, optional note, validation outcome | Diagnosis identity/version, structured analysis/confidence, evidence, recommendation, actual cause, and review provenance. |
| **Lifecycle history** | Current status, elapsed minutes or resolution timestamp | Detection/intervention/verification timestamps, associated runs/results, resolution actor, and activity history. |
| **Human responsibility** | Nullable incident-assignee display name | Authenticated subject, stable user references, assignment authority, reviewer eligibility; workflow ownership remains separate. |
| **Analytical contributors** | Fixed window and repository/workflow/stage grouping | Approved contributor criteria, stable grouping identity, drill-down population, and retained analytical context. |

The [schema](src/entities/incident/model/schema.ts#L27-L100) validates record shapes, not operational permissions or cross-record consistency. Display durations cannot supply missing event timestamps.

Current Insights groups use **repository name + workflow name + stage**, not a stable pipeline ID or root-cause classification. See [grouping logic](src/entities/incident/model/insights.ts#L265-L303).

## 5. Decision register

These are unresolved functional decisions, not proposed implementation tasks.

| Decision | Evidence | Consequence of remaining undefined |
|---|---|---|
| Workspace destination, historical mode, and origin-specific return | Paper’s generic Back link; no incident route; functional map §9 | Users cannot reliably resume their queue or historical investigation. |
| Whether pending-validation resolved incidents belong in History | Provisional terminal-only selector and documented open decision | “Resolved,” historical completeness, and analytical populations retain different possible meanings. |
| Search/filter/date/order semantics and combined criteria | Presentational controls; functional map §§4, 9 | A filtered result set or cross-view drill-down has no settled meaning. |
| Mine, assignment authority, and reviewer responsibility | Static profile; nullable assignee name; separate ownership constraint | Personal queues and action eligibility cannot be determined. |
| Original/verification run association and verification initiation | Paper’s two runs; functional map §9 | Success cannot reliably be connected to the incident or intervention. |
| Remediation completion and resolution preconditions, including unsuccessful verification | Designed states without complete transitions | Timeline and allowed actions cannot be inferred safely. |
| Actions for analyzing or inconclusive diagnoses | Table text exists; Workspace variants are incomplete | Available investigation/remediation/review actions remain unknown. |
| Review subject/version, eligible actors, required fields, preservation, and revisions | Paper rejection form; functional map §4.5 and §9 | Confirm/reject cannot become an auditable durable decision. Rejection must not silently rewrite the original hypothesis. |
| Historical confirmed/rejected Workspace behavior | No corresponding artboards or review-detail data | Read-only versus editable review, actual-cause presentation, and later revisions are unspecified. |
| Analytics formulas, denominators, grouping, and drill-down scope | Explicitly provisional Insights definitions | Demonstration values cannot be presented as finalized operational MTTR or model accuracy. |
| Authorized evidence visibility and redaction | Functional map privacy constraint | Real logs/context cannot be exposed merely because the UI can display them. |

Evidence: [documented open decisions](docs/architecture/frontend-functional-map.md#L303-L324). Paper narrows interaction intent but does not settle API, authorization, or persistence policy.

## 6. Implementation readiness assessment

**This is readiness classification, not implementation authorization or a delivery plan.**

| Readiness boundary | Assessment |
|---|---|
| **Supported by existing validated local fixtures** | Current read views, summaries, historical ordering, and provisional analytics. Nonpersistent exploration over existing severity/stage/status/validation/assignee values is data-feasible; approved matching and scope semantics are still needed. |
| **Not inherently backend-dependent, but functionally undefined** | Incident navigation, contextual return, search semantics, and Insights-to-Incidents criteria. Their missing definitions—not an API alone—prevent a coherent journey. |
| **Locally demonstrable only with additional approved data** | Full Workspace inference/evidence/recommendation, expanded context, timelines, run associations, precise timestamps, and historical review details. Current incident fixtures do not contain those facts. |
| **Requires identity, authorization, and persistent contracts** | Assignment/reassignment, recording remediation, human resolution, diagnosis confirmation/rejection, and audit history. Form editing/canceling is local UI; submitting a decision is not. |
| **External read/navigation boundary** | Opening a supplied, authorized GitHub URL is navigation, not a GitHub mutation. Retrieving real run/log context additionally requires approved access, stable references, and sanitized data. |

Synchronous fixtures also do not establish remote loading, query failure, command submission, conflict, or concurrent-update behavior. Existing empty/no-data displays cover only part of that experience.

## Key Learnings:

1. The frontend demonstrates incident states across read projections, not a completed incident-management lifecycle.
2. Operational closure, diagnosis review, incident assignment, and workflow ownership remain separate decisions.

**Not checked:** browser/runtime behavior or automated checks; no corrections were planned.  
**Primary risk:** treating mockup controls or fixture shapes as approved business operations would invent missing rules.