import {
  INCIDENT_SEVERITY_LEVELS,
  INCIDENT_STAGES,
  UNRESOLVED_INCIDENT_STATUSES,
  type IncidentSeverityLevel,
  type IncidentStage,
  type IncidentStatus,
} from "./types";

/**
 * Search criteria for an incident queue, in domain vocabulary.
 *
 * The same criteria drive three things: the URL (shareable, survives Back from
 * the Workspace), the query sent to Pipeline (`GET /api/v1/incidents`, applied
 * before paging when the service supports it) and, until it does, matching in
 * the browser over the whole loaded queue. One definition keeps the three in
 * agreement.
 */
export const UNCLASSIFIED_SEVERITY = "Unclassified" as const;
export type SeverityFilter = IncidentSeverityLevel | typeof UNCLASSIFIED_SEVERITY;

/**
 * Review state of an incident's diagnosis, as Pipeline filters it
 * (`diagnosis=`): one of the review statuses, or `ABSENT` (no diagnosis yet).
 */
export const DIAGNOSIS_CRITERIA = ["PENDING", "CONFIRMED", "CORRECTED", "REJECTED", "ABSENT"] as const;
export type DiagnosisCriterion = (typeof DIAGNOSIS_CRITERIA)[number];

/**
 * Resolved within the last period (a rolling window ending now): Pipeline's
 * `resolvedFrom`, for views of resolved incidents. The value is also its URL
 * token.
 */
export const RESOLVED_WITHIN = ["24h", "7d", "30d", "90d"] as const;
export type ResolvedWithin = (typeof RESOLVED_WITHIN)[number];

const HOUR_MS = 3_600_000;
const RESOLVED_WITHIN_MS: Record<ResolvedWithin, number> = {
  "24h": 24 * HOUR_MS,
  "7d": 7 * 24 * HOUR_MS,
  "30d": 30 * 24 * HOUR_MS,
  "90d": 90 * 24 * HOUR_MS,
};

/** Start of the window (epoch ms) for a period, measured back from `nowMs`. */
export function resolvedFromMs(within: ResolvedWithin, nowMs: number): number {
  return nowMs - RESOLVED_WITHIN_MS[within];
}

export interface IncidentFilters {
  /** Free text: `INC-123`/`123` matches the display number; otherwise repository or workflow name. */
  q: string;
  /** GitHub numeric repository ids. */
  repositories: string[];
  severities: SeverityFilter[];
  stages: IncidentStage[];
  statuses: IncidentStatus[];
  /** Diagnosis review state (History's Validation facet). */
  diagnoses: DiagnosisCriterion[];
  /** Resolved within this period (views of resolved incidents); `null`: any time. */
  resolvedWithin: ResolvedWithin | null;
}

export const NO_INCIDENT_FILTERS: IncidentFilters = {
  q: "",
  repositories: [],
  severities: [],
  stages: [],
  statuses: [],
  diagnoses: [],
  resolvedWithin: null,
};

/**
 * The criteria a view offers beyond search, repository, severity and stage.
 * The URL and the return from the Workspace keep only these.
 */
export interface IncidentFilterScope {
  /** Status values the view's queue can hold (its Status facet). */
  statuses?: readonly IncidentStatus[];
  /** Validation facet values. */
  diagnoses?: readonly DiagnosisCriterion[];
  /** The view lists resolved incidents: the Resolved (period) facet applies. */
  resolved?: boolean;
}

/** The scope of each incident view (stable objects, safe as hook dependencies). */
export const FILTER_SCOPES = {
  active: { statuses: UNRESOLVED_INCIDENT_STATUSES },
  validation: { resolved: true },
  history: { diagnoses: DIAGNOSIS_CRITERIA, resolved: true },
} as const satisfies Record<string, IncidentFilterScope>;

/** Shortest text query that filters (one character matches nearly everything); digits always count. */
export const MIN_QUERY_LENGTH = 2;
/** Longest text query Pipeline accepts (`400 INVALID_FILTER` beyond it). */
export const MAX_QUERY_LENGTH = 100;

/** The text query when it filters, otherwise "". */
export function activeQuery(q: string): string {
  const trimmed = q.trim();
  return trimmed.length >= MIN_QUERY_LENGTH || /^\d+$/.test(trimmed) ? trimmed : "";
}

