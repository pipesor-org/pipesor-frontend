import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { fetchIncidentDiagnosis, type DiagnosisStatus } from "../../../entities/diagnosis";
import {
  MAX_PAGE_SIZE,
  NO_INCIDENT_FILTERS,
  fetchIncidentQueue,
  hasIncidentFilters,
  matchesIncidentFilters,
  type DiagnosisCriterion,
  type IncidentFilters,
  type IncidentQueueState,
  type IncidentRecord,
} from "../../../entities/incident";
import { getPipeline, pipelineWorkflowLabel } from "../../../entities/monitored-pipeline";
import { forEachWithConcurrency } from "../../../shared/lib";

import { readWholeQueue } from "./readWholeQueue";

/** Diagnosis reads run with this many requests in flight. */
const DIAGNOSIS_CONCURRENCY = 6;

/**
 * Browser-side filtering reads the whole queue up to this many incidents. It
 * is the bridge until Pipeline filters before paging; the view says when the
 * cap is reached.
 */
export const BROWSER_FILTER_CAP = 500;

export type RowDiagnosis =
  | { kind: "loading" }
  | { kind: "absent" }
  | { kind: "error" }
  | { kind: "ready"; probableCause: string; status: DiagnosisStatus; createdAt: string };

export type RowPipeline =
  | { kind: "loading" }
  | { kind: "error" }
  | { kind: "ready"; repositoryId: string; fullName: string; workflow: string | null };

export interface QueueRow {
  incident: IncidentRecord;
  pipeline: RowPipeline;
  diagnosis: RowDiagnosis;
}

/** How the rows relate to the queue. */
export type QueueScope =
  /** No criteria: the queue page by page. */
  | { kind: "all" }
  /** Pipeline applied the criteria before paging; `total` when it reports it. */
  | { kind: "service"; total: number | null }
  /**
   * Criteria applied here over the queue read up to the cap: `matched` of
   * `loaded`, `truncated` when the cap was reached, `pending` while some rows
   * wait for their repository to be known.
   */
  | { kind: "browser"; matched: number; loaded: number; truncated: boolean; pending: boolean };

export interface IncidentQueue {
  status: "idle" | "loading" | "ready" | "error";
  /** Exact number of incidents in the queue (with its criteria) when Pipeline reports it. */
  total: number | null;
  /** Pipeline applied the queue's criteria (filters and the defining diagnosis) before paging. */
  filteredByService: boolean;
  /** Rows to show: the loaded queue, or the matching rows when filtering here. */
  rows: QueueRow[];
  scope: QueueScope;
  hasMore: boolean;
  loadingMore: boolean;
  error: unknown;
  loadedAt: number | null;
  loadMore: () => void;
  /** Reads the queue again (explicit refresh), discarding cached rows. */
  reload: () => void;
}

interface QueueOptions {
  filters?: IncidentFilters;
  /**
   * Diagnosis criterion that defines the queue itself (Needs Validation:
   * `PENDING`). Sent to Pipeline; when the service ignores it, the caller
   * still selects rows by their diagnosis, as before.
   */
  diagnosis?: readonly DiagnosisCriterion[];
  /** `false` keeps the queue idle (no requests), e.g. while the view shows another source. */
  enabled?: boolean;
}

type Mode = "all" | "service" | "browser";

interface QueueData {
  status: IncidentQueue["status"];
  mode: Mode;
  /** Every loaded row (in browser mode, the whole queue up to the cap). */
  rows: QueueRow[];
  nextPageToken: string | null;
  total: number | null;
  truncated: boolean;
  loadingMore: boolean;
  error: unknown;
  loadedAt: number | null;
}

const IDLE: QueueData = {
  status: "idle",
  mode: "all",
  rows: [],
  nextPageToken: null,
  total: null,
  truncated: false,
  loadingMore: false,
  error: null,
  loadedAt: null,
};

/**
 * Whether Pipeline applies filters before paging, learned from the first
 * filtered read of the session (it echoes `appliedFilters`). `null` until then.
 */
let serviceFiltering: boolean | null = null;

/** Rows start from what Pipeline already provides with each incident; the rest is read per row. */
function toRows(items: IncidentRecord[]): QueueRow[] {
  return items.map((incident) => ({
    incident,
    pipeline: incident.repository
      ? { kind: "ready", repositoryId: incident.repository.repositoryId, fullName: incident.repository.fullName, workflow: incident.repository.workflow }
      : { kind: "loading" },
    diagnosis: incident.diagnosis === undefined
      ? { kind: "loading" }
      : incident.diagnosis === null
        ? { kind: "absent" }
        : { kind: "ready", probableCause: incident.diagnosis.probableCause ?? "", status: incident.diagnosis.status, createdAt: incident.diagnosis.createdAt },
  }));
}

