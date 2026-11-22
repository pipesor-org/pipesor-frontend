/**
 * Domain vocabulary for the Incident entity.
 *
 * The literal tokens are written down exactly once here and the union types are
 * derived from them. `./api` maps Pipeline's wire tokens onto this vocabulary.
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
 * resolved. It is deliberately independent of the diagnosis review status:
 * resolving an incident does not imply its diagnosis has been validated.
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
