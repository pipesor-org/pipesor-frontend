import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { githubRunUrl, type Execution, type IncidentRecord } from "../../../entities/incident";
import type { PipelineRecord } from "../../../entities/monitored-pipeline";
import { useFormatters } from "../../../shared/i18n";
import { Button } from "../../../shared/ui/button";

import { resolveIncident, startRemediation } from "../api/commands";
import { lifecycleErrorKey, type LifecycleErrorKey } from "./errors";
import styles from "./IncidentLifecycle.module.css";
import { LifecycleSteps } from "./LifecycleSteps";
import { VerificationRunPicker } from "./VerificationRunPicker";

function succeeded(execution: Execution): boolean {
  if (execution.externalConclusion) return execution.externalConclusion.toLowerCase() === "success";
  return execution.failed === false;
}

interface IncidentLifecycleProps {
  incident: IncidentRecord;
  /** `null` when the pipeline read failed; commands still go to the service, which decides. */
  pipeline: PipelineRecord | null;
  /** Verification runs linked to the incident, oldest first. */
  verifications: Execution[];
  /** Reload the incident after a recorded change (or a 409). */
  onChanged: () => void;
}

/**
 * `manage-incident-lifecycle`: records human operational steps, never an
 * automated fix. OPEN → Start remediation; IN_REMEDIATION → choose the
 * successful rerun as verification; VERIFICATION → Resolve with that run.
 * Buttons reflect the caller's OPERATE capability; Pipeline enforces it and
 * the transition rules (409 on a stale state).
 */
export function IncidentLifecycle({ incident, pipeline, verifications, onChanged }: IncidentLifecycleProps) {
  const { t } = useTranslation("operations");
  const { formatTimestamp } = useFormatters();
  const titleId = useId();
  const title = useRef<HTMLHeadingElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<LifecycleErrorKey | null>(null);
  const [recorded, setRecorded] = useState(false);
  const canOperate = pipeline ? pipeline.effectiveCapabilities.includes("OPERATE") : true;
  const latest = verifications.at(-1) ?? null;
  const latestUrl = latest && pipeline ? githubRunUrl(pipeline.fullName, latest) : null;

  function changed() {
    setRecorded(true);
    onChanged();
    // The action button is replaced by the next step; keep focus in this section.
    title.current?.focus();
  }

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    setRecorded(false);
    try {
      await action();
      changed();
    } catch (failure) {
      const key = lifecycleErrorKey(failure, "pipeline");
      setError(key);
      if (key === "conflict") onChanged();
    } finally {
      setBusy(false);
    }
  }

  const verificationRun = latest && (
    <p className={styles.runLine}>
      <span className={styles.muted}>{t("lifecycle.verification.run")}</span>{" "}
      {latestUrl ? (
        <a className={styles.mono} href={latestUrl} target="_blank" rel="noreferrer noopener">
          #{latest.githubRunId} ↗<span className={styles.srOnly}> {t("workspace.opensInNewTab")}</span>
        </a>
      ) : (
        <span className={styles.mono}>#{latest.githubRunId}</span>
      )}{" "}
      <span className={succeeded(latest) ? styles.success : styles.error}>
        · {t(succeeded(latest) ? "lifecycle.verification.success" : "lifecycle.verification.failed")}
      </span>
    </p>
  );

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <h2 id={titleId} ref={title} tabIndex={-1} className={styles.title}>{t("lifecycle.title")}</h2>
      <LifecycleSteps status={incident.status} />
      {!canOperate && incident.status !== "Resolved" && <p className={styles.notice}>{t("lifecycle.needsOperate")}</p>}

      {incident.status === "Open" && (
        <>
          <p className={styles.muted}>{t("lifecycle.remediation.text")}</p>
          <div className={styles.actions}>
            <Button variant="primary" disabled={busy || !canOperate} onClick={() => void run(() => startRemediation(incident.id))}>
              {busy ? t("lifecycle.submitting") : t("lifecycle.remediation.start")}
            </Button>
          </div>
        </>
      )}

      {incident.status === "In remediation" && incident.remediationStartedAt && (
        <>
          <p>{t("lifecycle.remediation.startedAt", { time: formatTimestamp(incident.remediationStartedAt) })}</p>
          {pipeline ? (
            <VerificationRunPicker
              incidentId={incident.id}
              workflow={{ repositoryId: pipeline.githubRepositoryId, workflowId: pipeline.githubWorkflowId }}
              remediationStartedAt={incident.remediationStartedAt}
              disabled={!canOperate}
              onRecorded={changed}
            />
          ) : (
            <p className={styles.muted}>{t("lifecycle.verification.pipelineUnavailable")}</p>
          )}
        </>
      )}

      {incident.status === "Verification" && (
        <>
          {verificationRun}
          <p className={styles.muted}>{t("lifecycle.verification.observed")}</p>
          {latest && succeeded(latest) ? (
            <div className={styles.actions}>
              <Button variant="primary" disabled={busy || !canOperate} onClick={() => void run(() => resolveIncident(incident.id, latest.id))}>
                {busy ? t("lifecycle.submitting") : t("lifecycle.resolve")}
              </Button>
            </div>
          ) : (
            <p className={styles.muted}>{t("lifecycle.verification.notSuccessful")}</p>
          )}
        </>
      )}

      {incident.status === "Resolved" && (
        <>
          {incident.resolvedAt && <p>{t("lifecycle.resolvedAt", { time: formatTimestamp(incident.resolvedAt) })}</p>}
          {verificationRun}
          <p className={styles.muted}>{t("lifecycle.validationIndependent")}</p>
        </>
      )}

      {error && <p className={styles.error} role="alert">{t(`lifecycle.errors.${error}`)}</p>}
      <p className={styles.success} role="status">{recorded ? t("lifecycle.recorded") : ""}</p>
    </section>
  );
}
