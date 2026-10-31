import { incidents } from "./incidents";
import type { Incident, ResolvedIncident, UnresolvedIncident } from "./schema";
import { DiagnosisValidationStatus } from "./types";

/**
 * Placeholder diagnosis shown while evidence is still being correlated.
 * Incidents carrying it are the ones counted as "Analyzing" in the summary.
 */
const ANALYZING_DIAGNOSIS = "Analyzing evidence…";

/**
 * Narrows an incident to its resolved branch.
 *
 * `RESOLVED` is an operational lifecycle state only — it says nothing about
 * whether the proposed diagnosis has been confirmed.
 */
export function isOperationallyResolved(
  incident: Incident,
): incident is ResolvedIncident {
  return incident.status === "Resolved";
}

/** Active Incidents queue: incidents that are operationally unresolved. */
export function selectActiveIncidents(
  all: readonly Incident[] = incidents,
): UnresolvedIncident[] {
  return all.filter(
    (incident): incident is UnresolvedIncident =>
      !isOperationallyResolved(incident),
  );
}

/**
 * Needs Validation queue: incidents that are operationally resolved but whose
 * proposed diagnosis has not been validated yet.
 */
export function selectNeedsValidationIncidents(
  all: readonly Incident[] = incidents,
): ResolvedIncident[] {
  return all
    .filter(isOperationallyResolved)
    .filter(
      (incident) =>
        incident.validationStatus === DiagnosisValidationStatus.Pending,
    );
}

/**
 * Validation outcomes that close the diagnosis-review loop.
 *
 * Typed as the wide `DiagnosisValidationStatus` union so `includes` can be used
 * against an incident's status.
 */
const TERMINAL_VALIDATION_STATUSES: readonly DiagnosisValidationStatus[] = [
  DiagnosisValidationStatus.Confirmed,
  DiagnosisValidationStatus.Rejected,
];

/**
 * History — Incidents read projection.
 *
 * Provisional demo rule: History lists resolved incidents whose diagnosis
 * validation has reached a terminal outcome (confirmed or rejected). This is a
 * presentation rule for the current demo, **not** a finalized backend contract
 * or a permanent product invariant: whether a resolved incident with a pending
 * validation also belongs in history remains an open decision.
 *
 * Ordering uses the structured `resolvedAt` instant, newest first, matching the
 * approved frame's "Sorted by Resolved ↓".
 */
export function selectHistoryIncidents(
  all: readonly Incident[] = incidents,
): ResolvedIncident[] {
  return all
    .filter(isOperationallyResolved)
    .filter((incident) =>
      TERMINAL_VALIDATION_STATUSES.includes(incident.validationStatus),
    )
    .sort(
      (a, b) =>
        new Date(b.resolvedAt).getTime() - new Date(a.resolvedAt).getTime(),
    );
}

export interface ActiveIncidentSummary {
  /** Total number of operationally unresolved incidents. */
  total: number;
  critical: number;
  high: number;
  /** Incidents whose diagnosis is still being analyzed. */
  analyzing: number;
}

/** Derived metrics shown in the Active Incidents summary strip. */
export function selectActiveIncidentSummary(
  all: readonly Incident[] = incidents,
): ActiveIncidentSummary {
  const active = selectActiveIncidents(all);

  return {
    total: active.length,
    critical: active.filter((incident) => incident.severity === "Critical")
      .length,
    high: active.filter((incident) => incident.severity === "High").length,
    analyzing: active.filter(
      (incident) => incident.diagnosis === ANALYZING_DIAGNOSIS,
    ).length,
  };
}

export interface NeedsValidationSummary {
  /** Number of resolved incidents awaiting diagnosis validation. */
  pending: number;
  /**
   * ISO-8601 timestamp of the incident that has been pending the longest
   * (i.e. the earliest resolution time), or `null` when the queue is empty.
   * Callers format the duration against the snapshot time.
   */
  oldestPendingAt: string | null;
}

/**
 * Derived metrics shown in the Needs Validation summary strip. "Oldest pending"
 * is found by comparing structured resolution timestamps, not by parsing
 * display strings.
 */
export function selectNeedsValidationSummary(
  all: readonly Incident[] = incidents,
): NeedsValidationSummary {
  const queue = selectNeedsValidationIncidents(all);

  let oldestPendingAt: string | null = null;
  let oldestMs = Number.POSITIVE_INFINITY;

  for (const incident of queue) {
    const resolvedMs = new Date(incident.resolvedAt).getTime();
    if (resolvedMs < oldestMs) {
      oldestMs = resolvedMs;
      oldestPendingAt = incident.resolvedAt;
    }
  }

  return { pending: queue.length, oldestPendingAt };
}
