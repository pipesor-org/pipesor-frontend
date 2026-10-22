import { useTranslation } from "react-i18next";

import { AppLayout } from "../../../shared/ui/app-layout";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { HistoryIncidentsTable } from "../../../widgets/history-incidents-table";
import { IncidentFilters } from "../../../widgets/incident-filters";

import { HistoryHeader } from "./HistoryHeader";
import { HistoryTabs } from "./HistoryTabs";

/**
 * History workspace shell.
 *
 * Incidents is the only implemented History view and lives at `/history` with no
 * query-parameter contract; Insights is shown as unavailable until its screen
 * exists. The header and view switcher are page-local because they are purely
 * presentational sections.
 *
 * The filter controls are shared with Operations but hide the assignment scope
 * row and second sort row, because History orders by resolution and presents the
 * sort description next to its table heading. Filtering stays presentational.
 */
export function HistoryPage() {
  const { t } = useTranslation("history");

  const filterLabels = [
    t("filters.dateRange"),
    t("filters.repository"),
    t("filters.stage"),
    t("filters.validation"),
    t("filters.assignee"),
  ];

  return (
    <AppLayout sidebar={<AppSidebar />} hint={t("hint")}>
      <HistoryHeader />
      <HistoryTabs />
      <IncidentFilters
        searchPlaceholder={t("searchPlaceholder")}
        filterLabels={filterLabels}
        showScope={false}
      />
      <HistoryIncidentsTable />
    </AppLayout>
  );
}
