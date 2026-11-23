import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  analysisBlock,
  fetchWorkflowRuns,
  runAnalysisToCompletion,
  safeRunUrl,
  type AnalysisPhase,
  type RunAnalysis,
  type WorkflowRef,
} from "../../../entities/workflow-run";
import { useApiQuery } from "../../../shared/api";
import { useFormatters } from "../../../shared/i18n";
import { Button } from "../../../shared/ui/button";
import { Spinner } from "../../../shared/ui/spinner";

import { startVerification } from "../api/commands";
import { lifecycleErrorKey, type LifecycleErrorKey } from "./errors";
import styles from "./IncidentLifecycle.module.css";

interface VerificationRunPickerProps {
  incidentId: string;
  workflow: WorkflowRef;
  /** Only runs created after this instant can verify the current intervention. */
  remediationStartedAt: string;
  disabled: boolean;
  onRecorded: () => void;
}

type BlockedKey = "blocked" | "blockedSourceExpired" | "blockedScopeChanged";

/** Every BLOCKED receipt is final; its reason picks the explanation. */
function blockedKey(analysis: RunAnalysis): BlockedKey {
  switch (analysisBlock(analysis)) {
    case "sourceExpired":
      return "blockedSourceExpired";
    case "scopeChanged":
      return "blockedScopeChanged";
    default:
      return "blocked";
  }
}

/**
 * Lets the operator pick the successful rerun that verifies the remediation.
 * Recording it is two steps: Ingestion captures the run (durable receipt,
 * polled until `PUBLISHED`) and returns Pipeline's `executionId`, which is
 * then linked with `POST /incidents/{id}/verification`.
 */
export function VerificationRunPicker({ incidentId, workflow, remediationStartedAt, disabled, onRecorded }: VerificationRunPickerProps) {
  const { t } = useTranslation("operations");
  const { formatTimestamp } = useFormatters();
  const groupName = useId();
  const runs = useApiQuery(`${workflow.repositoryId}/${workflow.workflowId}/success`, (signal) =>
    fetchWorkflowRuns(workflow, "success", { pageSize: 20, signal }),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<AnalysisPhase | "linking" | null>(null);
  const [error, setError] = useState<LifecycleErrorKey | BlockedKey | null>(null);

  // `createdAt` is the run's creation time and does not move when a run is
  // re-run, so later attempts stay candidates; Pipeline checks the attempt's
  // real start and answers 409 when it precedes the remediation.
  const eligible = runs.state.status === "success"
    ? runs.state.data.items.filter((run) => run.attempt > 1 || Date.parse(run.createdAt) > Date.parse(remediationStartedAt))
    : [];
  const choice = eligible.find((run) => `${run.runId}:${run.attempt}` === selected) ?? null;
  const busy = phase !== null;

  async function record() {
    if (!choice) return;
    setError(null);
    setPhase("ACCEPTED");
    let source: "capture" | "pipeline" = "capture";
    try {
      const analysis = await runAnalysisToCompletion(
        { ...workflow, runId: choice.runId, attempt: choice.attempt },
        { onPhase: setPhase },
      );
      if (analysis.phase === "BLOCKED" || !analysis.executionId) {
        setError(blockedKey(analysis));
        setPhase(null);
        return;
      }
      source = "pipeline";
      setPhase("linking");
      await startVerification(incidentId, analysis.executionId);
      setPhase(null);
      onRecorded();
    } catch (failure) {
      setError(lifecycleErrorKey(failure, source));
      setPhase(null);
    }
  }

  return (
    <div className={styles.block}>
      <h3>{t("lifecycle.verification.pickTitle")}</h3>
      <p className={styles.muted}>{t("lifecycle.verification.pickText")}</p>

      {runs.state.status === "loading" && <p className={styles.muted} role="status">{t("lifecycle.verification.loadingRuns")}</p>}
      {runs.state.status === "error" && (
        <div className={styles.inline}>
          <p role="alert">{t("lifecycle.verification.runsError")}</p>
          <Button onClick={runs.reload}>{t("workspace.retry")}</Button>
        </div>
      )}
      {runs.state.status === "success" && eligible.length === 0 && (
        <div className={styles.inline}>
          <p>{t("lifecycle.verification.noRuns")}</p>
          <Button onClick={runs.reload}>{t("queue.refresh")}</Button>
        </div>
      )}

      {eligible.length > 0 && (
        <fieldset className={styles.runs} disabled={busy || disabled}>
          <legend className={styles.srOnly}>{t("lifecycle.verification.pickTitle")}</legend>
          {eligible.map((run) => {
            const value = `${run.runId}:${run.attempt}`;
            const url = safeRunUrl(run);
            return (
              <label key={value} className={styles.run}>
                <input type="radio" name={groupName} value={value} checked={selected === value} onChange={() => setSelected(value)} />
                <span className={styles.runText}>
                  <span className={styles.mono}>
                    {t("workspace.runTitle", { runId: run.runId })}
                    {run.attempt > 1 && ` · ${t("workspace.attempt", { attempt: run.attempt })}`}
                  </span>
                  <span className={styles.muted}>
                    {[run.headBranch, run.headSha?.slice(0, 7), formatTimestamp(run.createdAt)].filter(Boolean).join(" · ")}
                  </span>
                </span>
                {url && (
                  <a href={url} target="_blank" rel="noreferrer noopener" className={styles.runLink}>
                    GitHub ↗<span className={styles.srOnly}> {t("workspace.opensInNewTab")}</span>
                  </a>
                )}
              </label>
            );
          })}
        </fieldset>
      )}

      {phase && (
        <p className={`${styles.muted} ${styles.progress}`} role="status">
          <Spinner />
          {phase === "linking" ? t("lifecycle.verification.linking") : t(`lifecycle.verification.phase.${phase}`)}
        </p>
      )}
      {error && <p className={styles.error} role="alert">{t(`lifecycle.errors.${error}`)}</p>}

      {eligible.length > 0 && (
        <div className={styles.actions}>
          <Button variant="primary" loading={busy} onClick={() => void record()} disabled={!choice || busy || disabled}>
            {busy ? t("lifecycle.submitting") : t("lifecycle.verification.record")}
          </Button>
        </div>
      )}
    </div>
  );
}
