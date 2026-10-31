// Pipeline vocabulary is independent of incident severity and execution state.
export const PIPELINE_CRITICALITIES = ["Critical", "High", "Medium", "Low"] as const;
export const PIPELINE_MONITORING_STATUSES = ["Active", "Paused"] as const;
// Demonstration classifications, not GitHub Environments or an enterprise taxonomy.
export const DEMO_OPERATIONAL_ENVIRONMENTS = ["Production", "QA", "Development"] as const;
