// Run with: bun src/entities/monitored-pipeline/model/schema.check.ts
import {
  monitoredPipelines,
  monitoredPipelineSchema,
  monitoredPipelinesSchema,
  selectMonitoredPipelineById,
  syntheticWorkflowCatalog,
  syntheticWorkflowCatalogSchema,
} from "../index";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

assert(monitoredPipelines.length === 7, "Expected the seven approved inventory records");
assert(monitoredPipelinesSchema.safeParse(monitoredPipelines).success, "Invalid inventory");
assert(syntheticWorkflowCatalog.length === 8, "Expected inventory plus onboarding catalog entry");
assert(syntheticWorkflowCatalogSchema.safeParse(syntheticWorkflowCatalog).success, "Invalid catalog");
const keys = syntheticWorkflowCatalog.map((workflow) => `${workflow.repository.toLowerCase()}/${workflow.workflowPath}`);
assert(new Set(keys).size === keys.length, "Duplicate catalog registration keys");
assert(new Set(monitoredPipelines.map(({ id }) => id)).size === 7, "Duplicate pipeline IDs");
for (const pipeline of monitoredPipelines) {
  assert(syntheticWorkflowCatalog.some((workflow) =>
    workflow.repository === pipeline.github.repository &&
    workflow.workflowPath === pipeline.github.workflowPath &&
    workflow.workflowName === pipeline.github.workflowName &&
    workflow.defaultBranch === pipeline.github.defaultBranch,
  ), "Inventory reference missing from synthetic catalog");
}
assert(syntheticWorkflowCatalog.some((workflow) =>
  workflow.repository === "acme/reporting-service" &&
  workflow.workflowName === "Integration checks" &&
  workflow.workflowPath === ".github/workflows/integration-checks.yml" &&
  workflow.defaultBranch === "main",
), "Missing approved onboarding example");

const first = monitoredPipelines[0];
const optionalFieldsAbsent = {
  ...first,
  policy: { criticality: "Medium", monitoringStatus: "Paused" },
  ownership: { responsibleTeam: "Web Platform" },
};
assert(monitoredPipelineSchema.safeParse(optionalFieldsAbsent).success, "Optional fields must be omittable");
assert(monitoredPipelineSchema.safeParse({ ...first, ownership: { ...first.ownership, pipelineOwners: [] } }).success, "Empty optional owners must be valid");
const malformedRecords = [
  { ...first, id: first.slug },
  { ...first, slug: "" },
  { ...first, unexpected: true },
  { ...first, policy: { ...first.policy, criticality: "Urgent" } },
  { ...first, policy: { ...first.policy, monitoringStatus: "Running" } },
  { ...first, policy: { ...first.policy, operationalEnvironment: "Staging" } },
  { ...first, policy: { ...first.policy, operationalEnvironment: null } },
  { ...first, policy: { ...first.policy, branchFilter: "main" } },
  { ...first, ownership: { pipelineOwners: [] } },
  { ...first, ownership: { ...first.ownership, responsibleTeam: "  " } },
  { ...first, ownership: { ...first.ownership, pipelineOwners: [""] } },
  { ...first, ownership: { ...first.ownership, pipelineOwners: null } },
  { ...first, ownership: { ...first.ownership, permissions: ["Configure"] } },
  { ...first, github: { ...first.github, repository: "payments-api" } },
  { ...first, github: { ...first.github, workflowPath: "deploy-production.yml" } },
  { ...first, github: { ...first.github, workflowPath: ".github/workflows/../deploy.yml" } },
  { ...first, github: { ...first.github, workflowName: " " } },
  { ...first, github: { ...first.github, defaultBranch: "" } },
  { ...first, github: { ...first.github, connected: true } },
  { ...first, github: null },
];
for (const record of malformedRecords) {
  assert(!monitoredPipelineSchema.safeParse(record).success, "Malformed pipeline was accepted");
}
const second = monitoredPipelines[1];
for (const pipeline of monitoredPipelines) {
  assert(selectMonitoredPipelineById(pipeline.id) === pipeline, "Stable ID lookup returned the wrong record");
  assert(selectMonitoredPipelineById(pipeline.slug) === undefined, "Slug must not resolve as identity");
}
for (const id of [undefined, "", "new", "unknown", "b8c63000-0000-4000-8000-000000000099"]) {
  assert(selectMonitoredPipelineById(id) === undefined, "Unknown ID must not fall back to another record");
}
assert(selectMonitoredPipelineById(first.id, []) === undefined, "Empty collection must not fall back to fixtures");
assert(!monitoredPipelinesSchema.safeParse([first, { ...second, id: first.id }]).success, "Duplicate IDs accepted");
assert(!monitoredPipelinesSchema.safeParse([first, {
  ...second, github: { ...first.github, repository: "ACME/payments-api" },
  policy: { ...second.policy, monitoringStatus: "Paused" },
}]).success, "Duplicate workflow accepted despite Paused monitoring");
assert(monitoredPipelinesSchema.safeParse([first, { ...second, slug: first.slug }]).success, "Slug must not determine identity");
assert(Object.isFrozen(first) && Object.isFrozen(first.github), "Identity/source reference must be immutable");
function checkReadonlyTypes() {
  // @ts-expect-error Pipeline identity cannot be reassigned.
  first.id = second.id;
  // @ts-expect-error GitHub reference cannot be replaced.
  first.github = second.github;
  // @ts-expect-error GitHub metadata is read-only.
  first.github.defaultBranch = "another-branch";
}
void checkReadonlyTypes; // Typechecked, never executed against the fixtures.
console.log("Monitored pipeline schema and demonstration checks passed");
