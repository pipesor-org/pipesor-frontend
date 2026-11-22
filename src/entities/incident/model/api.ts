import { z } from "zod";

import { DEFAULT_PAGE_SIZE, apiRequest, offsetPageSchema, tokenPageSchema } from "../../../shared/api";
import type { IncidentSeverityLevel, IncidentStage, IncidentStatus } from "./types";

/**
 * Pipeline API contracts for incidents (MVP HTTP API v1). Wire tokens are
 * mapped once, here, onto the existing domain vocabulary so domain UI
 * (`IncidentSeverity`, label maps) serves both API records and the remaining
 * History fixtures.
 */
const instant = z.iso.datetime({ offset: true });

const SEVERITY = { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" } as const satisfies Record<string, IncidentSeverityLevel>;
const STATUS = { OPEN: "Open", IN_REMEDIATION: "In remediation", VERIFICATION: "Verification", RESOLVED: "Resolved" } as const satisfies Record<string, IncidentStatus>;
const STAGE = {
  BUILD: "Build",
  TESTING: "Testing",
  QUALITY_GATE: "Quality Gate",
  DEPLOYMENT: "Deployment",
  CONTAINER: "Container",
  INFRASTRUCTURE: "Infrastructure",
} as const satisfies Record<string, IncidentStage>;

function enumOf<T extends Record<string, string>>(map: T) {
  return z.enum(Object.keys(map) as [keyof T & string, ...(keyof T & string)[]]);
}

const incidentViewSchema = z
  .object({
    id: z.guid(),
    pipelineId: z.guid(),
    displayNumber: z.number().int().positive().nullish(),
    status: enumOf(STATUS),
    /** Pipeline may not have classified the incident yet. */
    severity: enumOf(SEVERITY).nullish(),
    stage: enumOf(STAGE),
    summary: z.string().nullish(),
    detectedAt: instant,
    remediationStartedAt: instant.nullish(),
    verificationStartedAt: instant.nullish(),
    resolvedAt: instant.nullish(),
  })
  .transform((view) => ({
    id: view.id,
    pipelineId: view.pipelineId,
    displayNumber: view.displayNumber ?? null,
    status: STATUS[view.status] as IncidentStatus,
    severity: view.severity ? (SEVERITY[view.severity] as IncidentSeverityLevel) : null,
    stage: STAGE[view.stage] as IncidentStage,
    summary: view.summary?.trim() || null,
    detectedAt: view.detectedAt,
    remediationStartedAt: view.remediationStartedAt ?? null,
    verificationStartedAt: view.verificationStartedAt ?? null,
    resolvedAt: view.resolvedAt ?? null,
  }));

/** An incident as read from Pipeline, in domain vocabulary. */
export type IncidentRecord = z.output<typeof incidentViewSchema>;

/** Lifecycle queues served by `GET /api/v1/incidents`. `OPEN` is every unresolved incident. */
export type IncidentQueueState = "OPEN" | "RESOLVED";

const queueSchema = tokenPageSchema(incidentViewSchema);

export interface IncidentPage {
  items: IncidentRecord[];
  nextPageToken: string | null;
}

export async function fetchIncidentQueue(state: IncidentQueueState, pageToken: string | null, signal?: AbortSignal): Promise<IncidentPage> {
  const page = await apiRequest("pipeline", {
    path: "/api/v1/incidents",
    query: { state, pageSize: DEFAULT_PAGE_SIZE, pageToken },
    schema: queueSchema,
    signal,
  });
  return { items: page.items, nextPageToken: page.nextPageToken ?? null };
}

export function fetchIncident(id: string, signal?: AbortSignal): Promise<IncidentRecord> {
  return apiRequest("pipeline", { path: `/api/v1/incidents/${encodeURIComponent(id)}`, schema: incidentViewSchema, signal });
}

/** Display label: `INC-<n>` when Pipeline assigned a number, else the abbreviated UUID. */
export function incidentLabel(incident: Pick<IncidentRecord, "id" | "displayNumber">): string {
  return incident.displayNumber ? `INC-${incident.displayNumber}` : `#${incident.id.slice(0, 8)}`;
}

const incidentRunSchema = z.object({
  id: z.guid(),
  executionId: z.guid(),
  role: z.enum(["ORIGIN", "VERIFICATION"]),
  createdAt: instant,
});

export type IncidentRun = z.infer<typeof incidentRunSchema>;

const executionSchema = z.object({
  id: z.guid(),
  githubRunId: z.string().regex(/^[1-9][0-9]*$/),
  runAttempt: z.number().int().positive(),
  branch: z.string().nullish(),
  commitSha: z.string().regex(/^[0-9a-f]{7,64}$/i).nullish(),
  externalStatus: z.string().nullish(),
  externalConclusion: z.string().nullish(),
  failed: z.boolean().nullish(),
  startedAt: instant.nullish(),
  completedAt: instant.nullish(),
});

/** A GitHub Actions run attempt as recorded by Pipeline. */
export type Execution = z.infer<typeof executionSchema>;

const MAX_RUNS = 50;

export async function fetchIncidentRuns(id: string, signal?: AbortSignal): Promise<IncidentRun[]> {
  const page = await apiRequest("pipeline", {
    path: `/api/v1/incidents/${encodeURIComponent(id)}/runs`,
    query: { offset: 0, limit: MAX_RUNS },
    schema: offsetPageSchema(incidentRunSchema),
    signal,
  });
  return page.items;
}

export function fetchExecution(id: string, signal?: AbortSignal): Promise<Execution> {
  return apiRequest("pipeline", { path: `/api/v1/executions/${encodeURIComponent(id)}`, schema: executionSchema, signal });
}

/** GitHub page of a run attempt, built from the repository and run identity only. */
export function githubRunUrl(repositoryFullName: string, execution: Pick<Execution, "githubRunId" | "runAttempt">): string | null {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repositoryFullName)) return null;
  return `https://github.com/${repositoryFullName}/actions/runs/${execution.githubRunId}/attempts/${execution.runAttempt}`;
}

/** GitHub page of a commit, or `null` when the repository name is not a plain `owner/name`. */
export function githubCommitUrl(repositoryFullName: string, sha: string): string | null {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repositoryFullName)) return null;
  return `https://github.com/${repositoryFullName}/commit/${sha}`;
}
