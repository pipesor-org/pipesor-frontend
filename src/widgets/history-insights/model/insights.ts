import type { DiagnosisStatus } from "../../../entities/diagnosis";
import {
  byRecurrence,
  byStageCount,
  type DurationStat,
  type IncidentInsights,
  type IncidentStage,
  type RecurringContext,
} from "../../../entities/incident";

/**
 * History — Insights computed in the browser over the resolved incidents
 * loaded so far: the fallback when Pipeline does not provide
 * `GET /api/v1/insights`. Same definitions and model as the service (see
 * `IncidentInsights` in the incident entity); missing measurements are never
 * coerced to zero and empty weeks stay empty.
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

export function buildInsights(records: readonly InsightsRecord[], nowMs: number): IncidentInsights {
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
    summary: {
      resolvedIncidents: population.length,
      confirmed,
      rejected,
      pending,
      confirmationRate: validated === 0 ? null : confirmed / validated,
      meanDiagnosis: mean(diagnosisSamples),
      meanResolution: mean(resolutionSamples),
    },
    stages: [...stageCounts.entries()].map(([stage, count]) => ({ stage, count })).sort(byStageCount),
    recurring: [...contexts.values()].sort(byRecurrence),
    recurringTruncated: false,
    trend: buckets.map((bucket) => ({
      start: new Date(bucket.start).toISOString(),
      end: new Date(bucket.end).toISOString(),
      incidentCount: bucket.count,
      meanDiagnosisMs: mean(bucket.samples).meanMs,
    })),
  };
}
