import { INCIDENT_STAGES, type IncidentStage } from "./types";

/**
 * History — Insights read model, in domain vocabulary. Pipeline computes it
 * over every resolved incident the caller may view (`GET /api/v1/insights`);
 * against a Pipeline without that endpoint, History computes the same model in
 * the browser over the loaded incidents.
 *
 * Definitions (shared by both sources):
 * - Population: resolved incidents whose `resolvedAt` falls in the window (by
 *   default the last 30 days, from the start of the UTC day 29 days ago).
 * - Mean diagnosis time: `diagnosis.createdAt − detectedAt`, over incidents
 *   with a diagnosis. MTTR: `resolvedAt − detectedAt`.
 * - Confirmation rate: `confirmed / (confirmed + rejected)`; `CORRECTED` and
 *   `REJECTED` both count as rejected and `PENDING` is excluded (D03). It
 *   reflects human reviews, not model accuracy.
 * - Recurring contexts: incidents grouped by monitored pipeline and stage; not
 *   a root-cause taxonomy.
 *
 * Missing measurements are never zero: means are `null` without samples.
 */
export interface InsightsWindow {
  start: string;
  end: string;
}

export interface DurationStat {
  meanMs: number | null;
  sampleSize: number;
}

export interface InsightsSummary {
  resolvedIncidents: number;
  confirmed: number;
  rejected: number;
  pending: number;
  confirmationRate: number | null;
  meanDiagnosis: DurationStat;
  meanResolution: DurationStat;
}

export interface StageCount {
  stage: IncidentStage;
  count: number;
}

export interface RecurringContext {
  pipelineId: string;
  repository: string | null;
  workflow: string | null;
  stage: IncidentStage;
  count: number;
}

export interface DiagnosisBucket {
  start: string;
  end: string;
  incidentCount: number;
  meanDiagnosisMs: number | null;
}

export interface IncidentInsights {
  window: InsightsWindow;
  summary: InsightsSummary;
  /** Highest count first; ties follow the stage order of the domain. */
  stages: StageCount[];
  /** Highest count first; ties by repository, workflow, then stage. */
  recurring: RecurringContext[];
  /** `true` when the service returned only its top groups (more may exist). */
  recurringTruncated: boolean;
  /** Consecutive 7-day buckets from the start of the window. */
  trend: DiagnosisBucket[];
}

const stageRank = (stage: IncidentStage) => INCIDENT_STAGES.indexOf(stage);

/** The order both sources present stage counts in. */
export function byStageCount(a: StageCount, b: StageCount): number {
  return b.count - a.count || stageRank(a.stage) - stageRank(b.stage);
}

/** The order both sources present recurring contexts in. */
export function byRecurrence(a: RecurringContext, b: RecurringContext): number {
  return (
    b.count - a.count ||
    (a.repository ?? "").localeCompare(b.repository ?? "") ||
    (a.workflow ?? "").localeCompare(b.workflow ?? "") ||
    stageRank(a.stage) - stageRank(b.stage)
  );
}
