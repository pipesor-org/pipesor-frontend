import { z } from "zod";

import { apiRequest, isApiError } from "../../../shared/api";

import { ANALYSIS_PHASES, followAnalysis, type AnalysisPhase } from "./analysis";

/**
 * GitHub Actions run attempts as listed by Ingestion with the user's own
 * access (MVP HTTP API v1): `conclusion=failure` lists runs to analyse,
 * `conclusion=success` runs to record as incident verification.
 */
const runSchema = z.object({
  runId: z.string().regex(/^[1-9][0-9]*$/),
  attempt: z.number().int().positive(),
  conclusion: z.string(),
  headBranch: z.string().nullish(),
  headSha: z.string().nullish(),
  createdAt: z.iso.datetime({ offset: true }),
  htmlUrl: z.url().nullish(),
});

export type WorkflowRun = z.infer<typeof runSchema>;
export type RunConclusion = "failure" | "success";

const runsPageSchema = z.object({ items: z.array(runSchema), nextPageToken: z.string().min(1).nullish() });

export interface WorkflowRef {
  /** GitHub numeric repository id. */
  repositoryId: string;
  /** GitHub numeric workflow id. */
  workflowId: string;
}

function workflowPath({ repositoryId, workflowId }: WorkflowRef): string {
  return `/api/v1/github/repositories/${encodeURIComponent(repositoryId)}/workflows/${encodeURIComponent(workflowId)}`;
}

export async function fetchWorkflowRuns(
  workflow: WorkflowRef,
  conclusion: RunConclusion,
  options: { pageToken?: string | null; pageSize?: number; signal?: AbortSignal } = {},
): Promise<{ items: WorkflowRun[]; nextPageToken: string | null }> {
  const page = await apiRequest("ingestion", {
    path: `${workflowPath(workflow)}/runs`,
    query: { conclusion, pageSize: options.pageSize ?? 10, pageToken: options.pageToken },
    schema: runsPageSchema,
    signal: options.signal,
  });
  return { items: page.items, nextPageToken: page.nextPageToken ?? null };
}

/** GitHub page of a run attempt, only when Ingestion supplied an https URL. */
export function safeRunUrl(run: Pick<WorkflowRun, "htmlUrl">): string | null {
  return run.htmlUrl && run.htmlUrl.startsWith("https://github.com/") ? run.htmlUrl : null;
}

/**
 * Durable analysis/capture receipt of one run attempt. `executionId` (and
 * `incidentId` for failed runs) are Pipeline's deterministic identifiers,
 * present once the phase is `PUBLISHED`.
 */
const analysisSchema = z.object({
  analysisId: z.guid(),
  phase: z.enum(ANALYSIS_PHASES),
  blockedReason: z.string().nullish(),
  executionId: z.guid().nullish(),
  incidentId: z.guid().nullish(),
});

export type RunAnalysis = z.infer<typeof analysisSchema>;

export interface RunAttemptRef extends WorkflowRef {
  runId: string;
  attempt: number;
}

function analysisPath(target: RunAttemptRef): string {
  return `${workflowPath(target)}/runs/${encodeURIComponent(target.runId)}/attempts/${target.attempt}/analysis`;
}

/** Records the durable intent to capture the attempt (failed → analysis, successful → verification). */
export function requestRunAnalysis(target: RunAttemptRef, signal?: AbortSignal): Promise<RunAnalysis> {
  return apiRequest("ingestion", { method: "POST", path: analysisPath(target), schema: analysisSchema, signal });
}

/** Current receipt, or `null` when the attempt was never requested (`404 ANALYSIS_NOT_FOUND`). */
export async function fetchRunAnalysis(target: RunAttemptRef, signal?: AbortSignal): Promise<RunAnalysis | null> {
  try {
    return await apiRequest("ingestion", { path: analysisPath(target), schema: analysisSchema, signal });
  } catch (error) {
    if (isApiError(error) && error.status === 404 && error.code === "ANALYSIS_NOT_FOUND") return null;
    throw error;
  }
}

const POLL_INTERVAL_MS = 2_000;
const POLL_TIMEOUT_MS = 180_000;

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
}

/**
 * Requests the capture (idempotent on the service side) and follows its phase
 * until it is final (`PUBLISHED` or `BLOCKED`), reporting each phase. Throws
 * `AnalysisTimeoutError` after three minutes; the receipt stays durable, so a
 * later call resumes it.
 */
export async function runAnalysisToCompletion(
  target: RunAttemptRef,
  options: { signal?: AbortSignal; onPhase?: (phase: AnalysisPhase) => void } = {},
): Promise<RunAnalysis> {
  const initial = await requestRunAnalysis(target, options.signal);
  return followAnalysis(initial, () => fetchRunAnalysis(target, options.signal), {
    onPhase: options.onPhase,
    intervalMs: POLL_INTERVAL_MS,
    timeoutMs: POLL_TIMEOUT_MS,
    wait: (ms) => delay(ms, options.signal),
    now: Date.now,
  });
}
