/**
 * `operations` namespace — English.
 *
 * Copy for the Operations queues, the Incident Workspace and diagnosis review,
 * plus the Incident domain labels shared with History.
 */
const operations = {
  title: "Operations",

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
    elapsed: "Elapsed",
    resolved: "Resolved",
    validation: "Validation",
    pipelineUnavailable: "Pipeline details unavailable",
  },

  /**
   * Presentation labels for the Incident domain enumerations. The domain keeps
   * its canonical tokens; these keys are mapped in `entities/incident/ui`.
   */
  severity: {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    unclassified: "Not classified",
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

  diagnosis: {
    status: {
      pending: "Pending",
      confirmed: "Confirmed",
      corrected: "Rejected · corrected",
      rejected: "Rejected",
    },
    loading: "Loading diagnosis…",
    analyzing: "Analyzing…",
    unavailable: "Diagnosis unavailable",
  },

  queue: {
    loading: "Loading incidents…",
    error: "Incidents could not be loaded.",
    retry: "Try again",
    refresh: "Refresh",
    updated: "Updated {{time}}",
    loadMore: "Load more",
    loadingMore: "Loading…",
    moreAvailable: "{{value}}+",
    errorCode: "Code {{code}} · reference {{reference}}",
  },

  active: {
    subtitle:
      "Triage and manage CI/CD incidents across your monitored GitHub Actions workflows.",
    hint: "Select an incident to open its Incident Workspace.",
    summary: {
      ariaLabel_one: "Incident summary: {{count}} active incident",
      ariaLabel_other: "Incident summary: {{count}} active incidents",
      active: "Active incidents",
      analyzing: "Analyzing",
    },
    empty: {
      title: "No active incidents",
      text: "Failed runs of your monitored workflows appear here once Pipesor records them.",
    },
  },

  validation: {
    subtitle:
      "Review resolved CI/CD incidents awaiting human diagnosis validation.",
    hint: "Select an incident to review its evidence and validate its diagnosis.",
    summary: {
      ariaLabel_one: "Validation summary: {{count}} incident pending validation",
      ariaLabel_other:
        "Validation summary: {{count}} incidents pending validation",
      pending: "Pending validation",
      oldestPending: "Oldest pending",
    },
    pendingFor: "{{duration}} pending",
    scope_one: "Built from the most recent resolved incident loaded.",
    scope_other: "Built from the {{count}} most recent resolved incidents loaded.",
    loadMore: "Load more resolved incidents",
    empty: {
      title: "No diagnoses pending validation",
      text: "No loaded resolved incident has a diagnosis waiting for review.",
    },
  },

  workspace: {
    backOperations: "Back to Operations",
    backHistory: "Back to History",
    loading: "Loading incident…",
    notFound: "Incident not found",
    notFoundText: "This incident does not exist or you do not have access to its pipeline.",
    loadError: "The incident could not be loaded.",
    retry: "Try again",
    runTitle: "Run #{{runId}}",
    attempt: "attempt {{attempt}}",
    viewRun: "View run in GitHub",
    opensInNewTab: "(opens in a new tab)",
    inference: {
      eyebrow: "AIOps inference · model output",
      probableCause: "Probable cause",
      limitations: "Limitations",
      model: "Model: {{model}}",
      version: "Diagnosis version {{version}} · {{time}}",
    },
    evidence: {
      title: "Observed evidence",
      note: "Sanitized excerpts from the failed run's logs. These are observations, not conclusions.",
      count_one: "{{count}} signal",
      count_other: "{{count}} signals",
      cited: "Cited by the diagnosis",
      lines: "lines {{from}}–{{to}}",
      line: "line {{from}}",
      viewContext: "View context",
      hideContext: "Hide context",
      empty: "No observed evidence was attached to this diagnosis.",
      unknownStage: "Unknown stage",
    },
    sources: {
      title: "Retrieved knowledge (RAG)",
      note: "Knowledge-base passages retrieved to inform the inference.",
      cited: "Cited",
      unnamed: "Unnamed source",
      empty: "No knowledge-base passages were retrieved for this diagnosis.",
    },
    recommendation: {
      title: "Recommended action",
      note: "AIOps recommendation. Changes are made by people in GitHub; Pipesor does not apply them.",
      empty: "The diagnosis does not include a recommendation.",
    },
    analysis: {
      title: "Analysis in progress",
      text: "Pipesor is still correlating evidence for this incident. The diagnosis appears here when it is ready.",
      error: "The diagnosis could not be loaded.",
    },
    details: {
      title: "Incident details",
      incident: "Incident",
      repository: "Repository",
      workflow: "Workflow",
      stage: "Stage",
      run: "Run",
      branch: "Branch",
      commit: "Commit",
      unavailable: "Unavailable",
    },
    ownership: {
      title: "Ownership",
      team: "Responsible team",
    },
    timing: {
      title: "Timing",
      detected: "Detected",
      timeToDiagnosis: "Time to diagnosis",
      elapsed: "Elapsed",
      timeToResolution: "Time to resolution",
    },
    timeline: {
      title: "Timeline",
      detected: "Incident detected",
      diagnosisReady: "Diagnosis ready",
      remediationStarted: "Remediation started",
      verificationStarted: "Verification started",
      resolved: "Incident resolved",
    },
  },

  lifecycle: {
    title: "Remediation and verification",
    needsOperate: "You need the Operate capability on this pipeline to record remediation, verification or resolution.",
    submitting: "Recording…",
    recorded: "Change recorded.",
    resolve: "Resolve incident",
    resolvedAt: "Incident resolved {{time}}.",
    validationIndependent: "Resolution is an operational decision; the diagnosis is validated separately below.",
    remediation: {
      text: "Records the start of your intervention. Changes are made by people in GitHub, not by Pipesor.",
      start: "Start remediation",
      startedAt: "Remediation started {{time}}. Fix the workflow in GitHub and rerun it.",
    },
    verification: {
      pickTitle: "Choose the verification run",
      pickText: "Successful runs of this workflow that started after remediation began. The run you choose is recorded as verification.",
      loadingRuns: "Loading successful runs…",
      runsError: "Successful runs could not be loaded from GitHub.",
      noRuns: "No successful run started after remediation began yet. Rerun the workflow in GitHub, then refresh.",
      pipelineUnavailable: "The pipeline could not be loaded, so its runs cannot be listed.",
      record: "Record verification",
      linking: "Linking the run to the incident…",
      phase: {
        ACCEPTED: "Run capture requested…",
        PREPARING: "Capturing the run…",
        PUBLISHED: "Run captured.",
        BLOCKED: "Run capture was blocked.",
      },
      run: "Verification run",
      success: "Success",
      failed: "Failed",
      observed: "Observed in GitHub Actions. Resolving is a separate human decision; diagnosis validation stays independent.",
      notSuccessful: "The linked verification run did not succeed, so the incident cannot be resolved with it.",
    },
    errors: {
      forbidden: "You need the Operate capability on this pipeline for this action.",
      conflict: "The incident changed or the run does not qualify (it must start after remediation began). The incident was reloaded.",
      notFound: "The incident or the run is no longer available.",
      invalid: "The request was not accepted.",
      network: "Pipesor could not be reached. Try again.",
      captureScopePending: "Monitoring for this workflow is not active yet, so the run cannot be captured.",
      captureForbidden: "Capturing a run requires administrator access to the repository in GitHub.",
      captureTimeout: "Capturing the run is taking longer than expected. Try again in a moment; the request is kept.",
      blocked: "The run capture was blocked because the workflow's monitoring scope changed.",
      generic: "The change could not be recorded.",
    },
  },

  review: {
    title: "Diagnosis validation",
    intro: "Review the original diagnosis and the observed evidence before recording whether the proposed cause was correct.",
    question: "Did the AIOps diagnosis correctly identify the cause of this incident?",
    confirm: "Confirm diagnosis",
    reject: "Reject diagnosis",
    actualCause: "Actual cause",
    actualCauseHint: "Describe what actually caused the failure. The original diagnosis is kept unchanged.",
    notes: "Notes",
    notesHint: "Optional. Line breaks are sent as spaces.",
    required: "(required)",
    optional: "(optional)",
    cancel: "Cancel",
    submitConfirm: "Record confirmation",
    submitReject: "Submit rejection",
    submitting: "Recording…",
    recorded: "Review recorded.",
    loading: "Loading review history…",
    loadError: "The review history could not be loaded.",
    history: "Review history",
    revision: "Revision {{revision}}",
    decision: {
      CONFIRMED: "Confirmed",
      CORRECTED: "Rejected with actual cause",
      REJECTED: "Rejected",
    },
    reviewedActualCause: "Actual cause: {{cause}}",
    errors: {
      missingCause: "Enter the actual cause.",
      tooLong: "Use at most {{max}} characters.",
      forbidden: "You need the Operate capability on this pipeline to review diagnoses.",
      conflict: "This diagnosis was reviewed in the meantime. The latest history is shown below; check it before deciding again.",
      stale: "A newer diagnosis version exists. Reload the incident to review it.",
      invalid: "The review was not accepted. Check the fields and try again.",
      network: "Recommendation could not be reached. Try again.",
      generic: "The review could not be recorded.",
    },
  },
} as const;

export default operations;
