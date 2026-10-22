import { INCIDENT_SNAPSHOT_AT, incidents } from "./incidents";
import type { Incident, ResolvedIncident } from "./schema";
import { selectHistoryIncidents } from "./selectors";
import { DiagnosisValidationStatus, INCIDENT_STAGES } from "./types";
import type { IncidentStage } from "./types";

/**
 * Analytical read model for History — Insights.
 *
 * Every value is derived from the validated incident fixtures through the same
 * membership rule as History — Incidents (resolved incidents whose diagnosis
 * validation reached a terminal outcome) and filtered to a fixed analysis
 * window anchored at {@link INCIDENT_SNAPSHOT_AT}.
 *
 * **Provisional demo definitions.** The formulas below are display conventions
 * for the current fixtures. They are not approved backend contracts,
 * experimental KPIs or evidence of product performance:
 *
 * - Mean diagnosis time is the arithmetic mean of the available
 *   `diagnosisDurationSeconds` values. Their start and end instants are not
 *   defined, so no timestamp is derived from them.
 * - Mean resolution time is the arithmetic mean of the available
 *   `resolutionDurationSeconds` values. The frame labels it "MTTR", but this
 *   fixture mean does not establish an official MTTR definition.
 * - Diagnosis confirmation rate is `confirmed / (confirmed + rejected)` over
 *   the validated population. It reflects operator-marked confirmations and is
 *   **not** model accuracy.
 * - Recurring contexts group incidents by repository, workflow and stage.
 *   There is no root-cause taxonomy behind this grouping.
 *
 * Missing data is never coerced to zero: a mean is `null` when no record
 * carries the corresponding duration, and `sampleSize` says how many records
 * contributed. An empty bucket keeps its slot with `meanDiagnosisMs: null` /
 * `incidentCount: 0`; trends are never interpolated across empty periods.
 */

const DAY_MS = 86_400_000;

/** Length of the demo analysis window, in days, ending at the snapshot. */
export const INSIGHTS_WINDOW_DAYS = 30;

/** Width of a diagnosis-time bucket, in days, anchored at the window start. */
export const INSIGHTS_BUCKET_DAYS = 7;

/**
 * Inclusive analysis interval, expressed as ISO-8601 UTC instants.
 *
 * `end` is the demo snapshot instant rather than the current time, so the demo
 * never claims to describe live data.
 */
export interface InsightsWindow {
  start: string;
  end: string;
}

/** Arithmetic mean of a duration, in milliseconds. */
export interface InsightsDurationStat {
  /**
   * Mean of the values that were actually present, or `null` when no incident
   * in the population carries the field. Zero is a valid mean, not "missing".
   */
  meanMs: number | null;
  /** Number of incidents that contributed a value. */
  sampleSize: number;
}

/** Values shown in the Insights summary strip. */
export interface InsightsSummary {
  /** Window the summary was computed over. */
  window: InsightsWindow;
  /** Resolved incidents with a terminal diagnosis validation. */
  resolvedIncidents: number;
  /** Diagnoses marked `CONFIRMED` by an operator. */
  confirmed: number;
  /** Diagnoses marked `REJECTED` by an operator. */
  rejected: number;
  /**
   * `confirmed / (confirmed + rejected)`, or `null` when nothing has been
   * validated. A ratio in `[0, 1]`, not a percentage.
   */
  confirmationRate: number | null;
  meanDiagnosis: InsightsDurationStat;
  meanResolution: InsightsDurationStat;
}

/** One stage and how many incidents originated from it. */
export interface InsightsStageCount {
  stage: IncidentStage;
  count: number;
}

/**
 * Incidents sharing a repository, workflow and stage.
 *
 * A deterministic demo grouping, not a root-cause classification.
 */
export interface InsightsRecurringContext {
  repository: string;
  workflow: string;
  stage: IncidentStage;
  count: number;
}

/** One time bucket of the diagnosis-time trend. */
export interface InsightsDiagnosisBucket {
  /** Inclusive ISO-8601 UTC bucket start; the label for this bucket. */
  start: string;
  /** ISO-8601 UTC instant where the bucket stops (exclusive), clamped to the window. */
  end: string;
  incidentCount: number;
  /** Incidents in the bucket that carry a diagnosis duration. */
  diagnosisSampleSize: number;
  /** Mean diagnosis time for this bucket, or `null` when none is available. */
  meanDiagnosisMs: number | null;
}

