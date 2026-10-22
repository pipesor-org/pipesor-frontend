/**
 * `history` namespace — English.
 *
 * History workspace copy: header and view switcher. Values preserve the copy
 * authored in the Paper source ("History v1 — Resolved incidents").
 */
const history = {
  title: "History",
  subtitle: "Resolved CI/CD incidents and diagnosis outcomes.",
  demoBadge: "Prototype · Demo data",

  tabs: {
    ariaLabel: "History views",
    incidents: "Incidents",
    insights: "Insights",
    /** Announced for the Insights view, which has no screen yet. */
    insightsUnavailable: "not available yet",
  },

  section: {
    title: "Resolved incidents",
    sort: "Sorted by Resolved ↓",
  },

  searchPlaceholder: "Search incidents",

  filters: {
    dateRange: "Date range",
    repository: "Repository",
    stage: "Stage",
    validation: "Validation",
    assignee: "Assignee",
  },

  columns: {
    incidentWorkflow: "Incident / Pipeline",
    stage: "Stage",
    diagnosis: "Diagnosis",
    validation: "Validation",
    assignee: "Assignee",
    diagnosisTime: "Diagnosis\ntime",
    resolutionTime: "Resolution\ntime",
    resolved: "Resolved",
  },

  hint: "Select a row to open its Incident Workspace in historical view.",

  unassigned: "Unassigned",

  empty: "No resolved incidents.",
} as const;

export default history;
