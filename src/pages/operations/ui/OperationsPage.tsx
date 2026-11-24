import { useTranslation } from "react-i18next";
import { Navigate, useSearchParams } from "react-router-dom";

import {
  NO_INCIDENT_FILTERS,
  UNRESOLVED_INCIDENT_STATUSES,
  hasIncidentFilters,
  incidentLabel,
  returnFiltersState,
  type IncidentStatus,
} from "../../../entities/incident";
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

export function OperationsPage() {
  const { t } = useTranslation("operations");
  const [searchParams] = useSearchParams();
  const queue = searchParams.get(OPERATIONS_QUEUE_PARAM);
  const isValidation = queue === "validation";
  const [filters, setFilters] = useIncidentFilterParams(isValidation ? NO_STATUSES : ACTIVE_STATUSES);
  const filtering = hasIncidentFilters(filters);
  // Whole queues: tab counts and figures always describe the queue, not the filter.
  const open = useIncidentQueue("OPEN");
  const resolved = useIncidentQueue("RESOLVED");
  // The table reads its own filtered queue only while criteria are set.
  const openFiltered = useIncidentQueue("OPEN", { filters, enabled: filtering && !isValidation });
  const resolvedFiltered = useIncidentQueue("RESOLVED", { filters, enabled: filtering && isValidation });
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

  const counts = {
    active: open.status === "ready" ? { value: open.rows.length, more: open.hasMore } : null,
    validation: resolved.status === "ready" && !resolving ? { value: pendingRows.length, more: resolved.hasMore } : null,
  };
  const filteredEmpty = filtering
    ? {
        title: t("filters.empty.title"),
        text: t("filters.empty.text"),
        action: <Button size="sm" onClick={() => setFilters(NO_INCIDENT_FILTERS)}>{t("filters.clear")}</Button>,
      }
    : undefined;
  const refresh = (whole: { reload: () => void }, table: { reload: () => void }) => () => {
    whole.reload();
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
            pending={pendingRows.length}
            more={resolved.hasMore}
            oldestPendingMs={pendingRows.length ? Math.max(0, now - Date.parse(pendingRows[0].resolvedAt)) : null}
            loadedAt={resolved.loadedAt}
            onRefresh={refresh(resolved, resolvedFiltered)}
            loading={resolved.status === "loading" || resolving}
            unavailable={resolved.status === "error"}
          />
          <IncidentFilterBar
            filters={filters}
            onChange={setFilters}
            scope={validationTable.scope}
            facets={{ repository: true, severity: true, stage: true }}
            result={
              !filtering || tableResolving
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
              {!filtering && resolved.rows.length > 0 && <p className={styles.scope}>{t("validation.scope", { count: resolved.rows.length })}</p>}
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
            total={open.rows.length}
            more={open.hasMore}
            critical={open.rows.filter((row) => row.incident.severity === "Critical").length}
            high={open.rows.filter((row) => row.incident.severity === "High").length}
            analyzing={open.rows.filter((row) => row.diagnosis.kind === "absent").length}
            loadedAt={open.loadedAt}
            onRefresh={refresh(open, openFiltered)}
            loading={open.status === "loading"}
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
