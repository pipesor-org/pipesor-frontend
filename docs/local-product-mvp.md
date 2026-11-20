# Local product MVP and advisor demonstration

The executable slice opens a persisted E02 diagnosis in **Operations → Needs Validation**. The local harness supplies a diagnostic ID and a per-run test credential through its existing review fixture. The dashboard reads Recommendation over HTTP and uses the existing P3 review form. The regular queues, inventory and History still display demonstration fixtures. The local review view replaces the fixture queue body and labels the replay in English and Spanish.

## Integration status

Backend baselines from the local workspace are Ingestion `91135d0`, Pipeline `0f9b440`, Log/Event `6f4dfa8`, NLP `92fea50`, Correlation `518f6c1`, RAG `1772c18` and Recommendation `3b4a8a4`. The frontend baseline is `d398af3`. The docs checkout is `50b427c`; its ADR-020 records ownership and authorization, with PD-034/035 tracking runtime contracts and delivery.

| Owner or screen | Executable boundary and persistence | Local status and next action |
| --- | --- | --- |
| Ingestion | `GitHubController` serves connection status, repository and workflow discovery under `/api/v1/github`, and internal access/workflow verification under `/internal/v1/github`. GitHub link facts live in connector PostgreSQL metadata. The provider separates user-token reads from installation-token capture. | Browser OAuth executor and callback activation remain pending. Discovery needs a delegated Entra identity, a current linked GitHub user, and an admitted installation. Complete the server-side state/PKCE callback and custody/refresh runtime before wiring onboarding. |
| Ingestion capture | `POST /webhooks/v1/github/workflow-runs` verifies the original signature and scope before recording a durable receipt. Optional preparation dispatch and publication workers protect/freeze outputs and publish through Service Bus. | Disabled by default and absent from this run. Activation needs existing approved App material, installed webhook delivery, scope configuration, and broker settings. Replay starts with an already-protected synthetic envelope. |
| Pipeline | `GET/POST /api/v1/pipelines`, item GET, policy/ownership PUT, execution and incident GETs. PostgreSQL `ops` owns repositories, pipelines, grants, execution receipts, executions and incidents. | Entra delegated scopes plus current GitHub facts and effective AIOps capabilities govern human reads and changes. Registration rechecks repository administration and creates CONFIGURE; duplicate selection conflicts. The harness seeds the test pipeline via SQL and invokes the real `ExecutionSnapshotService` with a transformed synthetic failure. Service Bus consumer composition is opt-in and excluded. Wire authorized discovery/read clients once a shared browser session exists. |
| Log/Event | Evidence registration and scoped membership checks over `/internal/v1/evidence/membership-checks`; PostgreSQL `evidence` is the owner store. | Harness calls the real store and membership handler with test identity and scope. Machine scope checks in deployment need the configured Ingestion and Pipeline authorities. Human evidence reads need current repository authorization. |
| NLP | Service Bus receive loop and protected evidence v2 processing, redaction, Drain3 and signed HTTP candidate handoff. | Harness calls processing directly and uses the HTTP handoff. Broker delivery and worker settlement require authorized topic/subscription and workload settings. |
| Correlation | Signed processed-evidence HTTP receiver verifies Pipeline references and Log/Event membership before persisting scoped groups and contexts in `evidence`; synchronously hands off to Recommendation. | Real receiver and durable store in the harness with test identities. It checks missing and denied references and duplicate deliveries. Deployable workload composition needs configured machine authorities. |
| RAG | `POST /internal/v1/retrieval/query` searches the authorized PostgreSQL/pgvector corpus. Hosted calls require Entra workload identity. | Real HTTP and vector retrieval with synthetic corpus, test caller and deterministic embeddings. |
| Recommendation | `POST /internal/v1/correlated-contexts` persists receipts. The review fixture calls the existing diagnostic admission workflow and serves `GET/POST /local-demo/v1/diagnoses/{id}/review` with a per-run scoped bearer. PostgreSQL `diagnosis` owns snapshots and human reviews. | Real admission, citation checks and review transitions with deterministic inference. Durable read/review uses the snapshot and append-only history. The standalone deployment needs an approved human read/review authority bound to current repository access. |
| Pipelines / Pipeline Detail | Inventory and configuration are fixtures. | Bind approved list/item/policy/ownership resources when authorized browser runtime is available. |
| Add Monitored Workflow | Existing discovery and configuration draft use synthetic choices. | Bind verified Ingestion discovery and Pipeline registration once the ADR-020 delegated flow is active. |
| Operations / Needs Validation | Existing queue fixtures plus an explicit local review URL. Original hypothesis, recommendations, limitations, evidence and knowledge citations, and review history are read from Recommendation in the local view. | The harness supplies the review ID. An authorized incident-to-diagnosis read and an Operations listing backed by operational records are still needed to discover that ID through the app. |
| History / Insights | Fixture read views and derived summaries. | Connect paginated authorized incident and diagnostic review projections after the product read contracts are available. |

