import { z } from "zod";

import { apiRequest, createRequestCache, offsetPageSchema } from "../../../shared/api";

export const PIPELINE_CRITICALITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type PipelineCriticality = (typeof PIPELINE_CRITICALITIES)[number];
export const PIPELINE_MONITORING_STATUSES = ["ACTIVE", "PAUSED"] as const;
export type PipelineMonitoringStatus = (typeof PIPELINE_MONITORING_STATUSES)[number];
export const PIPELINE_CAPABILITIES = ["VIEW", "OPERATE", "CONFIGURE"] as const;
export type PipelineCapability = (typeof PIPELINE_CAPABILITIES)[number];

/**
 * `PipelineView` from Pipeline: the registered GitHub workflow, its
 * operational policy and the caller's effective capabilities.
 */
export const pipelineViewSchema = z.object({
  id: z.guid(),
  githubRepositoryId: z.string().regex(/^[1-9][0-9]*$/),
  fullName: z.string().min(1),
  defaultBranch: z.string().nullish(),
  githubWorkflowId: z.string().regex(/^[1-9][0-9]*$/),
  workflowName: z.string().nullish(),
  workflowFile: z.string().nullish(),
  environment: z.string().nullish(),
  criticality: z.enum(PIPELINE_CRITICALITIES),
  monitoringStatus: z.enum(PIPELINE_MONITORING_STATUSES),
  responsibleTeamNameSnapshot: z.string().nullish(),
  createdAt: z.iso.datetime({ offset: true }).nullish(),
  effectiveCapabilities: z.array(z.enum(PIPELINE_CAPABILITIES)).default([]),
});

export type PipelineRecord = z.infer<typeof pipelineViewSchema>;

const pipelines = createRequestCache<PipelineRecord>();

/** Reads a pipeline once per session; several incident rows share it. */
export function getPipeline(id: string): Promise<PipelineRecord> {
  return pipelines.get(id, () => fetchPipeline(id));
}

/** Uncached read, for the Pipeline Detail view. Refreshes the shared cache. */
export async function fetchPipeline(id: string, signal?: AbortSignal): Promise<PipelineRecord> {
  const pipeline = await apiRequest("pipeline", { path: `/api/v1/pipelines/${encodeURIComponent(id)}`, schema: pipelineViewSchema, signal });
  pipelines.delete(id);
  void pipelines.get(id, () => Promise.resolve(pipeline));
  return pipeline;
}

/** Drops a cached pipeline, e.g. after its grants change. */
export function invalidatePipeline(id: string): void {
  pipelines.delete(id);
}

const PAGE_LIMIT = 100;
/** Inventory safety cap: the MVP lists at most this many pipelines. */
const MAX_PIPELINES = 500;

/** Every pipeline the caller may VIEW (Pipeline pages with `offset`/`limit`). */
export async function listPipelines(signal?: AbortSignal): Promise<PipelineRecord[]> {
  const all: PipelineRecord[] = [];
  for (let offset = 0; offset < MAX_PIPELINES; offset += PAGE_LIMIT) {
    const page = await apiRequest("pipeline", {
      path: "/api/v1/pipelines",
      query: { offset, limit: PAGE_LIMIT },
      schema: offsetPageSchema(pipelineViewSchema),
      signal,
    });
    all.push(...page.items);
    if (page.items.length < PAGE_LIMIT) break;
  }
  return all;
}

const grantSchema = z.object({
  principalRef: z.string().min(1),
  capability: z.enum(PIPELINE_CAPABILITIES),
  createdAt: z.iso.datetime({ offset: true }).nullish(),
});

export type PipelineGrant = z.infer<typeof grantSchema>;

export async function fetchPipelineGrants(id: string, signal?: AbortSignal): Promise<PipelineGrant[]> {
  const page = await apiRequest("pipeline", {
    path: `/api/v1/pipelines/${encodeURIComponent(id)}/grants`,
    query: { offset: 0, limit: PAGE_LIMIT },
    schema: offsetPageSchema(grantSchema),
    signal,
  });
  return page.items;
}

const activitySchema = z.object({
  action: z.string().min(1),
  actorRef: z.string().nullish(),
  occurredAt: z.iso.datetime({ offset: true }),
});

