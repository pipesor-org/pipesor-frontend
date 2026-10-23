import {
  githubWorkflowReferenceSchema,
  monitoredPipelines,
  operationalPolicySchema,
  pipelineOwnershipSchema,
  syntheticWorkflowCatalog,
} from "../../../entities/monitored-pipeline";

export const demoRepositories = [...new Set(syntheticWorkflowCatalog.map(({ repository }) => repository))];
export const demoTeams = [...new Set(monitoredPipelines.map(({ ownership }) => ownership.responsibleTeam))];
export const demoOwners = [...new Set(monitoredPipelines.flatMap(({ ownership }) => ownership.pipelineOwners ?? []))];

export function createEmptyDraft() {
  return {
    repository: "", workflowPath: "", criticality: "", monitoringStatus: "",
    operationalEnvironment: "", responsibleTeam: "", pipelineOwners: [] as string[],
  };
}
export type WorkflowDraft = ReturnType<typeof createEmptyDraft>;
export type DraftField = keyof WorkflowDraft;
type DraftError = "required" | "invalid";

export function changeRepository(draft: WorkflowDraft, repository: string): WorkflowDraft {
  return { ...draft, repository, workflowPath: "" };
}

export function availableWorkflows(repository: string) {
  return syntheticWorkflowCatalog.filter((workflow) => workflow.repository === repository);
}

export function selectedWorkflow(draft: WorkflowDraft) {
  return availableWorkflows(draft.repository).find((workflow) => workflow.workflowPath === draft.workflowPath);
}

// Form-input validation only; this does not register a record or define an API payload.
export function validateDraft(draft: WorkflowDraft): Partial<Record<DraftField, DraftError>> {
  const errors: Partial<Record<DraftField, DraftError>> = {};
  if (!demoRepositories.includes(draft.repository)) errors.repository = draft.repository ? "invalid" : "required";
  if (!githubWorkflowReferenceSchema.safeParse(selectedWorkflow(draft)).success) {
    errors.workflowPath = draft.workflowPath ? "invalid" : "required";
  }
  if (!operationalPolicySchema.shape.criticality.safeParse(draft.criticality).success) {
    errors.criticality = draft.criticality ? "invalid" : "required";
  }
  if (!operationalPolicySchema.shape.monitoringStatus.safeParse(draft.monitoringStatus).success) {
    errors.monitoringStatus = draft.monitoringStatus ? "invalid" : "required";
  }
  if (!operationalPolicySchema.shape.operationalEnvironment.safeParse(draft.operationalEnvironment || undefined).success) {
    errors.operationalEnvironment = "invalid";
  }
  if (!pipelineOwnershipSchema.shape.responsibleTeam.safeParse(draft.responsibleTeam).success) {
    errors.responsibleTeam = "required";
  } else if (!demoTeams.includes(draft.responsibleTeam)) errors.responsibleTeam = "invalid";
  if (!pipelineOwnershipSchema.shape.pipelineOwners.safeParse(draft.pipelineOwners).success ||
    draft.pipelineOwners.some((owner) => !demoOwners.includes(owner))) errors.pipelineOwners = "invalid";
  return errors;
}