export function hasIncidentFilters(filters: IncidentFilters): boolean {
  return (
    activeQuery(filters.q) !== "" ||
    filters.repositories.length > 0 ||
    filters.severities.length > 0 ||
    filters.stages.length > 0 ||
    filters.statuses.length > 0 ||
    filters.diagnoses.length > 0 ||
    filters.resolvedWithin !== null
  );
}

/* URL tokens: readable, lower-case, stable. */

const SEVERITY_TOKEN: Record<SeverityFilter, string> = {
  Critical: "critical",
  High: "high",
  Medium: "medium",
  Low: "low",
  Unclassified: "unclassified",
};
const STAGE_TOKEN: Record<IncidentStage, string> = {
  Deployment: "deployment",
  Infrastructure: "infrastructure",
  Testing: "testing",
  "Quality Gate": "quality-gate",
  Container: "container",
  Build: "build",
};
const STATUS_TOKEN: Record<IncidentStatus, string> = {
  Open: "open",
  "In remediation": "in-remediation",
  Verification: "verification",
  Resolved: "resolved",
};

const DIAGNOSIS_TOKEN: Record<DiagnosisCriterion, string> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CORRECTED: "corrected",
  REJECTED: "rejected",
  ABSENT: "none",
};

export const SEVERITY_FILTERS: readonly SeverityFilter[] = [...INCIDENT_SEVERITY_LEVELS, UNCLASSIFIED_SEVERITY];

export const FILTER_PARAMS = {
  q: "q",
  repository: "repo",
  severity: "severity",
  stage: "stage",
  status: "status",
  validation: "validation",
  resolved: "resolved",
} as const;

function fromTokens<T extends string>(values: string[], tokens: Record<T, string>, allowed: readonly T[]): T[] {
  const byToken = new Map(allowed.map((value) => [tokens[value], value] as const));
  const out: T[] = [];
  for (const value of values) {
    const match = byToken.get(value.toLowerCase());
    if (match && !out.includes(match)) out.push(match);
  }
  return out;
}

/**
 * Criteria from the URL. Unknown or malformed values are dropped (a shared
 * link never breaks the view), and so are criteria the view does not offer.
 */
export function readIncidentFilters(params: URLSearchParams, scope: IncidentFilterScope = {}): IncidentFilters {
  const repositories: string[] = [];
  for (const value of params.getAll(FILTER_PARAMS.repository)) {
    if (/^[1-9][0-9]{0,19}$/.test(value) && !repositories.includes(value)) repositories.push(value);
  }
  return {
    q: (params.get(FILTER_PARAMS.q) ?? "").slice(0, MAX_QUERY_LENGTH),
    repositories,
    severities: fromTokens(params.getAll(FILTER_PARAMS.severity), SEVERITY_TOKEN, SEVERITY_FILTERS),
    stages: fromTokens(params.getAll(FILTER_PARAMS.stage), STAGE_TOKEN, INCIDENT_STAGES),
    statuses: fromTokens(params.getAll(FILTER_PARAMS.status), STATUS_TOKEN, scope.statuses ?? []),
    diagnoses: fromTokens(params.getAll(FILTER_PARAMS.validation), DIAGNOSIS_TOKEN, scope.diagnoses ?? []),
    resolvedWithin: (scope.resolved && RESOLVED_WITHIN.find((value) => value === params.get(FILTER_PARAMS.resolved))) || null,
  };
}

/** The URL with these criteria, keeping every other parameter (queue, view). */
export function writeIncidentFilters(params: URLSearchParams, filters: IncidentFilters): URLSearchParams {
  const next = new URLSearchParams(params);
  for (const key of Object.values(FILTER_PARAMS)) next.delete(key);
  if (filters.q.trim()) next.set(FILTER_PARAMS.q, filters.q.trim());
  for (const id of filters.repositories) next.append(FILTER_PARAMS.repository, id);
  for (const value of filters.severities) next.append(FILTER_PARAMS.severity, SEVERITY_TOKEN[value]);
  for (const value of filters.stages) next.append(FILTER_PARAMS.stage, STAGE_TOKEN[value]);
  for (const value of filters.statuses) next.append(FILTER_PARAMS.status, STATUS_TOKEN[value]);
  for (const value of filters.diagnoses) next.append(FILTER_PARAMS.validation, DIAGNOSIS_TOKEN[value]);
  if (filters.resolvedWithin) next.set(FILTER_PARAMS.resolved, filters.resolvedWithin);
  return next;
}