export type PipelineActivity = z.infer<typeof activitySchema>;

const registrationsSchema = z.object({
  items: z.array(
    z.object({
      pipelineId: z.string().min(1),
      githubWorkflowId: z.string().regex(/^[1-9][0-9]*$/),
      accessible: z.boolean(),
    }),
  ),
});

/** A monitored workflow of a repository, whoever registered it. */
export interface WorkflowRegistration {
  pipelineId: string;
  /** The caller can already see the pipeline (grant + current GitHub read). */
  accessible: boolean;
}

/**
 * `GET /api/v1/pipelines/registrations?repositoryId=` (ADR-028): which
 * workflows of a repository the caller can read are monitored, by GitHub
 * workflow id — existence only, no operational data, no grant needed. `null`
 * when the service does not provide it (an older deployment) or it cannot be
 * read; the caller then marks only the pipelines it can see.
 */
export async function fetchRepositoryRegistrations(
  repositoryId: string,
  signal?: AbortSignal,
): Promise<ReadonlyMap<string, WorkflowRegistration> | null> {
  try {
    const page = await apiRequest("pipeline", {
      path: "/api/v1/pipelines/registrations",
      query: { repositoryId },
      schema: registrationsSchema,
      signal,
    });
    return new Map(page.items.map((item) => [item.githubWorkflowId, { pipelineId: item.pipelineId, accessible: item.accessible }]));
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return null;
  }
}

const stateSchema = z.record(z.string(), z.unknown()).nullish().catch(null);
const activityEntrySchema = activitySchema.extend({ id: z.string().min(1), beforeState: stateSchema, afterState: stateSchema });
const activitiesPageSchema = z.object({ items: z.array(activityEntrySchema), historyComplete: z.boolean().nullish() });

export type PipelineActivityEntry = z.infer<typeof activityEntrySchema>;

/** Activity read per page; the service returns the latest first. */
export const ACTIVITY_PAGE_SIZE = 20;

/**
 * `GET /api/v1/pipelines/{id}/activities` (CONFIGURE plus current GitHub
 * administration): the sanitized configuration history — registration,
 * policy and ownership changes, access given and removed — newest first.
 * `hasMore` when the page was full; `complete` is the service's statement that
 * the history holds every change (older records may lack fields).
 */
export async function fetchPipelineActivities(
  id: string,
  offset: number,
  signal?: AbortSignal,
): Promise<{ items: PipelineActivityEntry[]; hasMore: boolean; complete: boolean }> {
  const page = await apiRequest("pipeline", {
    path: `/api/v1/pipelines/${encodeURIComponent(id)}/activities`,
    query: { offset, limit: ACTIVITY_PAGE_SIZE },
    schema: activitiesPageSchema,
    signal,
  });
  return {
    items: [...page.items].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
    hasMore: page.items.length === ACTIVITY_PAGE_SIZE,
    complete: page.historyComplete === true,
  };
}

/** Most recent configuration activity, or `null` when none is recorded. */
export async function fetchLatestActivity(id: string, signal?: AbortSignal): Promise<PipelineActivity | null> {
  const page = await apiRequest("pipeline", {
    path: `/api/v1/pipelines/${encodeURIComponent(id)}/activities`,
    query: { offset: 0, limit: 20 },
    schema: z.object({ items: z.array(activitySchema) }),
    signal,
  });
  return [...page.items].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0] ?? null;
}

/** Workflow label: GitHub workflow name, else its file name. */
export function pipelineWorkflowLabel(pipeline: Pick<PipelineRecord, "workflowName" | "workflowFile">): string | null {
  return pipeline.workflowName?.trim() || pipeline.workflowFile?.split("/").pop() || null;
}

const FULL_NAME = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

/** GitHub destinations built from the repository name and workflow file only. */
export function pipelineGithubLinks(pipeline: Pick<PipelineRecord, "fullName" | "workflowFile">) {
  if (!FULL_NAME.test(pipeline.fullName)) return { repository: null, workflow: null };
  const repository = `https://github.com/${pipeline.fullName}`;
  const file = pipeline.workflowFile?.split("/").pop();
  return {
    repository,
    workflow: file && /^[A-Za-z0-9_.-]+$/.test(file) ? `${repository}/actions/workflows/${file}` : null,
  };
}
