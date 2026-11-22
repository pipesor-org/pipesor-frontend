import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";

import { DiagnosisStatusLabel, fetchIncidentDiagnosis, type DiagnosisStatus } from "../../../entities/diagnosis";
import {
  IncidentSeverity,
  STAGE_LABEL_KEY,
  STATUS_LABEL_KEY,
  githubRunUrl,
  incidentLabel,
} from "../../../entities/incident";
import { pipelineWorkflowLabel } from "../../../entities/monitored-pipeline";
import { IncidentLifecycle } from "../../../features/manage-incident-lifecycle";
import { DiagnosisReview } from "../../../features/validate-diagnosis";
import { isApiError, useApiQuery } from "../../../shared/api";
import { historyViewPath, isOperationsQueue, operationsQueuePath } from "../../../shared/config";
import { useNow } from "../../../shared/lib";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Button } from "../../../shared/ui/button";
import { AppSidebar } from "../../../widgets/app-sidebar";

import { loadWorkspace } from "../model/loadWorkspace";
import { DetailsRail } from "./DetailsRail";
import { DiagnosisSections } from "./DiagnosisSections";
import styles from "./IncidentWorkspace.module.css";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Incident Workspace at `/incidents/:incidentId` (UUID identity).
 *
 * Operational facts come from Pipeline; the diagnosis comes from
 * Recommendation and loads independently, so "analysis in progress" or a
 * diagnosis failure never hides the incident. Return navigation follows the
 * allowlisted `from` origin (D02).
 */
export function IncidentWorkspaceRoute() {
  const { t } = useTranslation("operations");
  const { incidentId = "" } = useParams();
  const [search] = useSearchParams();
  const origin = search.get("from");
  const validId = UUID.test(incidentId);
  const now = useNow();
  const heading = useRef<HTMLHeadingElement>(null);
  const workspace = useApiQuery(validId ? incidentId : null, (signal) => loadWorkspace(incidentId, signal));
  const diagnosisQuery = useApiQuery(validId ? incidentId : null, (signal) => fetchIncidentDiagnosis(incidentId, signal));
  const [reviewedStatus, setReviewedStatus] = useState<DiagnosisStatus | null>(null);

  const backTo = origin === "history" ? historyViewPath("incidents") : operationsQueuePath(isOperationsQueue(origin) ? origin : "active");
  const loaded = workspace.state.status === "success" ? workspace.state.data : null;
  const notFound = !validId || (workspace.state.status === "error" && isApiError(workspace.state.error) && workspace.state.error.status === 404);
  const diagnosis = diagnosisQuery.state.status === "success" && diagnosisQuery.state.data.kind === "ready" ? diagnosisQuery.state.data.diagnosis : null;
  const diagnosisStatus = reviewedStatus ?? diagnosis?.status ?? null;

  useEffect(() => {
    setReviewedStatus(null);
  }, [incidentId]);

  // Focus the heading once per incident when its outcome is known, not on every refresh.
  const focusedFor = useRef<string | null>(null);
  const settled = loaded !== null || notFound || workspace.state.status === "error";
  useEffect(() => {
    if (!settled || focusedFor.current === incidentId) return;
    focusedFor.current = incidentId;
    heading.current?.focus();
  }, [incidentId, settled]);

  let title: string = t("workspace.loading");
  if (notFound) title = t("workspace.notFound");
  else if (workspace.state.status === "error") title = t("workspace.loadError");
  else if (loaded) {
    const repo = loaded.pipeline?.fullName;
    const run = loaded.origin ? t("workspace.runTitle", { runId: loaded.origin.githubRunId }) : null;
    title = [repo, run].filter(Boolean).join(" · ") || incidentLabel(loaded.incident);
  }
  const runUrl = loaded?.pipeline && loaded.origin ? githubRunUrl(loaded.pipeline.fullName, loaded.origin) : null;

  return (
    <AppLayout sidebar={<AppSidebar section={origin === "history" ? "history" : "operations"} />}>
      <div className={styles.context}>
        <Link className={styles.back} to={backTo}>← {t(origin === "history" ? "workspace.backHistory" : "workspace.backOperations")}</Link>
      </div>

      <header className={styles.header}>
        <h1 ref={heading} tabIndex={-1} aria-live="polite">{title}</h1>
        {loaded && (
          <>
            <p className={styles.subtitle}>
              <span className={styles.mono}>{incidentLabel(loaded.incident)}</span>
              {loaded.pipeline && pipelineWorkflowLabel(loaded.pipeline) && <> · {pipelineWorkflowLabel(loaded.pipeline)}</>}
              {loaded.incident.summary && <> · {loaded.incident.summary}</>}
            </p>
            <div className={styles.metaRow}>
              <div className={styles.metadata}>
                <IncidentSeverity severity={loaded.incident.severity} />
                <span>{t(STATUS_LABEL_KEY[loaded.incident.status])}</span>
                <span>{t(STAGE_LABEL_KEY[loaded.incident.stage])}</span>
                {diagnosisStatus && <DiagnosisStatusLabel status={diagnosisStatus} />}
              </div>
              {runUrl && (
                <a className={styles.external} href={runUrl} target="_blank" rel="noreferrer noopener">
                  {t("workspace.viewRun")} ↗<span className={styles.srOnly}> {t("workspace.opensInNewTab")}</span>
                </a>
              )}
            </div>
          </>
        )}
      </header>

      {notFound && <p>{t("workspace.notFoundText")}</p>}
      {workspace.state.status === "error" && !notFound && (
        <div className={styles.inline}>
          <p role="alert">{t("workspace.loadError")}</p>
          <Button onClick={workspace.reload}>{t("workspace.retry")}</Button>
        </div>
      )}

      {loaded && (
        <div className={styles.columns}>
          <article className={styles.surface}>
            {diagnosisQuery.state.status === "loading" && (
              <section><p className={styles.muted} role="status">{t("diagnosis.loading")}</p></section>
            )}
            {diagnosisQuery.state.status === "error" && (
              <section className={styles.inline}>
                <p role="alert">{t("workspace.analysis.error")}</p>
                <Button onClick={diagnosisQuery.reload}>{t("workspace.retry")}</Button>
              </section>
            )}
            {diagnosisQuery.state.status === "success" && diagnosisQuery.state.data.kind === "absent" && (
              <section>
                <h2>{t("workspace.analysis.title")}</h2>
                <p>{t("workspace.analysis.text")}</p>
                <Button onClick={diagnosisQuery.reload}>{t("queue.refresh")}</Button>
              </section>
            )}
            {diagnosis && <DiagnosisSections diagnosis={diagnosis} />}
            <IncidentLifecycle
              incident={loaded.incident}
              pipeline={loaded.pipeline}
              verifications={loaded.verifications}
              onChanged={workspace.reload}
            />
            {diagnosis && (
              <DiagnosisReview
                diagnosis={diagnosis}
                canReview={loaded.pipeline ? loaded.pipeline.effectiveCapabilities.includes("OPERATE") : true}
                onReviewed={(view) => setReviewedStatus(view.status)}
              />
            )}
          </article>
          <DetailsRail data={loaded} diagnosis={diagnosis} now={now} />
        </div>
      )}
    </AppLayout>
  );
}
