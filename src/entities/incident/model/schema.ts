import { z } from "zod";

import {
  DiagnosisValidationStatus,
  INCIDENT_SEVERITY_LEVELS,
  INCIDENT_STAGES,
  RESOLVED_INCIDENT_STATUS,
  UNRESOLVED_INCIDENT_STATUSES,
} from "./types";

/**
 * Runtime contract for the Incident domain.
 *
 * The schemas are built from the vocabulary in `./types`, and the TypeScript
 * types are inferred back out of them, so there is no handwritten interface to
 * keep in sync. This is the only place that decides which combinations of
 * incident fields are legal.
 */

/**
 * Fields shared by every incident, independent of lifecycle state.
 *
 * Severity is a property of the incident (not the pipeline's criticality) and
 * `assignee` is an incident-level field (not pipeline ownership). `assignee` is
 * explicitly nullable to represent the "Unassigned" state.
 */
const incidentBaseShape = {
  id: z.string().regex(/^INC-\d+$/, "Incident id must look like \"INC-1042\""),
  repository: z.string().min(1),
  workflow: z.string().min(1),
  severity: z.enum(INCIDENT_SEVERITY_LEVELS),
  stage: z.enum(INCIDENT_STAGES),
  /** Primary diagnosis line shown in the table. */
  diagnosis: z.string().min(1),
  /** Secondary diagnosis line (confidence / extra context). */
  diagnosisNote: z.string().min(1).optional(),
  /** Assignee name, or null when the incident is unassigned. */
  assignee: z.string().min(1).nullable(),
};

/**
 * An incident that is still operationally unresolved.
 *
 * A strict object shape forbids resolution-only data: an unresolved incident
 * cannot carry `resolvedAt`. Its diagnosis cannot be validated yet, so it must
 * be `NOT_APPLICABLE`. Pending time is expressed as an integer number of
 * minutes with an explicit unit (`elapsedMinutes`) because Paper only provides
 * an elapsed duration for these rows — no timestamp is reverse-engineered from
 * a display string.
 */
export const unresolvedIncidentSchema = z.strictObject({
  ...incidentBaseShape,
  status: z.enum(UNRESOLVED_INCIDENT_STATUSES),
  validationStatus: z.literal(DiagnosisValidationStatus.NotApplicable),
  elapsedMinutes: z.number().int().nonnegative(),
});

/**
 * An incident that has been operationally resolved.
 *
 * `resolvedAt` is required and validated as an ISO-8601 UTC instant (RFC 3339).
 * `elapsedMinutes` is forbidden because it is resolution-irrelevant pending
 * time. The diagnosis-validation outcome is independent of resolution — being
 * `Resolved` does NOT imply the diagnosis is `CONFIRMED`; it may equally be
 * `PENDING` or `REJECTED`.
 */
export const resolvedIncidentSchema = z.strictObject({
  ...incidentBaseShape,
  status: z.literal(RESOLVED_INCIDENT_STATUS),
  validationStatus: z.enum([
    DiagnosisValidationStatus.Pending,
    DiagnosisValidationStatus.Confirmed,
    DiagnosisValidationStatus.Rejected,
  ] as const),
  resolvedAt: z.iso.datetime(),
});

/**
 * The Incident domain contract: an incident is either operationally unresolved
 * or resolved, never a blend of both.
 */
export const incidentSchema = z.discriminatedUnion("status", [
  unresolvedIncidentSchema,
  resolvedIncidentSchema,
]);

/** Validates a collection of incidents (used at the mock-data boundary). */
export const incidentsSchema = z.array(incidentSchema);

export type UnresolvedIncident = z.infer<typeof unresolvedIncidentSchema>;
export type ResolvedIncident = z.infer<typeof resolvedIncidentSchema>;
export type Incident = z.infer<typeof incidentSchema>;
