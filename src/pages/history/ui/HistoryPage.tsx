import { useTranslation } from "react-i18next";
import { Navigate, useSearchParams } from "react-router-dom";

import {
  FILTER_SCOPES,
  NO_INCIDENT_FILTERS,
  fetchIncidentInsights,
  hasIncidentFilters,
  incidentLabel,
  returnFiltersState,
} from "../../../entities/incident";
import {
  DEFAULT_HISTORY_VIEW,
  HISTORY_VIEW_PARAM,
  historyViewPath,
  isHistoryView,
  parseHistoryView,
} from "../../../shared/config";
import { useNow } from "../../../shared/lib";
import { useApiQuery } from "../../../shared/api";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Button } from "../../../shared/ui/button";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { HistoryIncidentsTable, type HistoryIncidentRow } from "../../../widgets/history-incidents-table";
import { HistoryInsights, type InsightsRecord } from "../../../widgets/history-insights";
import {
  IncidentFilterBar,
  LoadMore,
  QueueStatus,
  useIncidentFilterParams,
  useIncidentQueue,
  type QueueRow,
} from "../../../widgets/incident-queue";

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
 * Insights reads Pipeline's figures over every resolved incident
 * (`GET /api/v1/insights`); against a Pipeline without them it aggregates the
 * loaded `RESOLVED` queue in the browser, as before. Incidents lists that queue
 * (rows carry their pipeline and diagnosis, or are completed per row) newest
 * resolution first (Pipeline orders by `resolvedAt`; loaded pages are also
 * sorted here for a Pipeline without that order) and offers the incident filter bar (repository, severity,
 * stage, validation); while criteria are set, the table reads its own
 * filtered queue, applied by Pipeline before paging when it supports it.
 */
export function HistoryPage() {
  const { t } = useTranslation("history");
  const { t: tOperations } = useTranslation("operations");
  const [searchParams] = useSearchParams();
  const rawView = searchParams.get(HISTORY_VIEW_PARAM);
  const isInsights = parseHistoryView(rawView) === "insights";
  // Resolved incidents only: no Status facet; Validation offers every review state, plus the Resolved period.
  const [filters, setFilters] = useIncidentFilterParams(FILTER_SCOPES.history);
  const filtering = !isInsights && hasIncidentFilters(filters);
  // Insights and the unfiltered list share the whole queue; the filtered list reads its own.
  const resolved = useIncidentQueue("RESOLVED", { sort: "resolvedAt", enabled: !filtering });
  const resolvedFiltered = useIncidentQueue("RESOLVED", { filters, sort: "resolvedAt", enabled: filtering });
  // Insights from Pipeline over every resolved incident; `null` means compute them here over the loaded ones.
  const serviceInsights = useApiQuery(isInsights ? "history-insights" : null, (signal) => fetchIncidentInsights(signal));
  const now = useNow();

  if (rawView !== null && !isHistoryView(rawView)) {
    return <Navigate to={historyViewPath(DEFAULT_HISTORY_VIEW)} replace />;
  }

  const source = filtering ? resolvedFiltered : resolved;
  const rows = source.rows
    .map(toHistoryRow)
    .filter((row): row is HistoryIncidentRow => row !== null)
    .sort((a, b) => b.resolvedAt.localeCompare(a.resolvedAt));
  const records = resolved.rows.map(toInsightsRecord).filter((record): record is InsightsRecord => record !== null);
  const settling = source.rows.some((row) => row.diagnosis.kind === "loading" || row.pipeline.kind === "loading");
  const insights = serviceInsights.state.status === "success" ? serviceInsights.state.data : null;
  const filteredEmpty = filtering
    ? {
        title: tOperations("filters.empty.title"),
        text: tOperations("filters.empty.text"),
        action: <Button size="sm" onClick={() => setFilters(NO_INCIDENT_FILTERS)}>{tOperations("filters.clear")}</Button>,
      }
    : undefined;

  return (
    <AppLayout sidebar={<AppSidebar />} hint={isInsights ? undefined : t("hint")}>
      <HistoryHeader />
      <HistoryTabs />
      {!isInsights && (
        <IncidentFilterBar
          filters={filters}
          onChange={setFilters}
          scope={source.scope}
          facets={{ repository: true, severity: true, stage: true, diagnoses: FILTER_SCOPES.history.diagnoses, resolved: true }}
        />
      )}
      {isInsights && serviceInsights.state.status === "loading" ? (
        <QueueStatus status="loading" error={null} onRetry={serviceInsights.reload} />
      ) : isInsights && insights ? (
        <HistoryInsights source="service" insights={insights} />
      ) : source.status !== "ready" ? (
        <QueueStatus status={source.status} error={source.error} onRetry={source.reload} />
      ) : (
        <>
          {settling && <p className={styles.status} role="status">{t("settling")}</p>}
          {isInsights ? (
            <HistoryInsights source="browser" records={records} loaded={resolved.rows.length} nowMs={now} />
          ) : (
            <HistoryIncidentsTable rows={rows} empty={filteredEmpty} linkState={returnFiltersState(filters)} />
          )}
          {source.hasMore && <LoadMore label={t("loadMore")} loading={source.loadingMore} onClick={source.loadMore} />}
        </>
      )}
    </AppLayout>
  );
}
