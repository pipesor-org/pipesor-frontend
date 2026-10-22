import { AppLayout } from "../../../shared/ui/app-layout";
import { AppSidebar } from "../../../widgets/app-sidebar";

import { HistoryHeader } from "./HistoryHeader";
import { HistoryTabs } from "./HistoryTabs";

/**
 * History workspace shell.
 *
 * Incidents is the only implemented History view and lives at `/history` with no
 * query-parameter contract; Insights is shown as unavailable until its screen
 * exists. The header and view switcher are page-local because they are purely
 * presentational sections.
 */
export function HistoryPage() {
  return (
    <AppLayout sidebar={<AppSidebar />}>
      <HistoryHeader />
      <HistoryTabs />
    </AppLayout>
  );
}
