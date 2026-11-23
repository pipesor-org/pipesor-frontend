import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  analysisBlock,
  fetchRunAnalysis,
  fetchWorkflowRuns,
  runAnalysisToCompletion,
  safeRunUrl,
  AnalysisTimeoutError,
  type AnalysisPhase,
  type RunAnalysis,
  type WorkflowRef,
  type WorkflowRun,
} from "../../../entities/workflow-run";
import { isApiError, useApiQuery } from "../../../shared/api";
import { incidentWorkspacePath } from "../../../shared/config";
import { useFormatters } from "../../../shared/i18n";
import { forEachWithConcurrency } from "../../../shared/lib";
import { Button } from "../../../shared/ui/button";
import { Skeleton } from "../../../shared/ui/skeleton";
import { Spinner } from "../../../shared/ui/spinner";

import styles from "./FailedRuns.module.css";

type RowState =
  | { kind: "checking" }
  | { kind: "idle" }
  /** The receipt could not be read (not a 404): the status is unknown, not "not analyzed". */
  | { kind: "unknown" }
  | { kind: "running"; phase: AnalysisPhase }
  | { kind: "done"; analysis: RunAnalysis }
  | { kind: "error"; key: ErrorKey };

type ErrorKey = "scopePending" | "forbidden" | "timeout" | "network" | "generic";

const key = (run: WorkflowRun) => `${run.runId}:${run.attempt}`;

function errorKey(error: unknown): ErrorKey {
  if (error instanceof AnalysisTimeoutError) return "timeout";
  if (!isApiError(error)) return "generic";
  if (error.kind === "network") return "network";
  if (error.status === 409 && error.code === "CAPTURE_SCOPE_PENDING") return "scopePending";
  if (error.status === 403) return "forbidden";
  return "generic";
}

/**
 * `request-run-analysis`: recent failed runs of a monitored workflow, read from
 * GitHub with the user's access, each with its durable analysis receipt.
 * "Analyze" records the intent, follows the phase until it is final
 * (`PUBLISHED`, or `BLOCKED` with its reason) and links to the incident
 * Pipeline opened for that run.
 */