/** What browser-side matching needs to know about an incident's pipeline. */
export interface IncidentRepositoryFacts {
  repositoryId: string;
  fullName: string;
  workflow: string | null;
}

interface MatchableIncident {
  displayNumber: number | null;
  severity: IncidentSeverityLevel | null;
  stage: IncidentStage;
  status: IncidentStatus;
  resolvedAt: string | null;
}

/** What matching knows about an incident beyond its own fields. */
export interface IncidentMatchFacts {
  /** `null` while the incident's repository is not known. */
  repository: IncidentRepositoryFacts | null;
  /** `null` (or absent) while the diagnosis is not known. */
  diagnosis?: DiagnosisCriterion | null;
  /** "Now" for the Resolved period: the moment the queue was read. */
  nowMs?: number;
}

/** D04 matching form: NFKC, trimmed, whitespace collapsed, locale-independent lowercase. */
function normalize(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

/** `INC-123`, `inc 123` or `123` → 123. */
function displayNumberQuery(q: string): number | null {
  const match = /^(?:inc[-\s]?)?(\d{1,12})$/i.exec(q.trim());
  return match ? Number(match[1]) : null;
}

/**
 * Browser-side matching: AND between criteria, OR within one. Text is
 * normalized (NFKC, collapsed whitespace, lowercase) and every word must
 * appear in the repository or workflow name, unless the text is an incident
 * number. Returns `null` when the answer depends on the incident's repository
 * or diagnosis (`null`: not known yet) and that is not known yet.
 */
export function matchesIncidentFilters(
  incident: MatchableIncident,
  filters: IncidentFilters,
  { repository, diagnosis = null, nowMs = Date.now() }: IncidentMatchFacts,
): boolean | null {
  if (filters.resolvedWithin) {
    const resolvedMs = incident.resolvedAt ? Date.parse(incident.resolvedAt) : Number.NaN;
    if (!(resolvedMs >= resolvedFromMs(filters.resolvedWithin, nowMs))) return false;
  }
  if (filters.severities.length && !filters.severities.includes(incident.severity ?? UNCLASSIFIED_SEVERITY)) return false;
  if (filters.stages.length && !filters.stages.includes(incident.stage)) return false;
  if (filters.statuses.length && !filters.statuses.includes(incident.status)) return false;
  if (filters.diagnoses.length && diagnosis !== null && !filters.diagnoses.includes(diagnosis)) return false;

  const q = activeQuery(filters.q);
  const number = q ? displayNumberQuery(q) : null;
  const needsRepository = filters.repositories.length > 0 || (q !== "" && number === null);
  if (needsRepository && !repository) return null;
  if (filters.diagnoses.length && diagnosis === null) return null;
  if (repository && filters.repositories.length && !filters.repositories.includes(repository.repositoryId)) return false;
  if (number !== null) return incident.displayNumber === number;
  if (q && repository) {
    // Every word must appear in the repository or the workflow name (AND between words).
    const haystack = `${normalize(repository.fullName)} ${normalize(repository.workflow ?? "")}`;
    return normalize(q).split(" ").every((token) => haystack.includes(token));
  }
  return true;
}

/**
 * Router state an incident link carries so "Back" restores the queue's
 * criteria. Only criteria travel, never a URL.
 */
export function returnFiltersState(filters: IncidentFilters): { incidentFilters: string } | undefined {
  return hasIncidentFilters(filters) ? { incidentFilters: writeIncidentFilters(new URLSearchParams(), filters).toString() } : undefined;
}

/**
 * `path` with the criteria carried in router state, re-read and re-written so
 * that only recognized criteria reach the URL; `path` alone otherwise.
 */
export function withReturnFilters(path: string, state: unknown, scope: IncidentFilterScope): string {
  if (!state || typeof state !== "object" || !("incidentFilters" in state) || typeof state.incidentFilters !== "string") return path;
  const filters = readIncidentFilters(new URLSearchParams(state.incidentFilters), scope);
  if (!hasIncidentFilters(filters)) return path;
  const [pathname, query = ""] = path.split("?", 2);
  return `${pathname}?${writeIncidentFilters(new URLSearchParams(query), filters)}`;
}
