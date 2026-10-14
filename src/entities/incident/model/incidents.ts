import { incidentsSchema, type Incident } from "./schema";

/**
 * Snapshot time the Operations data was captured. Pending durations are
 * measured against this value and the summary strips display it verbatim.
 */
export const INCIDENT_SNAPSHOT_AT = "2026-09-30T10:30:00Z";

/**
 * Central mock dataset for the Operations domain.
 *
 * Values mirror the "Operations — Active Incidents" and
 * "Operations — Needs Validation" frames in the Paper source. Every visible
 * count and summary metric is derived from this array via the selectors in
 * `./selectors` — do not hardcode numbers in the UI.
 *
 * This is the data boundary: the raw fixtures are validated against the Zod
 * contract in `./schema` at module load, so a fixture that violates the domain
 * model fails loudly here instead of surfacing as a broken screen. The raw
 * array is intentionally left untyped — runtime validation, not a cast, is what
 * gives `incidents` its `Incident[]` type.
 *
 * The array intentionally mixes both Operations queues:
 * - operationally unresolved incidents (Active Incidents), and
 * - resolved incidents whose diagnosis validation is still pending.
 *
 * See `selectActiveIncidents` / `selectNeedsValidationIncidents`.
 */
const rawIncidents = [
  // --- Active Incidents: operationally unresolved ---
  {
    id: "INC-1042",
    repository: "acme/payments-api",
    workflow: "Deploy production",
    severity: "Critical",
    stage: "Deployment",
    diagnosis: "Missing deployment secret",
    diagnosisNote: "Probable cause · 91% confidence",
    status: "In remediation",
    validationStatus: "NOT_APPLICABLE",
    assignee: "Alex Chen",
    elapsedMinutes: 134,
  },
  {
    id: "INC-1047",
    repository: "acme/platform-infra",
    workflow: "Provision infrastructure",
    severity: "Critical",
    stage: "Infrastructure",
    diagnosis: "Analyzing evidence…",
    status: "Open",
    validationStatus: "NOT_APPLICABLE",
    assignee: null,
    elapsedMinutes: 48,
  },
  {
    id: "INC-1045",
    repository: "acme/checkout-api",
    workflow: "Integration tests",
    severity: "High",
    stage: "Testing",
    diagnosis: "Diagnosis inconclusive",
    diagnosisNote: "Insufficient correlated evidence",
    status: "Open",
    validationStatus: "NOT_APPLICABLE",
    assignee: null,
    elapsedMinutes: 82,
  },
  {
    id: "INC-1036",
    repository: "acme/identity-api",
    workflow: "Code quality checks",
    severity: "Medium",
    stage: "Quality Gate",
    diagnosis: "Coverage below configured threshold",
    diagnosisNote: "Probable cause · 94% confidence",
    status: "Verification",
    validationStatus: "NOT_APPLICABLE",
    assignee: "Alex Chen",
    elapsedMinutes: 250,
  },
  {
    id: "INC-1049",
    repository: "acme/worker-service",
    workflow: "Build container image",
    severity: "Medium",
    stage: "Container",
    diagnosis: "Analyzing evidence…",
    status: "Open",
    validationStatus: "NOT_APPLICABLE",
    assignee: null,
    elapsedMinutes: 26,
  },
  {
    id: "INC-1050",
    repository: "acme/docs-site",
    workflow: "Build documentation",
    severity: "Low",
    stage: "Build",
    diagnosis: "Unsupported Node.js version",
    diagnosisNote: "Probable cause · 86% confidence",
    status: "Open",
    validationStatus: "NOT_APPLICABLE",
    assignee: "Sam Rivera",
    elapsedMinutes: 12,
  },

  // --- Needs Validation: resolved, diagnosis validation pending ---
  {
    id: "INC-1020",
    repository: "acme/identity-api",
    workflow: "Code quality checks",
    severity: "Medium",
    stage: "Quality Gate",
    diagnosis: "Coverage below configured threshold",
    status: "Resolved",
    validationStatus: "PENDING",
    assignee: "Alex Chen",
    resolvedAt: "2026-09-28T09:30:00Z",
  },
  {
    id: "INC-1022",
    repository: "acme/payments-api",
    workflow: "Deploy production",
    severity: "High",
    stage: "Deployment",
    diagnosis: "Missing deployment secret",
    status: "Resolved",
    validationStatus: "PENDING",
    assignee: "Sam Rivera",
    resolvedAt: "2026-09-28T15:10:00Z",
  },
  {
    id: "INC-1024",
    repository: "acme/docs-site",
    workflow: "Build documentation",
    severity: "Low",
    stage: "Build",
    diagnosis: "Unsupported Node.js version",
    status: "Resolved",
    validationStatus: "PENDING",
    assignee: null,
    resolvedAt: "2026-09-29T08:15:00Z",
  },
  {
    id: "INC-1026",
    repository: "acme/platform-infra",
    workflow: "Provision infrastructure",
    severity: "Critical",
    stage: "Infrastructure",
    diagnosis: "Expired cloud authentication token",
    status: "Resolved",
    validationStatus: "PENDING",
    assignee: "Alex Chen",
    resolvedAt: "2026-09-29T15:00:00Z",
  },
  {
    id: "INC-1028",
    repository: "acme/worker-service",
    workflow: "Build container image",
    severity: "Medium",
    stage: "Container",
    diagnosis: "Base image tag not found",
    status: "Resolved",
    validationStatus: "PENDING",
    assignee: "Sam Rivera",
    resolvedAt: "2026-09-30T07:45:00Z",
  },
  {
    id: "INC-1039",
    repository: "acme/web-storefront",
    workflow: "Build and test",
    severity: "High",
    stage: "Build",
    diagnosis: "Dependency version mismatch",
    status: "Resolved",
    validationStatus: "PENDING",
    assignee: "Maya Patel",
    resolvedAt: "2026-09-30T09:28:12Z",
  },
  {
    id: "INC-1040",
    repository: "acme/checkout-api",
    workflow: "Integration tests",
    severity: "High",
    stage: "Testing",
    diagnosis: "Test fixture missing required field",
    status: "Resolved",
    validationStatus: "PENDING",
    assignee: "Maya Patel",
    resolvedAt: "2026-09-30T10:05:00Z",
  },
];

/** The validated Operations dataset. Throws a `ZodError` if a fixture is invalid. */
export const incidents: Incident[] = incidentsSchema.parse(rawIncidents);
