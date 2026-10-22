import { useTranslation } from "react-i18next";
import { Navigate, useSearchParams } from "react-router-dom";

import {
  DEFAULT_HISTORY_VIEW,
  HISTORY_VIEW_PARAM,
  historyViewPath,
  isHistoryView,
  parseHistoryView,
} from "../../../shared/config";
import { AppLayout } from "../../../shared/ui/app-layout";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { HistoryIncidentsTable } from "../../../widgets/history-incidents-table";
import { HistoryInsights } from "../../../widgets/history-insights";
import { IncidentFilters } from "../../../widgets/incident-filters";

import { HistoryHeader } from "./HistoryHeader";
import { HistoryInsightsFilters } from "./HistoryInsightsFilters";
import { HistoryTabs } from "./HistoryTabs";

/**
 * History workspace shell.
 *
 * Incidents and Insights are two presentations of the same resolved-incident
 * domain, selected by the `view` query parameter. The header and switcher are
 * page-local because they are purely presentational sections; they stay mounted
 * across views, so switching only replaces the content below them.
 *
 * An unknown `view` value is canonicalised to the default view so the URL always
 * names what is on screen; a bare `/history` still renders Incidents for links
 * created before the parameter existed.
 *
 * Incident filtering stays presentational: the controls are shared with
 * Operations but hide the assignment scope row. Insights has no search, scope or
 * sort row because its period is fixed by the demo snapshot and it is not a
 * record list.
 */
export function HistoryPage() {
  const { t } = useTranslation("history");
  const [searchParams] = useSearchParams();
  const rawView = searchParams.get(HISTORY_VIEW_PARAM);

  if (rawView !== null && !isHistoryView(rawView)) {
    return <Navigate to={historyViewPath(DEFAULT_HISTORY_VIEW)} replace />;
  }

  const isInsights = parseHistoryView(rawView) === "insights";

  const filterLabels = [
    t("filters.dateRange"),
    t("filters.repository"),
    t("filters.stage"),
    t("filters.validation"),
    t("filters.assignee"),
  ];

  return (
    <AppLayout
      sidebar={<AppSidebar />}
      hint={isInsights ? undefined : t("hint")}
    >
      <HistoryHeader />
      <HistoryTabs />
      {isInsights ? (
        <>
          <HistoryInsightsFilters />
          <HistoryInsights />
        </>
      ) : (
        <>
          <IncidentFilters
            searchPlaceholder={t("searchPlaceholder")}
            filterLabels={filterLabels}
            showScope={false}
          />
          <HistoryIncidentsTable />
        </>
      )}
    </AppLayout>
  );
}
