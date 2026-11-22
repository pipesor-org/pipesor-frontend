import type { DiagnosisStatus } from "../../../entities/diagnosis";
import { INCIDENT_STAGES, type IncidentStage } from "../../../entities/incident";

/**
 * Analytical read model of History — Insights, computed in the browser over
 * the resolved incidents loaded so far (owner decision 8; no analytics API).
 *
 * Definitions:
 * - Population: loaded resolved incidents whose `resolvedAt` falls in the
 *   analysis window (the last 30 days up to "now").
 * - Mean diagnosis time (TMD): `diagnosis.createdAt − incident.detectedAt`, over
 *   incidents that have a diagnosis.
 * - MTTR: `resolvedAt − detectedAt`.
 * - Confirmation rate: `confirmed / (confirmed + rejected)`, where `CORRECTED`
 *   and `REJECTED` both count as rejected and `PENDING` is excluded (D03). It
 *   reflects human reviews, not model accuracy.
 * - Recurring contexts: incidents grouped by monitored pipeline and stage; not
 *   a root-cause taxonomy.
 *
 * Missing measurements are never coerced to zero: means are `null` without
 * samples and empty weeks stay empty.
 */
export interface InsightsRecord {
  incidentId: string;
  detectedAt: string;
  resolvedAt: string;
  stage: IncidentStage;
  pipelineId: string;
  repository: string | null;
  workflow: string | null;
  /** `null` when the incident has no diagnosis (yet). */
  diagnosisCreatedAt: string | null;
  outcome: DiagnosisStatus | null;
}

const DAY_MS = 86_400_000;
export const INSIGHTS_WINDOW_DAYS = 30;
export const INSIGHTS_BUCKET_DAYS = 7;

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

export interface InsightsModel {
  window: InsightsWindow;
  population: InsightsRecord[];
  summary: InsightsSummary;
  stages: StageCount[];
  recurring: RecurringContext[];
  trend: DiagnosisBucket[];
}

function mean(values: number[]): DurationStat {
  if (values.length === 0) return { meanMs: null, sampleSize: 0 };
  return { meanMs: values.reduce((sum, value) => sum + value, 0) / values.length, sampleSize: values.length };
}

function startOfUtcDay(ms: number): number {
  const date = new Date(ms);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function diagnosisMs(record: InsightsRecord): number | null {
  if (!record.diagnosisCreatedAt) return null;
  const value = Date.parse(record.diagnosisCreatedAt) - Date.parse(record.detectedAt);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function stageRank(stage: IncidentStage): number {
  return INCIDENT_STAGES.indexOf(stage);
}

export function buildInsights(records: readonly InsightsRecord[], nowMs: number): InsightsModel {
  const startMs = startOfUtcDay(nowMs) - (INSIGHTS_WINDOW_DAYS - 1) * DAY_MS;
  const window = { start: new Date(startMs).toISOString(), end: new Date(nowMs).toISOString() };
  const population = records.filter((record) => {
    const resolvedMs = Date.parse(record.resolvedAt);
    return resolvedMs >= startMs && resolvedMs <= nowMs;
  });

  let confirmed = 0;
  let rejected = 0;
  let pending = 0;
  const diagnosisSamples: number[] = [];
  const resolutionSamples: number[] = [];
  const stageCounts = new Map<IncidentStage, number>();
  const contexts = new Map<string, RecurringContext>();

  for (const record of population) {
    if (record.outcome === "CONFIRMED") confirmed += 1;
    else if (record.outcome === "CORRECTED" || record.outcome === "REJECTED") rejected += 1;
    else if (record.outcome === "PENDING") pending += 1;

    const tmd = diagnosisMs(record);
    if (tmd !== null) diagnosisSamples.push(tmd);
    const mttr = Date.parse(record.resolvedAt) - Date.parse(record.detectedAt);
    if (Number.isFinite(mttr) && mttr >= 0) resolutionSamples.push(mttr);

    stageCounts.set(record.stage, (stageCounts.get(record.stage) ?? 0) + 1);
    const key = `${record.pipelineId}:${record.stage}`;
    const context = contexts.get(key);
    if (context) context.count += 1;
    else contexts.set(key, { pipelineId: record.pipelineId, repository: record.repository, workflow: record.workflow, stage: record.stage, count: 1 });
  }

  const bucketMs = INSIGHTS_BUCKET_DAYS * DAY_MS;
  const bucketCount = Math.max(1, Math.ceil((nowMs - startMs) / bucketMs));
  const buckets = Array.from({ length: bucketCount }, (_, index) => ({
    start: startMs + index * bucketMs,
    end: Math.min(startMs + (index + 1) * bucketMs, nowMs),
    count: 0,
    samples: [] as number[],
  }));
  for (const record of population) {
    const index = Math.min(bucketCount - 1, Math.max(0, Math.floor((Date.parse(record.resolvedAt) - startMs) / bucketMs)));
    buckets[index].count += 1;
    const tmd = diagnosisMs(record);
    if (tmd !== null) buckets[index].samples.push(tmd);
  }

  const validated = confirmed + rejected;
  return {
    window,
    population,
    summary: {
      resolvedIncidents: population.length,
      confirmed,
      rejected,
      pending,
      confirmationRate: validated === 0 ? null : confirmed / validated,
      meanDiagnosis: mean(diagnosisSamples),
      meanResolution: mean(resolutionSamples),
    },
    stages: [...stageCounts.entries()]
      .map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count || stageRank(a.stage) - stageRank(b.stage)),
    recurring: [...contexts.values()].sort(
      (a, b) =>
        b.count - a.count ||
        (a.repository ?? "").localeCompare(b.repository ?? "") ||
        (a.workflow ?? "").localeCompare(b.workflow ?? "") ||
        stageRank(a.stage) - stageRank(b.stage),
    ),
    trend: buckets.map((bucket) => ({
      start: new Date(bucket.start).toISOString(),
      end: new Date(bucket.end).toISOString(),
      incidentCount: bucket.count,
      meanDiagnosisMs: mean(bucket.samples).meanMs,
    })),
  };
}
