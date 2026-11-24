import { useTranslation } from "react-i18next";
import { Navigate, useSearchParams } from "react-router-dom";

import {
  NO_INCIDENT_FILTERS,
  UNRESOLVED_INCIDENT_STATUSES,
  fetchIncidentSummary,
  hasIncidentFilters,
  incidentLabel,
  returnFiltersState,
  type DiagnosisCriterion,
  type IncidentStatus,
} from "../../../entities/incident";
import { useApiQuery } from "../../../shared/api";
import {
  DEFAULT_OPERATIONS_QUEUE,
  OPERATIONS_QUEUE_PARAM,
  isOperationsQueue,
  operationsQueuePath,
} from "../../../shared/config";
import { useNow } from "../../../shared/lib";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Button } from "../../../shared/ui/button";
import { AppSidebar } from "../../../widgets/app-sidebar";
import {
  IncidentFilterBar,
  LoadMore,
  QueueStatus,
  useIncidentFilterParams,
  useIncidentQueue,
  type QueueRow,
} from "../../../widgets/incident-queue";
import { IncidentsTable, type ActiveIncidentRow } from "../../../widgets/incidents-table";
import { NeedsValidationTable, type PendingValidationRow } from "../../../widgets/needs-validation-table";
import { OperationsHeader } from "../../../widgets/operations-header";
import { OperationsSummary } from "../../../widgets/operations-summary";
import { OperationsTabs } from "../../../widgets/operations-tabs";

import styles from "./OperationsPage.module.css";

const SEVERITY_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const;

/** Unclassified incidents sort after every classified severity. */
function severityRank(severity: keyof typeof SEVERITY_ORDER | null): number {
  return severity === null ? 4 : SEVERITY_ORDER[severity];
}

function toActiveRow(row: QueueRow): ActiveIncidentRow {
  const { incident, pipeline, diagnosis } = row;
  return {
    id: incident.id,
    label: incidentLabel(incident),
    severity: incident.severity,
    stage: incident.stage,
    status: incident.status,
    detectedAt: incident.detectedAt,
    pipeline: pipeline.kind === "ready" ? { kind: "ready", value: { repository: pipeline.fullName, workflow: pipeline.workflow } } : pipeline,
    diagnosis: diagnosis.kind === "ready" ? { kind: "ready", value: diagnosis.probableCause } : diagnosis,
  };
}

function toPendingRow(row: QueueRow): PendingValidationRow | null {
  const { incident, pipeline, diagnosis } = row;
  if (diagnosis.kind !== "ready" || diagnosis.status !== "PENDING" || !incident.resolvedAt || pipeline.kind === "loading") return null;
  return {
    id: incident.id,
    label: incidentLabel(incident),
    severity: incident.severity,
    stage: incident.stage,
    resolvedAt: incident.resolvedAt,
    pipeline: pipeline.kind === "ready" ? { repository: pipeline.fullName, workflow: pipeline.workflow } : null,
    probableCause: diagnosis.probableCause,
    status: diagnosis.status,
  };
}

/**
 * Operations workspace (`/operations?queue=active|validation`).
 *
 * Active reads Pipeline's `OPEN` queue (every unresolved incident). Needs
 * Validation is Pipeline's `RESOLVED` queue joined with each incident's
 * diagnosis `PENDING` status from Recommendation (D03); it is built from the
 * resolved incidents loaded so far, which the view states. Both queues load on
 * entry so the tab counts are real. Lists keep the service order; loaded
 * pages are ordered for reading (severity, then age) without claiming a
 * global order.
 */
/** Facets per queue: Needs Validation holds resolved incidents only, so it has no status facet. */
const ACTIVE_STATUSES = UNRESOLVED_INCIDENT_STATUSES;
const NO_STATUSES: readonly IncidentStatus[] = [];
/** Needs Validation is the resolved queue whose diagnosis awaits review. */
const PENDING: readonly DiagnosisCriterion[] = ["PENDING"];

