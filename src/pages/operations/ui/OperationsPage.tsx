import { useTranslation } from "react-i18next";
import { Navigate, useSearchParams } from "react-router-dom";

import {
  DEFAULT_OPERATIONS_QUEUE,
  OPERATIONS_QUEUE_PARAM,
  isOperationsQueue,
  operationsQueuePath,
} from "../../../shared/config";
import { AppLayout } from "../../../shared/ui/app-layout";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { IncidentFilters } from "../../../widgets/incident-filters";
import { IncidentsTable } from "../../../widgets/incidents-table";
import { NeedsValidationTable } from "../../../widgets/needs-validation-table";
import { OperationsHeader } from "../../../widgets/operations-header";
import { OperationsSummary } from "../../../widgets/operations-summary";
import { OperationsTabs } from "../../../widgets/operations-tabs";

/**
 * Operations workspace.
 *
 * Both queues are read projections of the same Incident domain, so they share
 * this single route and are selected by the `queue` query parameter. The shell
 * (sidebar + layout) is composed once, outside the queue switch, so switching
 * queues keeps the sidebar mounted and preserves focus on the active tab. Each
 * queue still renders its own summary and table composition.
 *
 * An unknown or missing `queue` value is canonicalised to the default queue so
 * the URL always names what is on screen.
 */
export function OperationsPage() {
  const { t } = useTranslation("operations");
  const [searchParams] = useSearchParams();
  const queue = searchParams.get(OPERATIONS_QUEUE_PARAM);

  if (!isOperationsQueue(queue)) {
    return <Navigate to={operationsQueuePath(DEFAULT_OPERATIONS_QUEUE)} replace />;
  }

  const isValidation = queue === "validation";

  const view = isValidation
    ? {
        hint: t("validation.hint"),
        subtitle: t("validation.subtitle"),
        searchPlaceholder: t("validation.searchPlaceholder"),
        filterLabels: [
          t("filters.severity"),
          t("filters.repository"),
          t("filters.stage"),
          t("filters.resolvedDate"),
          t("filters.assignee"),
        ],
        sortLabel: t("validation.sortLabel"),
      }
    : {
        hint: t("active.hint"),
        subtitle: t("active.subtitle"),
        searchPlaceholder: t("active.searchPlaceholder"),
        filterLabels: [
          t("filters.severity"),
          t("filters.repository"),
          t("filters.stage"),
          t("filters.status"),
          t("filters.assignee"),
        ],
        sortLabel: t("active.sortLabel"),
      };

  return (
    <AppLayout sidebar={<AppSidebar />} hint={view.hint}>
      <OperationsHeader subtitle={view.subtitle} />
      <OperationsTabs />
      <OperationsSummary variant={queue} />
      <IncidentFilters
        searchPlaceholder={view.searchPlaceholder}
        filterLabels={view.filterLabels}
        sortLabel={view.sortLabel}
      />
      {isValidation ? <NeedsValidationTable /> : <IncidentsTable />}
    </AppLayout>
  );
}
