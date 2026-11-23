import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import {
  HISTORY_VIEW_PARAM,
  historyViewPath,
  parseHistoryView,
} from "../../../shared/config";
import { TabNav, tabClassName } from "../../../shared/ui/tab-nav";

/**
 * History view switcher.
 *
 * Both views live on one route, so each tab is a link to its canonical
 * `?view=` URL and the active tab is derived from the URL rather than local
 * state. `NavLink` cannot distinguish two links that share a pathname, so the
 * active state is computed from the query value and exposed with
 * `aria-current`.
 */
export function HistoryTabs() {
  const { t } = useTranslation("history");
  const [searchParams] = useSearchParams();
  const activeView = parseHistoryView(searchParams.get(HISTORY_VIEW_PARAM));

  const tabs = [
    { view: "incidents", label: t("tabs.incidents") },
    { view: "insights", label: t("tabs.insights") },
  ] as const;

  return (
    <TabNav label={t("tabs.ariaLabel")}>
      {tabs.map(({ view, label }) => {
        const isActive = view === activeView;

        return (
          <Link
            key={view}
            to={historyViewPath(view)}
            className={tabClassName(isActive)}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </TabNav>
  );
}
