import { useCallback, useEffect, useRef, useState } from "react";

import { fetchIncidentDiagnosis, type DiagnosisStatus } from "../../../entities/diagnosis";
import { fetchIncidentQueue, type IncidentQueueState, type IncidentRecord } from "../../../entities/incident";
import { getPipeline, pipelineWorkflowLabel } from "../../../entities/monitored-pipeline";
import { forEachWithConcurrency } from "../../../shared/lib";

/** Diagnosis reads per page run with this many requests in flight. */
const DIAGNOSIS_CONCURRENCY = 6;

export type RowDiagnosis =
  | { kind: "loading" }
  | { kind: "absent" }
  | { kind: "error" }
  | { kind: "ready"; probableCause: string; status: DiagnosisStatus; createdAt: string };

export type RowPipeline = { kind: "loading" } | { kind: "error" } | { kind: "ready"; fullName: string; workflow: string | null };

export interface QueueRow {
  incident: IncidentRecord;
  pipeline: RowPipeline;
  diagnosis: RowDiagnosis;
}

export interface IncidentQueue {
  status: "loading" | "ready" | "error";
  rows: QueueRow[];
  hasMore: boolean;
  loadingMore: boolean;
  error: unknown;
  loadedAt: number | null;
  loadMore: () => void;
  reload: () => void;
}

interface QueueData {
  status: IncidentQueue["status"];
  rows: QueueRow[];
  nextPageToken: string | null;
  loadingMore: boolean;
  error: unknown;
  loadedAt: number | null;
}

const INITIAL: QueueData = { status: "loading", rows: [], nextPageToken: null, loadingMore: false, error: null, loadedAt: null };

/**
 * One Pipeline lifecycle queue (`GET /api/v1/incidents?state=`), page by page.
 *
 * Each loaded row is completed with its pipeline (shared, cached read) and its
 * diagnosis (one Recommendation call per row, limited concurrency, loaded
 * page only — the documented MVP limitation). `404 diagnosis_absent` is the
 * "Analyzing…" state. A reload discards results of the previous generation.
 */
export function useIncidentQueue(state: IncidentQueueState): IncidentQueue {
  const [data, setData] = useState<QueueData>(INITIAL);
  const generation = useRef(0);

  const patchRows = useCallback((gen: number, match: (row: QueueRow) => boolean, patch: (row: QueueRow) => Partial<QueueRow>) => {
    if (generation.current !== gen) return;
    setData((previous) => ({ ...previous, rows: previous.rows.map((row) => (match(row) ? { ...row, ...patch(row) } : row)) }));
  }, []);

  const enrich = useCallback(
    (incidents: IncidentRecord[], gen: number) => {
      for (const pipelineId of new Set(incidents.map((incident) => incident.pipelineId))) {
        getPipeline(pipelineId).then(
          (pipeline) =>
            patchRows(gen, (row) => row.incident.pipelineId === pipelineId, () => ({
              pipeline: { kind: "ready", fullName: pipeline.fullName, workflow: pipelineWorkflowLabel(pipeline) },
            })),
          () => patchRows(gen, (row) => row.incident.pipelineId === pipelineId, () => ({ pipeline: { kind: "error" } })),
        );
      }
      void forEachWithConcurrency(incidents, DIAGNOSIS_CONCURRENCY, async (incident) => {
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

  const loadPage = useCallback(
    async (pageToken: string | null, gen: number) => {
      try {
        const page = await fetchIncidentQueue(state, pageToken);
        if (generation.current !== gen) return;
        const rows = page.items.map<QueueRow>((incident) => ({ incident, pipeline: { kind: "loading" }, diagnosis: { kind: "loading" } }));
        setData((previous) => {
          const known = new Set(previous.rows.map((row) => row.incident.id));
          return {
            status: "ready",
            rows: pageToken ? [...previous.rows, ...rows.filter((row) => !known.has(row.incident.id))] : rows,
            nextPageToken: page.nextPageToken,
            loadingMore: false,
            error: null,
            loadedAt: pageToken ? previous.loadedAt : Date.now(),
          };
        });
        enrich(page.items, gen);
      } catch (error) {
        if (generation.current !== gen) return;
        setData((previous) => (pageToken ? { ...previous, loadingMore: false, error } : { ...INITIAL, status: "error", error }));
      }
    },
    [state, enrich],
  );

  const reload = useCallback(() => {
    const gen = ++generation.current;
    setData(INITIAL);
    void loadPage(null, gen);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    setData((previous) => {
      if (!previous.nextPageToken || previous.loadingMore) return previous;
      void loadPage(previous.nextPageToken, generation.current);
      return { ...previous, loadingMore: true, error: null };
    });
  }, [loadPage]);

  /** Ignores every in-flight result, e.g. after unmount. */
  const invalidate = useCallback(() => {
    generation.current++;
  }, []);

  useEffect(() => {
    reload();
    return invalidate;
  }, [reload, invalidate]);

  return {
    status: data.status,
    rows: data.rows,
    hasMore: data.nextPageToken !== null,
    loadingMore: data.loadingMore,
    error: data.error,
    loadedAt: data.loadedAt,
    loadMore,
    reload,
  };
}
