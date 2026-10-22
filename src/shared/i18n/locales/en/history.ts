/**
 * `history` namespace — English.
 *
 * History workspace copy: header, view switcher, both views' filters and the
 * Insights summary. Values preserve the copy authored in the Paper source
 * ("History v1 — Resolved incidents", "History — Insights v1").
 */
const history = {
  title: "History",
  subtitle: "Resolved CI/CD incidents and diagnosis outcomes.",
  demoBadge: "Prototype · Demo data",

  tabs: {
    ariaLabel: "History views",
    incidents: "Incidents",
    insights: "Insights",
  },

  section: {
    title: "Resolved incidents",
    sort: "Sorted by Resolved ↓",
  },

  searchPlaceholder: "Search incidents",

  filters: {
    dateRange: "Date range",
    dateRangeValue: "Date range: {{range}}",
    repository: "Repository",
    pipeline: "Pipeline",
    stage: "Stage",
    validation: "Validation",
    assignee: "Assignee",
    severity: "Severity",
  },

  insights: {
    summary: {
      meanDiagnosis: "Mean diagnosis time",
      meanResolution: "Mean time to resolution (MTTR)",
      confirmationRate: "Diagnosis confirmation rate",
      resolvedIncidents: "Resolved incidents",
      noData: "No data",
    },
    trend: {
      title: "Mean diagnosis time over time",
      caption: "{{range}} · Weekly means",
      bucket: "{{date}}: {{value}}",
    },
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
