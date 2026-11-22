import { useTranslation } from "react-i18next";
import { Navigate, useSearchParams } from "react-router-dom";

import { incidentLabel } from "../../../entities/incident";
import {
  DEFAULT_HISTORY_VIEW,
  HISTORY_VIEW_PARAM,
  historyViewPath,
  isHistoryView,
  parseHistoryView,
} from "../../../shared/config";
import { useNow } from "../../../shared/lib";
import { AppLayout } from "../../../shared/ui/app-layout";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { HistoryIncidentsTable, type HistoryIncidentRow } from "../../../widgets/history-incidents-table";
import { HistoryInsights, type InsightsRecord } from "../../../widgets/history-insights";
import { LoadMore, QueueStatus, useIncidentQueue, type QueueRow } from "../../../widgets/incident-queue";

import { HistoryHeader } from "./HistoryHeader";
import { HistoryTabs } from "./HistoryTabs";
import styles from "./HistoryPage.module.css";

function elapsed(fromIso: string, toIso: string | null): number | null {
  if (!toIso) return null;
  const value = Date.parse(toIso) - Date.parse(fromIso);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function toHistoryRow({ incident, pipeline, diagnosis }: QueueRow): HistoryIncidentRow | null {
  if (!incident.resolvedAt) return null;
  return {
    id: incident.id,
    label: incidentLabel(incident),
    stage: incident.stage,
    resolvedAt: incident.resolvedAt,
    pipeline: pipeline.kind === "ready" ? { kind: "ready", value: { repository: pipeline.fullName, workflow: pipeline.workflow } } : pipeline,
    diagnosis: diagnosis.kind === "ready" ? { kind: "ready", value: { probableCause: diagnosis.probableCause, status: diagnosis.status } } : diagnosis,
    diagnosisMs: diagnosis.kind === "ready" ? elapsed(incident.detectedAt, diagnosis.createdAt) : null,
    resolutionMs: elapsed(incident.detectedAt, incident.resolvedAt),
  };
}

function toInsightsRecord({ incident, pipeline, diagnosis }: QueueRow): InsightsRecord | null {
  if (!incident.resolvedAt || diagnosis.kind === "loading" || pipeline.kind === "loading") return null;
  return {
    incidentId: incident.id,
    detectedAt: incident.detectedAt,
    resolvedAt: incident.resolvedAt,
    stage: incident.stage,
    pipelineId: incident.pipelineId,
    repository: pipeline.kind === "ready" ? pipeline.fullName : null,
    workflow: pipeline.kind === "ready" ? pipeline.workflow : null,
    diagnosisCreatedAt: diagnosis.kind === "ready" ? diagnosis.createdAt : null,
    outcome: diagnosis.kind === "ready" ? diagnosis.status : null,
  };
}

/**
 * History (`/history?view=incidents|insights`).
 *
 * Both views read Pipeline's `RESOLVED` queue, completed per row with the
 * pipeline and the diagnosis from Recommendation, and share one loaded
 * population: Incidents lists it newest first, Insights aggregates it in the
 * browser. Search and facets from Paper are not offered because the service
 * has no query criteria (owner decision); loading more pages widens both views.
 */
export function HistoryPage() {
  const { t } = useTranslation("history");
  const [searchParams] = useSearchParams();
  const rawView = searchParams.get(HISTORY_VIEW_PARAM);
  const resolved = useIncidentQueue("RESOLVED");
  const now = useNow();

  if (rawView !== null && !isHistoryView(rawView)) {
    return <Navigate to={historyViewPath(DEFAULT_HISTORY_VIEW)} replace />;
  }

  const isInsights = parseHistoryView(rawView) === "insights";
  const rows = resolved.rows
    .map(toHistoryRow)
    .filter((row): row is HistoryIncidentRow => row !== null)
    .sort((a, b) => b.resolvedAt.localeCompare(a.resolvedAt));
  const records = resolved.rows.map(toInsightsRecord).filter((record): record is InsightsRecord => record !== null);
  const settling = records.length < resolved.rows.length;

  return (
    <AppLayout sidebar={<AppSidebar />} hint={isInsights ? undefined : t("hint")}>
      <HistoryHeader />
      <HistoryTabs />
      {resolved.status !== "ready" ? (
        <QueueStatus status={resolved.status} error={resolved.error} onRetry={resolved.reload} />
      ) : (
        <>
          {settling && <p className={styles.status} role="status">{t("settling")}</p>}
          {isInsights ? (
            <HistoryInsights records={records} loaded={resolved.rows.length} nowMs={now} />
          ) : (
            <HistoryIncidentsTable rows={rows} />
          )}
          {resolved.hasMore && <LoadMore label={t("loadMore")} loading={resolved.loadingMore} onClick={resolved.loadMore} />}
        </>
      )}
    </AppLayout>
  );
}
