import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { routes } from "../../../shared/config";

import styles from "./HistoryTabs.module.css";

/**
 * History view switcher.
 *
 * `/history` deliberately has no query-parameter contract: the Incidents view is
 * the canonical URL. Insights has a design but no screen yet, so it is rendered
 * as plain text rather than a misleading disabled link, matching how the sidebar
 * treats destinations that are not implemented. Its unavailability is announced
 * to assistive technology through a visually hidden note.
 */
export function HistoryTabs() {
  const { t } = useTranslation("history");

  return (
    <nav className={styles.tabs} aria-label={t("tabs.ariaLabel")}>
      <Link
        to={routes.history}
        className={`${styles.tab} ${styles.tabActive}`}
        aria-current="page"
      >
        <span className={styles.tabLabel}>{t("tabs.incidents")}</span>
      </Link>
      <span
        className={`${styles.tab} ${styles.tabDisabled}`}
        aria-disabled="true"
      >
        <span className={styles.tabLabel}>{t("tabs.insights")}</span>
        <span className={styles.srOnly}>{t("tabs.insightsUnavailable")}</span>
      </span>
    </nav>
  );
}
