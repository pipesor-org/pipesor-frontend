import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";

import { DiagnosisStatusLabel, fetchIncidentDiagnosis, type DiagnosisStatus } from "../../../entities/diagnosis";
import {
  FILTER_SCOPES,
  IncidentSeverity,
  IncidentStatusBadge,
  STAGE_LABEL_KEY,
  githubRunUrl,
  incidentLabel,
  withReturnFilters,
} from "../../../entities/incident";
import { IncidentLifecycle } from "../../../features/manage-incident-lifecycle";
import { DiagnosisReview } from "../../../features/validate-diagnosis";
import { isApiError, useApiQuery } from "../../../shared/api";
import { historyViewPath, isOperationsQueue, operationsQueuePath } from "../../../shared/config";
import { useNow } from "../../../shared/lib";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Button, buttonClassName } from "../../../shared/ui/button";
import { ChevronLeftIcon } from "../../../shared/ui/icons";
import { PageHeader } from "../../../shared/ui/page-header";
import { AppSidebar } from "../../../widgets/app-sidebar";

import { loadWorkspace } from "../model/loadWorkspace";
import { DetailsRail } from "./DetailsRail";
import { DiagnosisSections } from "./DiagnosisSections";
import { DiagnosisSkeleton, WorkspaceSkeleton } from "./WorkspaceSkeleton";
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
  const location = useLocation();
  const origin = search.get("from");
  const validId = UUID.test(incidentId);
  const now = useNow();
  const heading = useRef<HTMLHeadingElement>(null);
  const workspace = useApiQuery(validId ? incidentId : null, (signal) => loadWorkspace(incidentId, signal));
  const diagnosisQuery = useApiQuery(validId ? incidentId : null, (signal) => fetchIncidentDiagnosis(incidentId, signal));
  const [reviewedStatus, setReviewedStatus] = useState<DiagnosisStatus | null>(null);

  const queue = isOperationsQueue(origin) ? origin : "active";
  // Back restores the queue's criteria carried by the row link (recognized criteria only).
  const backTo = origin === "history"
    ? withReturnFilters(historyViewPath("incidents"), location.state, FILTER_SCOPES.history)
    : withReturnFilters(operationsQueuePath(queue), location.state, FILTER_SCOPES[queue]);
  const loaded = workspace.state.status === "success" ? workspace.state.data : null;
  const notFound = !validId || (workspace.state.status === "error" && isApiError(workspace.state.error) && workspace.state.error.status === 404);
  const diagnosis = diagnosisQuery.state.status === "success" && diagnosisQuery.state.data.kind === "ready" ? diagnosisQuery.state.data.diagnosis : null;
  // A review just made, then Recommendation's diagnosis, then the status Pipeline attaches to the incident
  // (shown at once; it trails a review by a few seconds, so it never overrides the other two).
  const diagnosisStatus = reviewedStatus ?? diagnosis?.status ?? loaded?.incident.diagnosis?.status ?? null;

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
    const run = loaded.origin ? t("workspace.runTitle", { runId: loaded.origin.githubRunId }) : null;
    title = [loaded.repository, run].filter(Boolean).join(" · ") || incidentLabel(loaded.incident);
  }
  const runUrl = loaded?.repository && loaded.origin ? githubRunUrl(loaded.repository, loaded.origin) : null;

  return (
    <AppLayout sidebar={<AppSidebar section={origin === "history" ? "history" : "operations"} />}>
      <PageHeader
        live
        divider
        headingRef={heading}
        back={
          <Link to={backTo}>
            <ChevronLeftIcon />
            {t(origin === "history" ? "workspace.backHistory" : "workspace.backOperations")}
          </Link>
        }
        title={title}
        subtitle={loaded && (
          <>
            <span className={styles.mono}>{incidentLabel(loaded.incident)}</span>
            {loaded.workflow && <> · {loaded.workflow}</>}
            {loaded.incident.summary && <> · {loaded.incident.summary}</>}
          </>
        )}
        meta={loaded && (
          <>
            <IncidentSeverity severity={loaded.incident.severity} />
            <IncidentStatusBadge status={loaded.incident.status} />
            <span>{t(STAGE_LABEL_KEY[loaded.incident.stage])}</span>
            {diagnosisStatus && <DiagnosisStatusLabel status={diagnosisStatus} />}
          </>
        )}
        actions={runUrl && (
          <a className={buttonClassName({ size: "sm" })} href={runUrl} target="_blank" rel="noreferrer noopener">
            {t("workspace.viewRun")} ↗<span className={styles.srOnly}> {t("workspace.opensInNewTab")}</span>
          </a>
        )}
      />

      {validId && workspace.state.status === "loading" && <WorkspaceSkeleton />}
      {notFound && <p>{t("workspace.notFoundText")}</p>}
      {workspace.state.status === "error" && !notFound && (
        <div className={styles.inline}>
          <p role="alert">
            {isApiError(workspace.state.error) && workspace.state.error.kind === "network"
              ? t("workspace.unreachable")
              : isApiError(workspace.state.error) && workspace.state.error.correlationId
                ? t("queue.errorCode", {
                    code: workspace.state.error.code ?? String(workspace.state.error.status),
                    reference: workspace.state.error.correlationId,
                  })
                : t("queue.error")}
          </p>
          <Button onClick={workspace.reload}>{t("workspace.retry")}</Button>
        </div>
      )}

      {loaded && (
        <div className={styles.columns}>
          <div className={styles.main}>
            <article className={styles.card}>
              {diagnosisQuery.state.status === "loading" && (
                <section className={styles.inference} role="status">
                  <span className={styles.srOnly}>{t("diagnosis.loading")}</span>
                  <DiagnosisSkeleton />
                </section>
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
                  <div><Button onClick={diagnosisQuery.reload}>{t("queue.refresh")}</Button></div>
                </section>
              )}
              {diagnosis && <DiagnosisSections diagnosis={diagnosis} />}
            </article>
            <div className={styles.card}>
              <IncidentLifecycle
                incident={loaded.incident}
                pipeline={loaded.pipeline}
                verifications={loaded.verifications}
                onChanged={workspace.reload}
              />
            </div>
            {diagnosis && (
              <div className={styles.card}>
                <DiagnosisReview
                  diagnosis={diagnosis}
                  canReview={loaded.pipeline ? loaded.pipeline.effectiveCapabilities.includes("OPERATE") : true}
                  onReviewed={(view) => setReviewedStatus(view.status)}
                />
              </div>
            )}
          </div>
          <DetailsRail data={loaded} diagnosis={diagnosis} now={now} />
        </div>
      )}
    </AppLayout>
  );
}
