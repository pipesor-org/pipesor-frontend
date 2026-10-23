// Run with: bun src/pages/add-monitored-workflow/model/draft.check.ts
import { monitoredPipelines, syntheticWorkflowCatalog } from "../../../entities/monitored-pipeline";
import { availableWorkflows, changeRepository, createEmptyDraft, demoOwners, demoRepositories, demoTeams, selectedWorkflow, validateDraft, type DraftField } from "./draft";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const snapshot = JSON.stringify([monitoredPipelines, syntheticWorkflowCatalog]);
const empty = createEmptyDraft();
const required: DraftField[] = ["repository", "workflowPath", "criticality", "monitoringStatus", "responsibleTeam"];
assert(Object.keys(validateDraft(empty)).length === 5, "Blank form must require exactly the five approved fields");
assert(required.every((field) => validateDraft(empty)[field] === "required"), "Required-field validation failed");
assert(!selectedWorkflow(empty) && availableWorkflows("").length === 0, "Blank draft must not infer a workflow");
assert(demoRepositories.length === 8 && demoTeams.length === 3 && demoOwners.length === 2, "Choices must derive from existing examples");
const valid = {
  ...empty, repository: "acme/reporting-service", workflowPath: ".github/workflows/integration-checks.yml",
  criticality: "Medium", monitoringStatus: "Active", responsibleTeam: "Web Platform",
};
assert(Object.keys(validateDraft(valid)).length === 0, "Optional environment/owners must be omittable");
assert(selectedWorkflow(valid)?.workflowName === "Integration checks" && selectedWorkflow(valid)?.defaultBranch === "main", "Metadata must come from the selected catalog workflow");
const complete = { ...valid, operationalEnvironment: "QA", pipelineOwners: ["Maya Patel", "Alex Chen"] };
assert(Object.keys(validateDraft(complete)).length === 0, "Approved demonstration choices must be valid");
for (const field of required) {
  assert(validateDraft({ ...complete, [field]: "" })[field] === "required", `Cleared ${field} must be required`);
}
const changed = changeRepository(complete, "acme/payments-api");
assert(changed.workflowPath === "" && !selectedWorkflow(changed), "Repository change must clear workflow and derived metadata");
assert(changed.criticality === "Medium" && changed.monitoringStatus === "Active" && changed.operationalEnvironment === "QA", "Repository change must preserve policy choices");
assert(changed.responsibleTeam === "Web Platform" && changed.pipelineOwners === complete.pipelineOwners, "Repository change must preserve ownership choices");
assert(complete.repository === "acme/reporting-service", "Changing a draft must not mutate the previous draft");
assert(availableWorkflows("acme/payments-api").every(({ repository }) => repository === "acme/payments-api"), "Repository-dependent workflow choices leaked");
const malformed = [
  { ...valid, repository: "unknown/repository" },
  { ...valid, workflowPath: ".github/workflows/deploy-production.yml" },
  { ...valid, criticality: "Urgent" },
  { ...valid, monitoringStatus: "Running" },
  { ...valid, operationalEnvironment: "Unknown" },
  { ...valid, responsibleTeam: "Unknown team" },
  { ...valid, pipelineOwners: ["Unknown owner"] },
];
assert(malformed.every((draft) => Object.keys(validateDraft(draft)).length > 0), "Unavailable choices or invalid domain values were accepted");
assert(createEmptyDraft().pipelineOwners !== createEmptyDraft().pipelineOwners, "Reopening must create fresh owner arrays");
assert(JSON.stringify([monitoredPipelines, syntheticWorkflowCatalog]) === snapshot, "Form helpers mutated existing demonstration records");
console.log("Add monitored workflow draft checks passed");