/** Chronological diagnosis-time buckets covering the whole window. */
export interface InsightsDiagnosisSeries {
  window: InsightsWindow;
  bucketDays: number;
  buckets: InsightsDiagnosisBucket[];
}

function startOfUtcDay(ms: number): number {
  const date = new Date(ms);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

const SNAPSHOT_MS = Date.parse(INCIDENT_SNAPSHOT_AT);

const WINDOW_START_MS =
  startOfUtcDay(SNAPSHOT_MS) - (INSIGHTS_WINDOW_DAYS - 1) * DAY_MS;

/**
 * Default demo window: the 30 UTC calendar days ending at the snapshot
 * (`2026-09-01T00:00:00.000Z` → `2026-09-30T10:30:00.000Z`).
 */
export const DEFAULT_INSIGHTS_WINDOW: InsightsWindow = {
  start: new Date(WINDOW_START_MS).toISOString(),
  end: new Date(SNAPSHOT_MS).toISOString(),
};

/** Resolves and validates a window's millisecond bounds. */
function windowBounds(window: InsightsWindow): { startMs: number; endMs: number } {
  const startMs = Date.parse(window.start);
  const endMs = Date.parse(window.end);

  if (
    !Number.isFinite(startMs) ||
    !Number.isFinite(endMs) ||
    endMs < startMs
  ) {
    throw new RangeError(
      "Insights window must be a valid ISO-8601 interval with start <= end",
    );
  }

  return { startMs, endMs };
}

/** Canonical stage order, used only to break count ties deterministically. */
function stageRank(stage: IncidentStage): number {
  return INCIDENT_STAGES.indexOf(stage);
}

/** Locale-independent comparison: aggregates never sort by translated labels. */
function compareStrings(a: string, b: string): number {
  if (a === b) return 0;
  return a < b ? -1 : 1;
}

/** Mean of whole-second fixture durations, returned in milliseconds. */
function meanSecondsAsMs(seconds: readonly number[]): InsightsDurationStat {
  if (seconds.length === 0) {
    return { meanMs: null, sampleSize: 0 };
  }

  let total = 0;
  for (const value of seconds) total += value;

  return { meanMs: (total / seconds.length) * 1_000, sampleSize: seconds.length };
}

/**
 * Incidents inside the analysis window: the History membership (resolved with
 * a terminal diagnosis validation), newest resolution first.
 *
 * Keeping Insights on the same population as History means the two views can
 * never disagree about which incidents exist.
 */
export function selectInsightsIncidents(
  all: readonly Incident[] = incidents,
  window: InsightsWindow = DEFAULT_INSIGHTS_WINDOW,
): ResolvedIncident[] {
  const { startMs, endMs } = windowBounds(window);

  return selectHistoryIncidents(all).filter((incident) => {
    const resolvedMs = Date.parse(incident.resolvedAt);
    return resolvedMs >= startMs && resolvedMs <= endMs;
  });
}

/** Counts, confirmation rate and mean durations for the summary strip. */
export function selectInsightsSummary(
  all: readonly Incident[] = incidents,
  window: InsightsWindow = DEFAULT_INSIGHTS_WINDOW,
): InsightsSummary {
  const population = selectInsightsIncidents(all, window);

  const diagnosisSeconds: number[] = [];
  const resolutionSeconds: number[] = [];
  let confirmed = 0;
  let rejected = 0;

  for (const incident of population) {
    if (incident.diagnosisDurationSeconds !== undefined) {
      diagnosisSeconds.push(incident.diagnosisDurationSeconds);
    }
    if (incident.resolutionDurationSeconds !== undefined) {
      resolutionSeconds.push(incident.resolutionDurationSeconds);
    }
    if (incident.validationStatus === DiagnosisValidationStatus.Confirmed) {
      confirmed += 1;
    } else if (incident.validationStatus === DiagnosisValidationStatus.Rejected) {
      rejected += 1;
    }
  }

  const validated = confirmed + rejected;

  return {
    window,
    resolvedIncidents: population.length,
    confirmed,
    rejected,
    confirmationRate: validated === 0 ? null : confirmed / validated,
    meanDiagnosis: meanSecondsAsMs(diagnosisSeconds),
    meanResolution: meanSecondsAsMs(resolutionSeconds),
  };
}

/**
 * Incidents per stage, highest count first.
 *
 * Ties fall back to the canonical stage order so the bars never reorder between
 * renders. Stages with no incidents are omitted rather than shown as zero.
 */
export function selectStageDistribution(
  all: readonly Incident[] = incidents,
  window: InsightsWindow = DEFAULT_INSIGHTS_WINDOW,
): InsightsStageCount[] {
  const counts = new Map<IncidentStage, number>();

  for (const incident of selectInsightsIncidents(all, window)) {
    counts.set(incident.stage, (counts.get(incident.stage) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([stage, count]) => ({ stage, count }))
    .sort(
      (a, b) => b.count - a.count || stageRank(a.stage) - stageRank(b.stage),
    );
}

/**
 * Incidents grouped by repository, workflow and stage, highest count first.
 *
 * Ties are ordered by repository, then workflow, then canonical stage order,
 * all compared on source values (never on translated labels). The returned
 * array is already deterministically ordered, so the view can slice a top-N
 * without re-sorting.
 */
export function selectRecurringContexts(
  all: readonly Incident[] = incidents,
  window: InsightsWindow = DEFAULT_INSIGHTS_WINDOW,
): InsightsRecurringContext[] {
  const contexts = new Map<string, InsightsRecurringContext>();

  for (const incident of selectInsightsIncidents(all, window)) {
    // NUL cannot appear in fixture strings, so the key is unambiguous.
    const key = `${incident.repository}\u0000${incident.workflow}\u0000${incident.stage}`;
    const existing = contexts.get(key);

    if (existing) {
      existing.count += 1;
    } else {
      contexts.set(key, {
        repository: incident.repository,
        workflow: incident.workflow,
        stage: incident.stage,
        count: 1,
      });
    }
  }

  return [...contexts.values()].sort(
    (a, b) =>
      b.count - a.count ||
      compareStrings(a.repository, b.repository) ||
      compareStrings(a.workflow, b.workflow) ||
      stageRank(a.stage) - stageRank(b.stage),
  );
}

/**
 * Diagnosis-time trend as consecutive buckets covering the whole window.
 *
 * Buckets are {@link INSIGHTS_BUCKET_DAYS}-day slices anchored at the window
 * start (not calendar weeks), matching the frame's `Sep 1 / 8 / 15 / 22 / 29`
 * labels. Every bucket is returned, including empty ones, so a sparse period
 * reads as "no data" instead of a fabricated point or an interpolated line.
 * The final bucket is partial when the window does not divide evenly.
 */
export function selectDiagnosisTimeSeries(
  all: readonly Incident[] = incidents,
  window: InsightsWindow = DEFAULT_INSIGHTS_WINDOW,
): InsightsDiagnosisSeries {
  const { startMs, endMs } = windowBounds(window);
  const bucketMs = INSIGHTS_BUCKET_DAYS * DAY_MS;
  const bucketCount = Math.max(1, Math.ceil((endMs - startMs) / bucketMs));

  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const bucketStartMs = startMs + index * bucketMs;
    const bucketEndMs = Math.min(bucketStartMs + bucketMs, endMs);

    return {
      start: new Date(bucketStartMs).toISOString(),
      end: new Date(bucketEndMs).toISOString(),
      incidentCount: 0,
      diagnosisSamples: [] as number[],
    };
  });

  for (const incident of selectInsightsIncidents(all, window)) {
    const resolvedMs = Date.parse(incident.resolvedAt);
    // Clamp so an incident exactly at the inclusive window end lands in the
    // final (partial) bucket instead of creating an out-of-range index.
    const index = Math.min(
      bucketCount - 1,
      Math.max(0, Math.floor((resolvedMs - startMs) / bucketMs)),
    );
    const bucket = buckets[index];

    bucket.incidentCount += 1;
    if (incident.diagnosisDurationSeconds !== undefined) {
      bucket.diagnosisSamples.push(incident.diagnosisDurationSeconds);
    }
  }

  return {
    window,
    bucketDays: INSIGHTS_BUCKET_DAYS,
    buckets: buckets.map(({ diagnosisSamples, ...bucket }) => {
      const mean = meanSecondsAsMs(diagnosisSamples);

      return {
        ...bucket,
        diagnosisSampleSize: mean.sampleSize,
        meanDiagnosisMs: mean.meanMs,
      };
    }),
  };
}