export function OperationsPage() {
  const { t } = useTranslation("operations");
  const [searchParams] = useSearchParams();
  const queue = searchParams.get(OPERATIONS_QUEUE_PARAM);
  const isValidation = queue === "validation";
  const [filters, setFilters] = useIncidentFilterParams(isValidation ? NO_STATUSES : ACTIVE_STATUSES);
  const filtering = hasIncidentFilters(filters);
  // Whole queues: tab counts and figures always describe the queue, not the filter.
  const open = useIncidentQueue("OPEN");
  const resolved = useIncidentQueue("RESOLVED", { diagnosis: PENDING });
  // The table reads its own filtered queue only while criteria are set.
  const openFiltered = useIncidentQueue("OPEN", { filters, enabled: filtering && !isValidation });
  const resolvedFiltered = useIncidentQueue("RESOLVED", { filters, diagnosis: PENDING, enabled: filtering && isValidation });
  // Exact counts over the whole queues when Pipeline provides them (otherwise the loaded-page figures below).
  const openCounts = useApiQuery("operations-summary-open", (signal) => fetchIncidentSummary("OPEN", {}, signal));
  const pendingCounts = useApiQuery("operations-summary-pending", (signal) => fetchIncidentSummary("RESOLVED", { diagnosis: PENDING }, signal));
  const now = useNow();

  if (!isOperationsQueue(queue)) {
    return <Navigate to={operationsQueuePath(DEFAULT_OPERATIONS_QUEUE)} replace />;
  }

  const activeTable = filtering ? openFiltered : open;
  const validationTable = filtering ? resolvedFiltered : resolved;
  const byUrgency = (a: ActiveIncidentRow, b: ActiveIncidentRow) =>
    severityRank(a.severity) - severityRank(b.severity) || a.detectedAt.localeCompare(b.detectedAt);
  const toPending = (rows: QueueRow[]) =>
    rows
      .map(toPendingRow)
      .filter((row): row is PendingValidationRow => row !== null)
      .sort((a, b) => a.resolvedAt.localeCompare(b.resolvedAt));
  const settling = (rows: QueueRow[]) => rows.some((row) => row.diagnosis.kind === "loading" || row.pipeline.kind === "loading");

  const activeRows = activeTable.rows.map(toActiveRow).sort(byUrgency);
  const pendingRows = toPending(resolved.rows);
  const pendingTableRows = filtering ? toPending(validationTable.rows) : pendingRows;
  const resolving = settling(resolved.rows);
  const tableResolving = filtering ? settling(validationTable.rows) : resolving;

  const openSummary = openCounts.state.status === "success" ? openCounts.state.data : null;
  const pendingSummary = pendingCounts.state.status === "success" ? pendingCounts.state.data : null;
  const countsLoading = (query: { state: { status: string } }) => query.state.status === "loading";

  const counts = {
    active: openSummary
      ? { value: openSummary.total, more: false }
      : open.status === "ready" && !countsLoading(openCounts) ? { value: open.rows.length, more: open.hasMore } : null,
    validation: pendingSummary
      ? { value: pendingSummary.total, more: false }
      : resolved.status === "ready" && !resolving && !countsLoading(pendingCounts) ? { value: pendingRows.length, more: resolved.hasMore } : null,
  };
  const filteredEmpty = filtering
    ? {
        title: t("filters.empty.title"),
        text: t("filters.empty.text"),
        action: <Button size="sm" onClick={() => setFilters(NO_INCIDENT_FILTERS)}>{t("filters.clear")}</Button>,
      }
    : undefined;
  const refresh = (whole: { reload: () => void }, table: { reload: () => void }, figures: { reload: () => void }) => () => {
    whole.reload();
    figures.reload();
    if (filtering) table.reload();
  };

  return (
    <AppLayout sidebar={<AppSidebar />} hint={isValidation ? t("validation.hint") : t("active.hint")}>
      <OperationsHeader subtitle={isValidation ? t("validation.subtitle") : t("active.subtitle")} />
      <OperationsTabs counts={counts} />

      {isValidation ? (
        <>
          <OperationsSummary
            variant="validation"
            pending={pendingSummary?.total ?? pendingRows.length}
            more={pendingSummary ? false : resolved.hasMore}
            oldestPendingMs={pendingRows.length ? Math.max(0, now - Date.parse(pendingRows[0].resolvedAt)) : null}
            loadedAt={resolved.loadedAt}
            onRefresh={refresh(resolved, resolvedFiltered, pendingCounts)}
            loading={resolved.status === "loading" || resolving || countsLoading(pendingCounts)}
            unavailable={resolved.status === "error"}
          />
          <IncidentFilterBar
            filters={filters}
            onChange={setFilters}
            scope={validationTable.scope}
            facets={{ repository: true, severity: true, stage: true }}
            result={
              // The service selected pending incidents itself: its total is the answer ("N matching incidents").
              validationTable.scope.kind === "service"
                ? undefined
                : !filtering || tableResolving
                ? null
                : validationTable.scope.kind === "browser"
                  ? t("filters.scope.validationBrowser", { pending: pendingTableRows.length, count: validationTable.scope.loaded })
                  : t("filters.scope.validationLoaded", { count: pendingTableRows.length })
            }
          />
          {validationTable.status !== "ready" ? (
            <QueueStatus status={validationTable.status} error={validationTable.error} onRetry={validationTable.reload} />
          ) : (
            <div className={styles.tableArea}>
              {tableResolving && <p className={styles.status} role="status">{t("diagnosis.loading")}</p>}
              <NeedsValidationTable rows={pendingTableRows} now={now} empty={filteredEmpty} linkState={returnFiltersState(filters)} />
              {!filtering && !resolved.filteredByService && resolved.rows.length > 0 && (
                <p className={styles.scope}>{t("validation.scope", { count: resolved.rows.length })}</p>
              )}
              {validationTable.hasMore && (
                <LoadMore label={t("validation.loadMore")} loading={validationTable.loadingMore} onClick={validationTable.loadMore} />
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <OperationsSummary
            variant="active"
            total={openSummary?.total ?? open.rows.length}
            more={openSummary ? false : open.hasMore}
            critical={openSummary?.bySeverity.Critical ?? open.rows.filter((row) => row.incident.severity === "Critical").length}
            high={openSummary?.bySeverity.High ?? open.rows.filter((row) => row.incident.severity === "High").length}
            analyzing={openSummary?.byDiagnosis.ABSENT ?? open.rows.filter((row) => row.diagnosis.kind === "absent").length}
            loadedAt={open.loadedAt}
            onRefresh={refresh(open, openFiltered, openCounts)}
            loading={open.status === "loading" || countsLoading(openCounts)}
            unavailable={open.status === "error"}
          />
          <IncidentFilterBar
            filters={filters}
            onChange={setFilters}
            scope={activeTable.scope}
            facets={{ repository: true, severity: true, stage: true, statuses: ACTIVE_STATUSES }}
          />
          {activeTable.status !== "ready" ? (
            <QueueStatus status={activeTable.status} error={activeTable.error} onRetry={activeTable.reload} />
          ) : (
            <div className={styles.tableArea}>
              <IncidentsTable rows={activeRows} now={now} empty={filteredEmpty} linkState={returnFiltersState(filters)} />
              {activeTable.hasMore && <LoadMore label={t("queue.loadMore")} loading={activeTable.loadingMore} onClick={activeTable.loadMore} />}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
