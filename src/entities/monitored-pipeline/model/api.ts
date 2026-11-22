import { z } from "zod";

import { apiRequest, createRequestCache } from "../../../shared/api";

/**
 * `PipelineView` from Pipeline (`GET /api/v1/pipelines/{id}`): the registered
 * GitHub workflow, its operational policy and the caller's effective
 * capabilities. Only the fields the dashboard renders are kept.
 */
const pipelineViewSchema = z.object({
  id: z.guid(),
  githubRepositoryId: z.string().regex(/^[1-9][0-9]*$/),
  fullName: z.string().min(1),
  defaultBranch: z.string().nullish(),
  githubWorkflowId: z.string().regex(/^[1-9][0-9]*$/),
  workflowName: z.string().nullish(),
  workflowFile: z.string().nullish(),
  environment: z.string().nullish(),
  criticality: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  monitoringStatus: z.enum(["ACTIVE", "PAUSED"]),
  responsibleTeamNameSnapshot: z.string().nullish(),
  createdAt: z.iso.datetime({ offset: true }).nullish(),
  effectiveCapabilities: z.array(z.enum(["VIEW", "OPERATE", "CONFIGURE"])).default([]),
});

export type PipelineRecord = z.infer<typeof pipelineViewSchema>;
export type PipelineCapability = PipelineRecord["effectiveCapabilities"][number];

const pipelines = createRequestCache<PipelineRecord>();

/** Reads a pipeline once per session; several incident rows share it. */
export function getPipeline(id: string): Promise<PipelineRecord> {
  return pipelines.get(id, () =>
    apiRequest("pipeline", { path: `/api/v1/pipelines/${encodeURIComponent(id)}`, schema: pipelineViewSchema }),
  );
}

/** Drops a cached pipeline, e.g. after its grants or policy change. */
export function invalidatePipeline(id: string): void {
  pipelines.delete(id);
}

/** Workflow label: GitHub workflow name, else its file name. */
export function pipelineWorkflowLabel(pipeline: Pick<PipelineRecord, "workflowName" | "workflowFile">): string | null {
  return pipeline.workflowName?.trim() || pipeline.workflowFile?.split("/").pop() || null;
}
