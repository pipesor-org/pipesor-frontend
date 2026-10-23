const pipelines = {
  demoBadge: "Prototype · Demo data",
  backToPipelines: "← Back to Pipelines",
  inventory: {
    title: "Pipelines", subtitle: "Monitored GitHub Actions workflows and operational policies.",
    heading: "Monitored workflows", add: "Add monitored workflow",
    addUnavailable: "Adding workflows is not available yet.",
    search: "Search pipelines", criticality: "Criticality", team: "Responsible team", monitoring: "Monitoring",
    workflow: "Pipeline / Workflow", repository: "Repository", environment: "Environment",
    empty: "No monitored workflows match your search and filters.", reset: "Reset filters",
    results_one: "{{count}} monitored workflow shown.", results_other: "{{count}} monitored workflows shown.",
    hint: "Select a workflow to view its operational context.",
  },
  demoContext: "Read-only demonstration · Synthetic workflow catalog, not a live GitHub connection.",
  identity: {
    title: "Identity",
    description: "Read-only GitHub context. Workflow code remains in GitHub.",
    repository: "Repository", workflow: "Workflow", file: "Workflow file",
    branch: "Default branch", provider: "Provider",
    linksUnavailable: "GitHub links are unavailable: no destinations are supplied for these demonstration records.",
  },
  policy: {
    title: "Operational policy", criticality: "Criticality", monitoring: "Monitoring",
    environment: "Operational environment", unspecified: "Not specified",
    description: "Pipesor-managed context. Criticality is not incident severity; environment is not a GitHub Environment or branch filter.",
    monitoringNote: "Active/Paused controls AIOps monitoring, not GitHub execution. Monitoring covers authorized runs across branches; the default branch is informational only.",
  },
  ownership: {
    title: "Ownership", team: "Responsible team", owners: "Pipeline owners",
    unspecified: "Not specified",
    note: "Operational ownership does not assign incidents or grant GitHub permissions.",
  },
  access: {
    title: "Access", note: "Illustrative capability examples only — not effective permissions for this pipeline.",
    role: "Example role / team", capability: "Capability", description: "Description",
    lead: "Technical Lead", administrators: "Pipeline Administrators",
    operate: "Operate", view: "View", configure: "Configure",
    operateDescription: "Take incidents, start remediation, resolve and validate diagnoses.",
    viewDescription: "Consult authorized pipelines, incidents, diagnoses and evidence.",
    configureDescription: "Change criticality, ownership and operational configuration.",
  },
  update: {
    title: "Last configuration update", empty: "No configuration-update data is supplied for this demonstration record.",
    note: "Seeded workflow examples are not audit events. No local-session changes or durable configuration history are recorded in this read-only view.",
  },
  criticality: { Critical: "Critical", High: "High", Medium: "Medium", Low: "Low" },
  monitoring: { Active: "Active", Paused: "Paused" },
  environment: { Production: "Production", QA: "QA", Development: "Development" },
} as const;

export default pipelines;
