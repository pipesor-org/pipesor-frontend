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
    hint: "Select a row to review evidence and validate its diagnosis in Incident Workspace.",
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
