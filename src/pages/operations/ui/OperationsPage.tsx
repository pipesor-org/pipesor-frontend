import { useTranslation } from "react-i18next";
import { Navigate, useSearchParams } from "react-router-dom";

import { incidentLabel } from "../../../entities/incident";
import {
  DEFAULT_OPERATIONS_QUEUE,
  OPERATIONS_QUEUE_PARAM,
  isOperationsQueue,
  operationsQueuePath,
} from "../../../shared/config";
import { useNow } from "../../../shared/lib";
import { AppLayout } from "../../../shared/ui/app-layout";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { LoadMore, QueueStatus, useIncidentQueue, type QueueRow } from "../../../widgets/incident-queue";
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
export function OperationsPage() {
  const { t } = useTranslation("operations");
  const [searchParams] = useSearchParams();
  const queue = searchParams.get(OPERATIONS_QUEUE_PARAM);
  const open = useIncidentQueue("OPEN");
  const resolved = useIncidentQueue("RESOLVED");
  const now = useNow();

  if (!isOperationsQueue(queue)) {
    return <Navigate to={operationsQueuePath(DEFAULT_OPERATIONS_QUEUE)} replace />;
  }

  const isValidation = queue === "validation";
  const activeRows = open.rows
    .map(toActiveRow)
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.detectedAt.localeCompare(b.detectedAt));
  const pendingRows = resolved.rows
    .map(toPendingRow)
    .filter((row): row is PendingValidationRow => row !== null)
    .sort((a, b) => a.resolvedAt.localeCompare(b.resolvedAt));
  const resolving = resolved.rows.some((row) => row.diagnosis.kind === "loading" || row.pipeline.kind === "loading");

  const counts = {
    active: open.status === "ready" ? { value: open.rows.length, more: open.hasMore } : null,
    validation: resolved.status === "ready" && !resolving ? { value: pendingRows.length, more: resolved.hasMore } : null,
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
            onRefresh={resolved.reload}
          />
          {resolved.status !== "ready" ? (
            <QueueStatus status={resolved.status} error={resolved.error} onRetry={resolved.reload} />
          ) : (
            <div className={styles.tableArea}>
              {resolving && <p className={styles.status} role="status">{t("diagnosis.loading")}</p>}
              <NeedsValidationTable rows={pendingRows} now={now} />
              {resolved.rows.length > 0 && <p className={styles.scope}>{t("validation.scope", { count: resolved.rows.length })}</p>}
              {resolved.hasMore && <LoadMore label={t("validation.loadMore")} loading={resolved.loadingMore} onClick={resolved.loadMore} />}
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
            onRefresh={open.reload}
          />
          {open.status !== "ready" ? (
            <QueueStatus status={open.status} error={open.error} onRetry={open.reload} />
          ) : (
            <div className={styles.tableArea}>
              <IncidentsTable rows={activeRows} now={now} />
              {open.hasMore && <LoadMore label={t("queue.loadMore")} loading={open.loadingMore} onClick={open.loadMore} />}
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
}
