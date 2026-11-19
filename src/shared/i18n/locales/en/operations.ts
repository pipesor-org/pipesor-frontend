/**
 * `operations` namespace — English.
 *
 * Operations workspace copy: header, queue tabs, summaries, filters, tables and
 * the presentation labels for the Incident domain enumerations. Values preserve
 * the copy authored in the Paper source.
 */
const operations = {
  title: "Operations",
  demoBadge: "Prototype · Demo data",

  diagnosticReview: {
    generated: "Original generated hypothesis",
    title: "Human review",
    version: "Diagnosis version {{version}}",
    PENDING: "Pending review",
    CONFIRMED: "Confirmed",
    CORRECTED: "Corrected",
    REJECTED: "Rejected",
    newReview: "Record a review",
    decision: "Decision",
    justification: "Justification",
    actualCause: "Corrected cause",
    correctedRecommendation: "Corrected recommendation (optional)",
    save: "Save review",
    saved: "Review saved.",
    failed: "The review could not be saved.",
    conflict: "Another review was saved. Load the diagnosis again before submitting.",
    history: "Review history",
  },
  pilot: {
    title: "Active incidents · Local pilot",
    badge: "Local pilot · Persisted operations",
    description: "Read controlled replay records from Pipeline using the local test identity.",
    token: "Pipeline access token",
    load: "Load incidents",
    loading: "Loading operations…",
    denied: "Access to the operational record was denied.",
    unavailable: "Operational records are unavailable. The pilot supports fewer than 25 pipelines and incidents per pipeline.",
    empty: "No active incidents in the authorized pilot scope.",
    diagnosisBlocked: "Diagnosis lookup is unavailable for this operational view.",
    status: { OPEN: "Open", IN_REMEDIATION: "In remediation", VERIFICATION: "Verification", RESOLVED: "Resolved" },
  },
  workspace: {
    validation: "Diagnosis validation",
    backOperations: "Back to Operations",
    backHistory: "Back to History",
    notFound: "Incident unavailable",
    notFoundDescription: "This incident identifier has no supported record in this view.",
    replay: "Local replay · persisted diagnosis",
    replayDescription: "Controlled replay using the local review service. Operational incident data are unavailable in this view.",
    inference: "AIOps inference",
    evidence: "Observed evidence",
    paperEvidence: "Synthetic evidence from the Paper prototype.",
    evidenceUnavailable: "Evidence is unavailable for this demo incident.",
    recommendation: "Recommended action",
    paperRecommendation: "Review the React and react-dom versions introduced in PR #418 and align compatible versions before rerunning Build and test.",
    recommendationUnavailable: "A recommendation is unavailable for this demo incident.",
    fixtureReview: "This demo shows the recorded status only.",
    details: "Incident details",
    workflow: "Workflow",
    timing: "Timing",
    diagnosisTime: "Time to diagnosis",
    resolutionTime: "Time to resolution",
    timeline: "Timeline",
    timelineUnavailable: "Activity timestamps are unavailable for this demo incident.",
    denied: "Access to this replay diagnosis was denied.",
    operationalUnavailable: "The replay review endpoint supplies identifiers and diagnostic history. Operational status, run details and incident activity require an authorized Pipeline read.",
  },
  diagnosticDemo: {
    replayTitle: "Local replay diagnosis",
    replayDescription: "This view uses replayed evidence and an authorized test identity. The review is saved in PostgreSQL.",
    title: "Diagnostic demonstration",
    description: "Retrieve the synthetic diagnosis from the running local Recommendation service.",
    choose: "Local access token",
    load: "Load diagnosis",
    loading: "Retrieving diagnosis",
    invalid: "The service returned an invalid diagnosis or unmatched citations.",
    unauthenticated: "The access token was rejected.",
    unavailable: "The diagnostic service is unavailable. Try again.",
    result: "Diagnostic result",
    cause: "Probable cause",
    recommendation: "Recommendation",
    limitations: "Limitations",
    evidence: "Supporting evidence",
    incident: "Incident ID",
    context: "Context ID",
    correlation: "Correlation ID",
    execution: "Execution ID",
    origin: "Origin context ID",
    sources: "Retrieved sources",
    document: "Document ID",
    chunk: "Chunk ID",
    noSources: "No retrieved sources.",
  },

  tabs: {
    ariaLabel: "Incident queues",
    activeIncidents: "Active incidents",
    needsValidation: "Needs validation",
  },

  /** Column headers, shared vocabulary between the two queue tables. */
  table: {
    severity: "Severity",
    incidentWorkflow: "Incident / Workflow",
    stage: "Stage",
    diagnosis: "Diagnosis",
    proposedDiagnosis: "Proposed diagnosis",
    status: "Status",
    assignee: "Assignee",
    elapsed: "Elapsed",
    resolved: "Resolved",
    validation: "Validation",
    assignToMe: "Assign to me",
    unassigned: "Unassigned",
  },

  /**
   * Presentation labels for the Incident domain enumerations. The domain keeps
   * its canonical tokens; these keys are mapped in `entities/incident/ui`.
   */
  severity: {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  },
  status: {
    open: "Open",
    inRemediation: "In remediation",
    verification: "Verification",
    resolved: "Resolved",
  },
  validationStatus: {
    notApplicable: "Not applicable",
    pending: "Pending",
    confirmed: "Confirmed",
    rejected: "Rejected",
  },
  stage: {
    deployment: "Deployment",
    infrastructure: "Infrastructure",
    testing: "Testing",
    qualityGate: "Quality Gate",
    container: "Container",
    build: "Build",
  },

  filters: {
    severity: "Severity",
    repository: "Repository",
    stage: "Stage",
    status: "Status",
    assignee: "Assignee",
    resolvedDate: "Resolved date",
  },

  active: {
    subtitle:
      "Triage and manage CI/CD incidents across your monitored GitHub Actions workflows.",
    hint: "Select a row to open its Incident Workspace.",
    searchPlaceholder: "Search incidents or workflows…",
    sortLabel: "Severity ↓ · Elapsed ↓",
    summary: {
      ariaLabel_one: "Incident summary: {{count}} active incident",
      ariaLabel_other: "Incident summary: {{count}} active incidents",
      active: "Active incidents",
      analyzing: "Analyzing",
    },
  },

  validation: {
    subtitle:
      "Review resolved CI/CD incidents awaiting human diagnosis validation.",
    hint: "Select an incident ID to inspect its diagnosis and validation status.",
    searchPlaceholder: "Search incidents…",
    sortLabel: "Oldest pending first",
    summary: {
      ariaLabel_one: "Validation summary: {{count}} incident pending validation",
      ariaLabel_other:
        "Validation summary: {{count}} incidents pending validation",
      pending: "Pending validation",
      oldestPending: "Oldest pending",
    },
    pendingFor: "{{duration}} pending",
    empty: {
      title: "No diagnoses pending validation",
      text: "All resolved incidents requiring diagnosis review have been validated.",
    },
  },

  snapshot: "Demo snapshot · {{timestamp}}",
} as const;

export default operations;
