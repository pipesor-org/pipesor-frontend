import { z } from "zod";

import { DEFAULT_PAGE_SIZE, apiRequest, offsetPageSchema, tokenPageSchema } from "../../../shared/api";
import {
  activeQuery,
  hasIncidentFilters,
  resolvedFromMs,
  UNCLASSIFIED_SEVERITY,
  type DiagnosisCriterion,
  type IncidentFilters,
  type SeverityFilter,
} from "./filters";
import { byRecurrence, byStageCount, type IncidentInsights } from "./insights";
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

/**
 * Row facts Pipeline adds to incident reads (queue, item, per pipeline):
 * repository, workflow and the diagnosis summary. Read leniently — when
 * absent or unexpected they are "not provided" and the client reads them
 * itself, as before. `diagnosis: null` means no diagnosis yet (ABSENT).
 */
const repositoryFactSchema = z.object({ repositoryId: z.string().regex(/^[1-9][0-9]*$/), fullName: z.string().min(1) });
const workflowFactSchema = z.object({ workflowId: z.string().regex(/^[1-9][0-9]*$/), name: z.string().min(1) });
const diagnosisFactSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CORRECTED", "REJECTED"]),
  probableCause: z.string().nullish(),
  createdAt: instant,
});

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
    repository: repositoryFactSchema.nullish().catch(undefined),
    workflow: workflowFactSchema.nullish().catch(undefined),
    diagnosis: diagnosisFactSchema.nullable().optional().catch(undefined),
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
    /** Repository and workflow when Pipeline provides them with the row. */
    repository: view.repository && view.workflow
      ? { repositoryId: view.repository.repositoryId, fullName: view.repository.fullName, workflow: view.workflow.name }
      : null,
    /** `undefined`: not provided; `null`: no diagnosis yet; otherwise its summary. */
    diagnosis: view.diagnosis === undefined
      ? undefined
      : view.diagnosis === null
        ? null
        : { status: view.diagnosis.status, probableCause: view.diagnosis.probableCause?.trim() || null, createdAt: view.diagnosis.createdAt },
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
export function incidentFilterQuery(filters: IncidentFilters, nowMs: number = Date.now()): Record<string, string | string[]> {
  const query: Record<string, string | string[]> = {};
  const q = activeQuery(filters.q);
  if (q) query.q = q;
  if (filters.repositories.length) query.repositoryId = filters.repositories;
  if (filters.severities.length) query.severity = filters.severities.map((value) => SEVERITY_WIRE[value]);
  if (filters.stages.length) query.stage = filters.stages.map((value) => STAGE_WIRE[value]);
  if (filters.statuses.length) query.status = filters.statuses.map((value) => STATUS_WIRE[value]);
  if (filters.diagnoses.length) query.diagnosis = [...filters.diagnoses];
  if (filters.resolvedWithin) query.resolvedFrom = new Date(resolvedFromMs(filters.resolvedWithin, nowMs)).toISOString();
  return query;
}

export interface QueueQuery {
  /** The user's criteria. */
  filters?: IncidentFilters;
  /** Criteria that define the queue itself (Needs Validation: `PENDING`). */
  diagnosis?: readonly DiagnosisCriterion[];
  /**
   * "Now" for a Resolved period. Page tokens are bound to the criteria, so
   * every page of one read must send the same instant.
   */
  nowMs?: number;
}

function queueCriteria({ filters, diagnosis, nowMs }: QueueQuery): Record<string, string | string[]> | null {
  const query: Record<string, string | string[]> = filters && hasIncidentFilters(filters) ? incidentFilterQuery(filters, nowMs) : {};
  // The queue's own criterion wins: no view offers a Validation facet on a queue that defines one.
  if (diagnosis?.length) query.diagnosis = [...diagnosis];
  return Object.keys(query).length ? query : null;
}

/**
 * Queue order other than Pipeline's default (`createdAt` descending):
 * `resolvedAt` (RESOLVED only) for History. Not a criterion: it never makes a
 * read "filtered". A Pipeline without it ignores the parameter, so callers
 * keep ordering loaded pages themselves.
 */
export type QueueSort = "resolvedAt";