## Sequence exercised locally

1. The harness stages the committed sibling revisions and runs the E02 dependency-resolution failure replay. PostgreSQL starts with an explicitly seeded synthetic repository and monitored workflow.
2. A synthetic execution snapshot goes through Pipeline's transformer and application handler. Pipeline commits the execution origin and incident. Log/Event then registers the protected fixture evidence with its tenant, repository, workflow, attempt and scope revision.
3. NLP processing sends a candidate over loopback HTTP. Correlation checks origin and membership, persists its context and delivers the receipt to Recommendation over HTTP. No broker carries messages in this run.
4. Recommendation reads the committed receipt, retrieves scoped RAG matches over HTTP and admits a validated diagnostic snapshot with the original output and citations. The same admitted diagnostic is reused on replay.
5. Chromium opens `/operations?queue=validation&review=<diagnostic-id>` and authenticates to the local fixture via the existing loopback Vite proxy. Confirmation, correction and rejection append immutable review revisions to the same diagnosis. They are separate from resolving the incident in Pipeline.
6. The verifier reloads the page, reauthenticates and checks the retained decision against the PostgreSQL-backed endpoint. It checks that an invalid token clears the view. Browser reload and backend restart are separate checks; this harness removes its disposable databases on exit.

## Advisor run

Use the service [local diagnostic guide](https://github.com/pipesor-org/pipesor-evidence-correlation-engine/blob/main/docs/local-diagnostic-demo.md) for Java 25, Docker, Python 3.14 with pinned NLP/RAG dependencies, and Chromium setup. Install the frontend's frozen Bun dependencies. From the workspace root, with `PYTHON_BIN` and `PIPESOR_PLAYWRIGHT_MODULE` pointing to the prepared tools:

```bash
export PIPESOR_DEMO_SCENARIO=E02 PIPESOR_DEMO_RAG_MODE=pgvector-fixture
export PIPESOR_DEMO_LLM_MODE=fixture PIPESOR_DEMO_REVIEW=1
export PIPESOR_DEMO_BROWSER_CHECK="$PWD/pipesor-frontend/tools/verify_local_review.cjs"
set -o pipefail
bash services/pipesor-evidence-correlation-engine/tools/verify_local_owner_chain.sh 2>&1 | tee /tmp/pipesor-operations-review.log
```

Show the E02 fixture and the logged Pipeline, evidence, correlation and diagnosis IDs. The browser check exercises the existing Operations layout in desktop English and narrow Spanish. Look for three `P3_REACT` decisions and `PIPESOR_INTEGRATED_REVIEW` before presenting the run as successful. This command uses no paid inference or GitHub account access. The test server, credentials and databases exist only for the run.

## Observed verification

The E02 owner-chain run passed on 2026-11-19. Chromium confirmed and rejected
at 1280 px in English, and corrected at 390 px in Spanish. Each decision
survived reload with the original hypothesis and previous history intact.
The fixture verified a cross-scope 404, invalid-token 401, pre-admission 503
and duplicate redelivery. Frontend typecheck, lint and production build passed.

## Remaining MVP gaps in order

1. Activate a permitted browser-to-service Entra session and Ingestion's ADR-020 account-linking flow with approved callback, installation and custody configuration. Then connect the existing onboarding, inventory and settings screens to owner APIs.
2. Resolve the scoped human incident-to-diagnosis index and read/review authority under PD-034. Use it to populate Operations and History and verify denial after revocation across every projection.
3. Exercise an authorized signed delivery through the actual Ingestion receipt, preparation and publication workers and downstream Service Bus subscriptions. Keep the replay as a separate reproducible scenario.
4. Verify stale execution snapshots and diagnosis revisions, retries and owner failures, and rebuild the same diagnosis after a service restart against retained PostgreSQL. Formal diagnostic effectiveness and enterprise rollout are separate academic and deployment work.

## Increment 8 operational discovery

Open `/operations?queue=active&pilot=1` in the development server attached to the owner-chain test host. The mode is labeled **Local pilot · Persisted operations**. Supply the test host's delegated Pipeline token. Operations lists authorized pipelines through `GET /api/v1/pipelines`, reads each `GET /api/v1/pipelines/{id}/incidents`, and projects unresolved rows. The linked incident Workspace reads `GET /api/v1/incidents/{id}` independently. Reload requires reauthentication. Both views keep the token in the current request and reject unauthorized, malformed or unavailable responses without substituting fixtures. This bounded E02 pilot refuses a full first page rather than presenting a truncated discovery result.

Run the E02 command above with Playwright, Chromium and the named frontend verifier. The backend harness seeds only a test workflow, a scoped VIEW grant and explicit synthetic GitHub facts. It signs a short-lived test JWT and passes it to Chromium in the verifier environment. The automated Operations flow receives no incident or diagnosis UUID. Find `PILOT_PIPELINE_HTTP` and `PILOT_CHROMIUM` in the run log. The existing P3 verification follows as a separate test and still receives its diagnostic UUID.

### Contract trace and approval required

- Pipeline owns `ops.incidents` and associated runs. It checks delegated identity, effective AIOps capability and current repository access. Its APIs expose per-pipeline incident lists and incident/run detail. The pilot uses these existing routes and makes no cross-schema reads.
- Correlation validates the owner references and preserves incident, execution, context, evidence and correlation IDs in its owner-scoped records and receipt. Recommendation admits a versioned snapshot with its own diagnostic UUID, incident UUID, authorization scope and output. The stored incident UUID is a usable logical key after approval. The correlation string is trace metadata.
- The local P3 GET reads by diagnostic UUID and checks a separate scoped authority. Pipeline VIEW and the test JWT confer no access to that endpoint. The current Workspace operational pilot stops at an explicit unavailable diagnosis state; a missing diagnosis is not asserted. There is no approved product incident-to-diagnosis API or equivalent authorized association.
- **Minimum proposal for PD-011/PD-034 review.** Approve a read-only Recommendation lookup scoped to Pipeline-owned incident identity and a defined admitted-version selection rule. Authenticate the Recommendation caller independently and supply a verified current repository entitlement bound to subject, tenant and operation. Validate the snapshot's tenant, installation/repository, incident, execution and context against the authorized references before returning the existing admitted snapshot and permitted review projection. Distinguish no snapshot from unavailable authority for an authorized caller, conceal inaccessible records, and define how revocations and stale scope/version results are handled. Keep persistence and authorization with their existing owners. ADR-016's GitHub workflow surface and PD-036 are separate from this human read; ADR-018 preserves logical ownership, and ADR-020 requires current access on every protected read.

Live GitHub delivery, Service Bus transport and managed inference are outside this run.

## Workflow registration pilot

This isolated development run opens the existing Pipelines, Add Monitored Workflow and Pipeline Detail screens against the real Pipeline controllers and PostgreSQL. It uses the existing signed delegated test identity and explicit GitHub facts double. The catalog shown in onboarding is synthetic and carries no authorization. Ingestion's `GET /api/v1/github/repositories` and `GET /api/v1/github/repositories/{repositoryId}/workflows` require their own delegated audience, a linked GitHub user and current provider facts. This run does not call them or claim live GitHub connectivity.

From the workspace root with the frontend frozen Bun dependencies, Playwright and Chromium installed, Java and Docker available:

```sh
export PIPESOR_REGISTRATION_BROWSER="$PWD/pipesor-frontend/tools/verify_workflow_registration.cjs"
# If Playwright is outside the frontend's node_modules, set PIPESOR_PLAYWRIGHT_MODULE to its installed path.
cd services/pipesor-pipeline-service
./mvnw -B -ntp -Dtest=WorkflowRegistrationBrowserTest,WorkflowOnboardingTests test
```

The test starts Pipeline on loopback and passes a test JWT and synthetic catalog to the browser verifier. The verifier opens the existing inventory, enters the credential, selects a repository and workflow, sets criticality, monitoring, environment and responsible team, and submits. The POST sends provider IDs and operational configuration. Pipeline rechecks the selected repo/workflow, current administrator status, installation eligibility and delegated identity. It creates the workflow and initial grant through its registration service. No workflow rows are seeded, and the test asserts that registration produces no incident.

The registration response takes the user to the existing detail view, which performs its own GET. Detail surfaces effective capabilities and allows a user with CONFIGURE to submit criticality and monitoring changes under the existing policy contract. The server independently rechecks that write. Inventory and detail re-read the persisted record after reload. The verifier then restarts the backend against the same PostgreSQL container and repeats the product read. The token stays in memory while navigating and is entered again on reload. The test checks server-side duplicate, invalid selection/configuration, revoked authority and authority outage, plus the browser error state without fallback fixtures.

Production builds omit the pilot mode. Live discovery requires the separate Ingestion API identity, account linking and runtime approval under ADR-020. The pilot does not change incident or diagnosis access. The proposed historical diagnosis read remains blocked until its provenance guarantees are approved and verified.

Observed on 2026-11-19: all 14 existing WorkflowOnboardingTests and the opt-in browser test passed. Look for `WORKFLOW_REGISTRATION` markers for desktop English creation/policy edit/duplicate/outage and mobile Spanish after backend restart.

## Registered E02 advisor journey

The [registered E02 advisor runbook](https://github.com/pipesor-org/pipesor-evidence-correlation-engine/blob/main/docs/registered-e02-advisor.md) connects the existing workflow registration form to the same replay identity. It also documents how to keep the loopback services open for a live walkthrough and how to open the separately authorized P3 result.
