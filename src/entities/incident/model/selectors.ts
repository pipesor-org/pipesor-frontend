import { incidents } from "./incidents";
import type { Incident, ResolvedIncident } from "./schema";
import { DiagnosisValidationStatus } from "./types";

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