function rowMatch(row: QueueRow, filters: IncidentFilters): boolean | null {
  const repository = row.pipeline.kind === "ready"
    ? { repositoryId: row.pipeline.repositoryId, fullName: row.pipeline.fullName, workflow: row.pipeline.workflow }
    : null;
  const match = matchesIncidentFilters(row.incident, repository, filters);
  // A pipeline that cannot be read never matches a repository criterion.
  return match === null && row.pipeline.kind === "error" ? false : match;
}

/**
 * One Pipeline lifecycle queue (`GET /api/v1/incidents?state=`).
 *
 * Without criteria it reads page by page. With criteria it asks Pipeline to
 * filter before paging; when the service does not confirm it (no
 * `appliedFilters` echo), it reads the whole queue up to `BROWSER_FILTER_CAP`
 * once and filters here, so a match on an unloaded page is never missed.
 * Changing criteria in that mode re-filters without reading again.
 *
 * Each row is completed with its pipeline (shared, cached read) and its
 * diagnosis (one Recommendation call per shown row, limited concurrency).
 * `404 diagnosis_absent` is the "Analyzing…" state. A reload discards results
 * of the previous generation.
 */
export function useIncidentQueue(
  state: IncidentQueueState,
  { filters = NO_INCIDENT_FILTERS, diagnosis, enabled = true }: QueueOptions = {},
): IncidentQueue {
  const [data, setData] = useState<QueueData>(IDLE);
  // Latest committed data, read synchronously when deciding how to load.
  const dataRef = useRef(data);
  dataRef.current = data;
  const generation = useRef(0);
  const requestedDiagnoses = useRef(new Set<string>());
  const active = hasIncidentFilters(filters);
  const filtersKey = JSON.stringify([filters, diagnosis ?? []]);
  const criteria = useRef(filters);
  criteria.current = filters;
  const base = useRef(diagnosis);
  base.current = diagnosis;

  const patchRows = useCallback((gen: number, match: (row: QueueRow) => boolean, patch: (row: QueueRow) => Partial<QueueRow>) => {
    if (generation.current !== gen) return;
    setData((previous) => ({ ...previous, rows: previous.rows.map((row) => (match(row) ? { ...row, ...patch(row) } : row)) }));
  }, []);

  const enrichPipelines = useCallback(
    (incidents: IncidentRecord[], gen: number) => {
      const unknown = incidents.filter((incident) => !incident.repository);
      for (const pipelineId of new Set(unknown.map((incident) => incident.pipelineId))) {
        getPipeline(pipelineId).then(
          (pipeline) =>
            patchRows(gen, (row) => row.incident.pipelineId === pipelineId, () => ({
              pipeline: {
                kind: "ready",
                repositoryId: pipeline.githubRepositoryId,
                fullName: pipeline.fullName,
                workflow: pipelineWorkflowLabel(pipeline),
              },
            })),
          () =>
            patchRows(gen, (row) => row.incident.pipelineId === pipelineId && row.pipeline.kind === "loading", () => ({
              pipeline: { kind: "error" },
            })),
        );
      }
    },
    [patchRows],
  );

  const enrichDiagnoses = useCallback(
    (incidents: IncidentRecord[], gen: number) => {
      const pending = incidents.filter((incident) => !requestedDiagnoses.current.has(incident.id));
      for (const incident of pending) requestedDiagnoses.current.add(incident.id);
      void forEachWithConcurrency(pending, DIAGNOSIS_CONCURRENCY, async (incident) => {
        if (generation.current !== gen) return;
        let diagnosis: RowDiagnosis;
        try {
          const read = await fetchIncidentDiagnosis(incident.id);
          diagnosis = read.kind === "absent"
            ? { kind: "absent" }
            : {
                kind: "ready",
                probableCause: read.diagnosis.hypothesis.probableCause,
                status: read.diagnosis.status,
                createdAt: read.diagnosis.createdAt,
              };
        } catch {
          diagnosis = { kind: "error" };
        }
        patchRows(gen, (row) => row.incident.id === incident.id, () => ({ diagnosis }));
      });
    },
    [patchRows],
  );

  /** Reads the whole queue (largest pages) up to the cap and filters here. */
  const loadForBrowser = useCallback(
    async (gen: number) => {
      const whole = await readWholeQueue(
        (token) => fetchIncidentQueue(state, token, { pageSize: MAX_PAGE_SIZE }),
        BROWSER_FILTER_CAP,
        () => generation.current === gen,
      );
      if (!whole) return;
      setData({ ...IDLE, status: "ready", mode: "browser", rows: toRows(whole.items), truncated: whole.truncated, loadedAt: Date.now() });
      enrichPipelines(whole.items, gen);
    },
    [state, enrichPipelines],
  );

  const loadPage = useCallback(
    async (pageToken: string | null, gen: number, filtered: boolean) => {
      const userFilters = hasIncidentFilters(criteria.current);
      const page = await fetchIncidentQueue(state, pageToken, filtered ? { filters: criteria.current, diagnosis: base.current } : {});
      if (generation.current !== gen) return;
      if (filtered && !page.filteredByService) {
        serviceFiltering = false;
        if (userFilters) {
          // The service ignored the criteria: filter here over the whole queue instead.
          await loadForBrowser(gen);
          return;
        }
        // Only the defining criterion was ignored: this is the plain queue page; the caller selects rows.
        filtered = false;
      }
      if (filtered) serviceFiltering = true;
      const rows = toRows(page.items);
      setData((previous) => {
        const known = new Set(previous.rows.map((row) => row.incident.id));
        return {
          ...IDLE,
          status: "ready",
          mode: filtered ? "service" : "all",
          rows: pageToken ? [...previous.rows, ...rows.filter((row) => !known.has(row.incident.id))] : rows,
          nextPageToken: page.nextPageToken,
          total: page.total,
          loadedAt: pageToken ? previous.loadedAt : Date.now(),
        };
      });
      enrichPipelines(page.items, gen);
    },
    [state, enrichPipelines, loadForBrowser],
  );

  const load = useCallback(
    (refetch: boolean) => {
      const filtered = hasIncidentFilters(criteria.current);
      const defined = Boolean(base.current?.length);
      const current = dataRef.current;
      // Browser mode already holds the whole queue: new criteria only re-filter
      // it (the view recomputes), and in-flight enrichment stays valid.
      if (!refetch && filtered && current.mode === "browser" && current.status === "ready") return;
      const gen = ++generation.current;
      setData({ ...IDLE, status: "loading" });
      requestedDiagnoses.current = new Set();
      const run = filtered && serviceFiltering === false
        ? loadForBrowser(gen)
        : loadPage(null, gen, (filtered || defined) && serviceFiltering !== false);
      run.catch((error: unknown) => {
        if (generation.current === gen) setData({ ...IDLE, status: "error", error });
      });
    },
    [loadForBrowser, loadPage],
  );

  const reload = useCallback(() => load(true), [load]);

  const loadMore = useCallback(() => {
    setData((previous) => {
      if (!previous.nextPageToken || previous.loadingMore || previous.mode === "browser") return previous;
      const gen = generation.current;
      loadPage(previous.nextPageToken, gen, previous.mode === "service").catch((error: unknown) => {
        if (generation.current === gen) setData((current) => ({ ...current, loadingMore: false, error }));
      });
      return { ...previous, loadingMore: true, error: null };
    });
  }, [loadPage]);

  // Read on mount and whenever the state or the criteria change.
  useEffect(() => {
    if (!enabled) return;
    load(false);
  }, [enabled, state, filtersKey, load]);

  // Ignore every in-flight result after unmount.
  useEffect(() => () => {
    generation.current++;
  }, []);

  const view = useMemo(() => {
    if (data.mode !== "browser") return { rows: data.rows, matched: data.rows.length, pending: false };
    const rows: QueueRow[] = [];
    let pending = false;
    for (const row of data.rows) {
      const match = rowMatch(row, filters);
      if (match === true) rows.push(row);
      else if (match === null) pending = true;
    }
    return { rows, matched: rows.length, pending };
    // `filtersKey` stands for `filters` (a new object on every render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.mode, data.rows, filtersKey]);

  // Diagnoses are read only for rows that are shown.
  useEffect(() => {
    if (!enabled || data.status !== "ready") return;
    // Rows that already carry their diagnosis (from Pipeline) need no read.
    const missing = view.rows
      .filter((row) => row.diagnosis.kind === "loading" && !requestedDiagnoses.current.has(row.incident.id))
      .map((row) => row.incident);
    if (missing.length) enrichDiagnoses(missing, generation.current);
  }, [enabled, data.status, view.rows, enrichDiagnoses]);

  const scope: QueueScope =
    data.mode === "browser"
      ? { kind: "browser", matched: view.matched, loaded: data.rows.length, truncated: data.truncated, pending: view.pending }
      : data.mode === "service" && active
        ? { kind: "service", total: data.total }
        : { kind: "all" };

  return {
    status: enabled ? data.status : "idle",
    total: data.mode === "service" ? data.total : null,
    filteredByService: data.mode === "service",
    rows: view.rows,
    scope,
    hasMore: data.mode !== "browser" && data.nextPageToken !== null,
    loadingMore: data.loadingMore,
    error: data.error,
    loadedAt: data.loadedAt,
    loadMore,
    reload,
  };
}
