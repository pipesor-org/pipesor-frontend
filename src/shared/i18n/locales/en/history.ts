/**
 * `history` namespace — English.
 *
 * History workspace copy: header, view switcher, the resolved-incident table
 * and Insights.
 */
const history = {
  title: "History",
  subtitle: "Resolved CI/CD incidents and diagnosis outcomes.",

  tabs: {
    ariaLabel: "History views",
    incidents: "Incidents",
    insights: "Insights",
  },

  section: {
    title: "Resolved incidents",
    sort: "Sorted by Resolved ↓",
  },

  settling: "Loading diagnoses for the resolved incidents…",
  loadMore: "Load more resolved incidents",

  insights: {
    scope_one: "Last {{days}} days ({{range}}) · Calculated over {{countFormatted}} resolved incident of {{loaded}} loaded.",
    scope_other: "Last {{days}} days ({{range}}) · Calculated over {{countFormatted}} resolved incidents of {{loaded}} loaded.",
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
    stage: {
      title: "Incidents by stage",
      caption: "Incidents",
    },
    outcome: {
      title: "Diagnosis outcome",
      validated_one: "{{countFormatted}} validated diagnosis",
      validated_other: "{{countFormatted}} validated diagnoses",
      value: "{{incidents}} · {{percent}}",
      rejected: "Rejected",
      note: "Confirmation rate counts human reviews: Rejected includes rejections with an actual cause; pending reviews are excluded. It is not a model-accuracy measure. Percentages are rounded.",
    },
    recurring: {
      title: "Incident concentration by pipeline",
      caption: "Grouped by pipeline and stage",
      captionTruncated:
        "Grouped by pipeline and stage · Showing {{shown}} of {{total}}",
      pipelineUnavailable: "Pipeline details unavailable",
    },
  },

  filters: {
    pipeline: "Pipeline",
  },

  columns: {
    incidentWorkflow: "Incident / Pipeline",
    stage: "Stage",
    diagnosis: "Diagnosis",
    validation: "Validation",
    diagnosisTime: "Diagnosis\ntime",
    resolutionTime: "Resolution\ntime",
    resolved: "Resolved",
  },

  hint: "Select an incident to open its Incident Workspace in historical view.",
  noDiagnosis: "No diagnosis",
  empty: "No resolved incidents yet.",
} as const;

export default history;
