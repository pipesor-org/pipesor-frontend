import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import {
  selectActiveIncidents,
  selectNeedsValidationIncidents,
} from "../../../entities/incident";
import {
  OPERATIONS_QUEUE_PARAM,
  operationsQueuePath,
  parseOperationsQueue,
} from "../../../shared/config";
import { useFormatters } from "../../../shared/i18n";
import { Badge } from "../../../shared/ui/badge";

import styles from "./OperationsTabs.module.css";

/**
 * Queue switcher for the Operations workspace.
 *
 * Both queues live on one route, so each tab is a link to the canonical
 * `?queue=` URL and the active tab is derived from the URL rather than local
 * state. `NavLink` cannot distinguish two links that share a pathname, so the
 * active state is computed from the query value and exposed with `aria-current`.
 * Counts are canonical queue lengths.
 */
export function OperationsTabs() {
  const { t } = useTranslation("operations");
  const { formatNumber } = useFormatters();
  const [searchParams] = useSearchParams();
  const activeQueue = parseOperationsQueue(
    searchParams.get(OPERATIONS_QUEUE_PARAM),
  );

  const tabs = [
    {
      queue: "active",
      label: t("tabs.activeIncidents"),
      to: operationsQueuePath("active"),
      count: selectActiveIncidents().length,
    },
    {
      queue: "validation",
      label: t("tabs.needsValidation"),
      to: operationsQueuePath("validation"),
      count: selectNeedsValidationIncidents().length,
    },
  ] as const;

  return (
    <nav className={styles.tabs} aria-label={t("tabs.ariaLabel")}>
      {tabs.map(({ queue, label, to, count }) => {
        const isActive = queue === activeQueue;

        return (
          <Link
            key={queue}
            to={to}
            className={`${styles.tab}${isActive ? ` ${styles.tabActive}` : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={styles.tabLabel}>{label}</span>
            <Badge tone={isActive ? "accent" : "neutral"}>
              {formatNumber(count)}
            </Badge>
          </Link>
        );
      })}
    </nav>
  );
}