export async function fetchIncidentQueue(
  state: IncidentQueueState,
  pageToken: string | null,
  options: QueueQuery & { sort?: QueueSort; pageSize?: number; signal?: AbortSignal } = {},
): Promise<IncidentPage> {
  const criteria = queueCriteria(options);
  const filtered = criteria !== null;
  const page = await apiRequest("pipeline", {
    path: "/api/v1/incidents",
    query: {
      state,
      pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
      pageToken,
      // Page tokens are bound to the order: every read of a queue sends the same one.
      sort: options.sort,
      ...criteria,
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

const countsSchema = z.record(z.string(), z.number().int().nonnegative());
const summarySchema = z.object({
  total: z.number().int().nonnegative(),
  bySeverity: countsSchema,
  byStatus: countsSchema,
  byDiagnosis: countsSchema,
  appliedFilters: z.record(z.string(), z.unknown()),
});

/** Exact counts over a whole queue (with the same criteria), from Pipeline. */
export interface IncidentSummary {
  total: number;
  bySeverity: Record<SeverityFilter, number>;
  byDiagnosis: Record<DiagnosisCriterion, number>;
}

/**
 * `GET /api/v1/incidents/summary`: exact totals instead of figures over the
 * loaded pages. `null` when the service does not provide it (an older
 * deployment) or it cannot be read; the view then keeps its loaded-page
 * figures.
 */
export async function fetchIncidentSummary(state: IncidentQueueState, query: QueueQuery = {}, signal?: AbortSignal): Promise<IncidentSummary | null> {
  try {
    const summary = await apiRequest("pipeline", {
      path: "/api/v1/incidents/summary",
      query: { state, ...queueCriteria(query) },
      schema: summarySchema,
      signal,
    });
    const severity = (wire: string) => summary.bySeverity[wire] ?? 0;
    const diagnosis = (wire: DiagnosisCriterion) => summary.byDiagnosis[wire] ?? 0;
    return {
      total: summary.total,
      bySeverity: { Critical: severity("CRITICAL"), High: severity("HIGH"), Medium: severity("MEDIUM"), Low: severity("LOW"), Unclassified: severity("UNCLASSIFIED") },
      byDiagnosis: {
        PENDING: diagnosis("PENDING"),
        CONFIRMED: diagnosis("CONFIRMED"),
        CORRECTED: diagnosis("CORRECTED"),
        REJECTED: diagnosis("REJECTED"),
        ABSENT: diagnosis("ABSENT"),
      },
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return null;
  }
}

const count = z.number().int().nonnegative();
const meanSchema = z.object({ meanMs: z.number().nonnegative().nullable(), sampleSize: count });
const insightsSchema = z.object({
  window: z.object({ from: instant, to: instant }),
  summary: z.object({
    resolvedIncidents: count,
    confirmed: count,
    rejected: count,
    pending: count,
    confirmationRate: z.number().min(0).max(1).nullable(),
    meanDiagnosis: meanSchema,
    meanResolution: meanSchema,
  }),
  stages: z.array(z.object({ stage: enumOf(STAGE), count })),
  recurring: z.array(
    z.object({
      pipelineId: z.string().min(1),
      repository: z.object({ fullName: z.string().min(1) }).nullish(),
      workflow: z.object({ name: z.string().min(1) }).nullish(),
      stage: enumOf(STAGE),
      count,
    }),
  ),
  trend: z.array(z.object({ start: instant, end: instant, incidentCount: count, meanDiagnosisMs: z.number().nonnegative().nullable() })),
});

/** Recurring groups asked of Pipeline (its maximum); the view shows the first few and says when more exist. */
export const INSIGHTS_TOP = 50;

/**
 * `GET /api/v1/insights` over Pipeline's default window (the last 30 days):
 * figures over every resolved incident the caller may view. `null` when the
 * service does not provide it (an older deployment) or it cannot be read; the
 * view then computes them over the loaded incidents.
 */
export async function fetchIncidentInsights(signal?: AbortSignal): Promise<IncidentInsights | null> {
  try {
    const insights = await apiRequest("pipeline", {
      path: "/api/v1/insights",
      query: { top: INSIGHTS_TOP },
      schema: insightsSchema,
      signal,
    });
    return {
      window: { start: insights.window.from, end: insights.window.to },
      summary: insights.summary,
      stages: insights.stages.map(({ stage, count }) => ({ stage: STAGE[stage], count })).sort(byStageCount),
      recurring: insights.recurring
        .map((group) => ({
          pipelineId: group.pipelineId,
          repository: group.repository?.fullName ?? null,
          workflow: group.workflow?.name ?? null,
          stage: STAGE[group.stage],
          count: group.count,
        }))
        .sort(byRecurrence),
      recurringTruncated: insights.recurring.length >= INSIGHTS_TOP,
      trend: insights.trend,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return null;
  }
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
