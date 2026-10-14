/**
 * Domain vocabulary for the Incident entity.
 *
 * The literal tokens are written down exactly once here: the union types are
 * derived from the `as const` arrays/objects, and the Zod schemas in `./schema`
 * are built from the very same values. The static types and the runtime
 * contract therefore cannot drift apart.
 */

/**
 * Severity of an incident.
 *
 * Deliberately independent of pipeline criticality: a single incident is
 * classified by its own severity, not by the criticality of the pipeline it
 * originated from.
 */
export const INCIDENT_SEVERITY_LEVELS = [
  "Critical",
  "High",
  "Medium",
  "Low",
] as const;
export type IncidentSeverityLevel = (typeof INCIDENT_SEVERITY_LEVELS)[number];

/** CI/CD stage the incident originated from. */
export const INCIDENT_STAGES = [
  "Deployment",
  "Infrastructure",
  "Testing",
  "Quality Gate",
  "Container",
  "Build",
] as const;
export type IncidentStage = (typeof INCIDENT_STAGES)[number];

/**
 * Operational lifecycle state of an incident.
 *
 * Describes whether the incident itself is still open or has been operationally
 * resolved. It is deliberately independent of {@link DiagnosisValidationStatus}:
 * resolving an incident does not imply its diagnosis has been validated, and an
 * unvalidated diagnosis does not imply the incident is still open.
 *
 * The runtime values are the pre-existing ones and double as the display
 * labels, so they are kept verbatim.
 */
export const UNRESOLVED_INCIDENT_STATUSES = [
  "Open",
  "In remediation",
  "Verification",
] as const;
export type UnresolvedIncidentStatus =
  (typeof UNRESOLVED_INCIDENT_STATUSES)[number];

export const RESOLVED_INCIDENT_STATUS = "Resolved" as const;
export type ResolvedIncidentStatus = typeof RESOLVED_INCIDENT_STATUS;

export type IncidentStatus = UnresolvedIncidentStatus | ResolvedIncidentStatus;

/**
 * Domain state of the diagnosis-validation workflow for an incident's proposed
 * diagnosis.
 *
 * These are domain tokens, deliberately distinct from the display labels in
 * `entities/incident/ui/IncidentValidationStatus`.
 *
 * `Pending` is never terminal: a reviewer either confirms or rejects the
 * proposed diagnosis, which is why confirmation and rejection are modelled as
 * separate states instead of a single "validated" value. `NotApplicable` is the
 * state carried while the incident is still operationally unresolved, i.e. when
 * there is no resolution to validate yet.
 */
export const DiagnosisValidationStatus = {
  NotApplicable: "NOT_APPLICABLE",
  Pending: "PENDING",
  Confirmed: "CONFIRMED",
  Rejected: "REJECTED",
} as const;

export type DiagnosisValidationStatus =
  (typeof DiagnosisValidationStatus)[keyof typeof DiagnosisValidationStatus];
