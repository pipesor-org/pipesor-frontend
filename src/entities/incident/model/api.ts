import { z } from "zod";

import { DEFAULT_PAGE_SIZE, apiRequest, offsetPageSchema, tokenPageSchema } from "../../../shared/api";
import { activeQuery, hasIncidentFilters, UNCLASSIFIED_SEVERITY, type IncidentFilters, type SeverityFilter } from "./filters";
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

/**
 * `total` and `appliedFilters` are additions requested from Pipeline (filters
 * applied before paging). They are read leniently: a missing or unexpected
 * value means "not provided", never a failed queue.
 */
const queueSchema = tokenPageSchema(incidentViewSchema).extend({
  total: z.number().int().nonnegative().nullish().catch(null),
  appliedFilters: z.record(z.string(), z.unknown()).nullish().catch(null),
});

export interface IncidentPage {
  items: IncidentRecord[];
  nextPageToken: string | null;
  /** Exact number of matching incidents the caller can see, when Pipeline reports it. */
  total: number | null;
  /** Pipeline confirmed it applied the requested filters (it echoes them back). */
  filteredByService: boolean;
}

/** Largest page Pipeline serves. */
export const MAX_PAGE_SIZE = 100;

function invert<K extends string, V extends string>(map: Record<K, V>): Record<V, K> {
  return Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key])) as Record<V, K>;
}

const SEVERITY_WIRE = { ...invert(SEVERITY), [UNCLASSIFIED_SEVERITY]: "UNCLASSIFIED" } as Record<SeverityFilter, string>;
const STAGE_WIRE = invert(STAGE);
const STATUS_WIRE = invert(STATUS);

/** Filter parameters in the service's vocabulary (repeated parameters for lists). */
export function incidentFilterQuery(filters: IncidentFilters): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {};
  const q = activeQuery(filters.q);
  if (q) query.q = q;
  if (filters.repositories.length) query.repositoryId = filters.repositories;
  if (filters.severities.length) query.severity = filters.severities.map((value) => SEVERITY_WIRE[value]);
  if (filters.stages.length) query.stage = filters.stages.map((value) => STAGE_WIRE[value]);
  if (filters.statuses.length) query.status = filters.statuses.map((value) => STATUS_WIRE[value]);
  return query;
}

export async function fetchIncidentQueue(
  state: IncidentQueueState,
  pageToken: string | null,
  options: { filters?: IncidentFilters; pageSize?: number; signal?: AbortSignal } = {},
): Promise<IncidentPage> {
  const filtered = options.filters !== undefined && hasIncidentFilters(options.filters);
  const page = await apiRequest("pipeline", {
    path: "/api/v1/incidents",
    query: {
      state,
      pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
      pageToken,
      ...(filtered && options.filters ? incidentFilterQuery(options.filters) : {}),
    },
    schema: queueSchema,
    signal: options.signal,
  });
  return {
    items: page.items,
    nextPageToken: page.nextPageToken ?? null,
    total: page.total ?? null,
    filteredByService: filtered && page.appliedFilters != null,
  };
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