export function FailedRuns({ workflow: { repositoryId, workflowId } }: { workflow: WorkflowRef }) {
  const workflow = useMemo(() => ({ repositoryId, workflowId }), [repositoryId, workflowId]);
  const { t } = useTranslation("pipelines");
  const { formatTimestamp } = useFormatters();
  const runs = useApiQuery(`${workflow.repositoryId}/${workflow.workflowId}/failure`, (signal) =>
    fetchWorkflowRuns(workflow, "failure", { pageSize: 10, signal }),
  );
  const [rows, setRows] = useState<Record<string, RowState>>({});
  const items = runs.state.status === "success" ? runs.state.data.items : [];

  useEffect(() => {
    if (runs.state.status !== "success") return;
    const list = runs.state.data.items;
    const controller = new AbortController();
    setRows(Object.fromEntries(list.map((run) => [key(run), { kind: "checking" } as RowState])));
    void forEachWithConcurrency(list, 4, async (run) => {
      let state: RowState;
      try {
        const analysis = await fetchRunAnalysis({ ...workflow, runId: run.runId, attempt: run.attempt }, controller.signal);
        state = analysis ? { kind: "done", analysis } : { kind: "idle" };
      } catch {
        state = { kind: "unknown" };
      }
      if (!controller.signal.aborted) setRows((previous) => ({ ...previous, [key(run)]: state }));
    });
    return () => controller.abort();
  }, [runs.state, workflow]);

  async function analyze(run: WorkflowRun) {
    const id = key(run);
    setRows((previous) => ({ ...previous, [id]: { kind: "running", phase: "ACCEPTED" } }));
    try {
      const analysis = await runAnalysisToCompletion(
        { ...workflow, runId: run.runId, attempt: run.attempt },
        { onPhase: (phase) => setRows((previous) => ({ ...previous, [id]: { kind: "running", phase } })) },
      );
      setRows((previous) => ({ ...previous, [id]: { kind: "done", analysis } }));
    } catch (failure) {
      setRows((previous) => ({ ...previous, [id]: { kind: "error", key: errorKey(failure) } }));
    }
  }

  function status(run: WorkflowRun) {
    const state = rows[key(run)] ?? { kind: "checking" };
    switch (state.kind) {
      case "checking":
        return <span className={styles.muted}>{t("runs.checking")}</span>;
      case "idle":
        // No receipt (Ingestion answers 404 ANALYSIS_NOT_FOUND): not analyzed yet, not a failure.
        return (
          <span className={styles.inline}>
            <span className={styles.muted}>{t("runs.notAnalyzed")}</span>
            <Button onClick={() => void analyze(run)}>{t("runs.analyze")}</Button>
          </span>
        );
      case "unknown":
        // Requesting an analysis is idempotent, so Analyze stays safe when the status is unknown.
        return (
          <span className={styles.inline}>
            <span className={styles.muted}>{t("runs.statusUnavailable")}</span>
            <Button onClick={() => void analyze(run)}>{t("runs.analyze")}</Button>
          </span>
        );
      case "running":
        return <span className={`${styles.muted} ${styles.inline}`} role="status"><Spinner />{t(`runs.phase.${state.phase}`)}</span>;
      case "error":
        return (
          <span className={styles.inline}>
            <span className={styles.error} role="alert">{t(`runs.error.${state.key}`)}</span>
            <Button onClick={() => void analyze(run)}>{t("runs.retry")}</Button>
          </span>
        );
      case "done":
        // Every BLOCKED receipt is final: explain why and offer no retry of the same attempt.
        if (state.analysis.phase === "BLOCKED") {
          return <span className={styles.blocked}>{t(`runs.blocked.${analysisBlock(state.analysis) ?? "other"}`)}</span>;
        }
        if (state.analysis.phase !== "PUBLISHED") {
          return (
            <span className={styles.inline}>
              <span className={styles.muted}>{t(`runs.phase.${state.analysis.phase}`)}</span>
              <Button onClick={() => void analyze(run)}>{t("runs.follow")}</Button>
            </span>
          );
        }
        return state.analysis.incidentId ? (
          <Link className={styles.link} to={incidentWorkspacePath(state.analysis.incidentId, "active")}>{t("runs.openIncident")}</Link>
        ) : (
          <span className={styles.muted}>{t("runs.analyzed")}</span>
        );
    }
  }

  return (
    <div className={styles.root}>
      {runs.state.status === "loading" && (
        <div role="status">
          <span className={styles.srOnly}>{t("runs.loading")}</span>
          <ul className={styles.list} aria-hidden="true">
            {["44%", "36%", "40%"].map((width, index) => (
              <li key={index} className={styles.row}>
                <span className={styles.run}><Skeleton width="120px" /><Skeleton width={width} /></span>
                <Skeleton width="72px" height="28px" />
              </li>
            ))}
          </ul>
        </div>
      )}
      {runs.state.status === "error" && (
        <div className={styles.inline}>
          <p role="alert">{t("runs.loadError")}</p>
          <Button onClick={runs.reload}>{t("runs.retry")}</Button>
        </div>
      )}
      {runs.state.status === "success" && items.length === 0 && <p className={styles.muted}>{t("runs.empty")}</p>}
      {items.length > 0 && (
        <ul className={styles.list}>
          {items.map((run) => {
            const url = safeRunUrl(run);
            return (
              <li key={key(run)} className={styles.row}>
                <span className={styles.run}>
                  <span className={styles.mono}>
                    {url ? (
                      <a href={url} target="_blank" rel="noreferrer noopener">
                        #{run.runId} ↗<span className={styles.srOnly}> {t("opensInNewTab")}</span>
                      </a>
                    ) : `#${run.runId}`}
                    {run.attempt > 1 && ` · ${t("runs.attempt", { attempt: run.attempt })}`}
                  </span>
                  <span className={styles.muted}>
                    {[run.headBranch, run.headSha?.slice(0, 7), formatTimestamp(run.createdAt)].filter(Boolean).join(" · ")}
                  </span>
                </span>
                <span className={styles.action}>{status(run)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
