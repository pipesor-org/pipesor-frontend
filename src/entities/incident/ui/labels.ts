import type {
  IncidentSeverityLevel,
  IncidentStage,
  IncidentStatus,
} from "../model/types";

/**
 * Presentation mappings from canonical Incident domain values to translation
 * keys (in the `operations` namespace).
 *
 * The domain model keeps its canonical tokens untouched; only the UI layer
 * decides how those tokens are displayed. `satisfies` keeps each map exhaustive
 * over its union, so adding a domain value is a compile error until it has copy.
 */

export const SEVERITY_LABEL_KEY = {
  Critical: "severity.critical",
  High: "severity.high",
  Medium: "severity.medium",
  Low: "severity.low",
} as const satisfies Record<IncidentSeverityLevel, string>;

export const STATUS_LABEL_KEY = {
  Open: "status.open",
  "In remediation": "status.inRemediation",
  Verification: "status.verification",
  Resolved: "status.resolved",
} as const satisfies Record<IncidentStatus, string>;

export const STAGE_LABEL_KEY = {
  Deployment: "stage.deployment",
  Infrastructure: "stage.infrastructure",
  Testing: "stage.testing",
  "Quality Gate": "stage.qualityGate",
  Container: "stage.container",
  Build: "stage.build",
} as const satisfies Record<IncidentStage, string>;
