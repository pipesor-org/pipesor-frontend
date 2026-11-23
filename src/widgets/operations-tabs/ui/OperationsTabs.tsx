import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import {
  OPERATIONS_QUEUE_PARAM,
  operationsQueuePath,
  parseOperationsQueue,
} from "../../../shared/config";
import { useFormatters } from "../../../shared/i18n";
import { Badge } from "../../../shared/ui/badge";
import { TabNav, tabClassName } from "../../../shared/ui/tab-nav";

/**
 * Queue switcher for the Operations workspace.
 *
 * Both queues live on one route, so each tab is a link to the canonical
 * `?queue=` URL and the active tab is derived from the URL rather than local
 * state. `NavLink` cannot distinguish two links that share a pathname, so the
 * active state is computed from the query value and exposed with `aria-current`.
 * Counts describe the incidents loaded so far; `null` hides a count that is
 * not known yet, and `more` renders `N+` when further pages exist.
 */
export interface QueueCount {
  value: number;
  more: boolean;
}

export function OperationsTabs({ counts }: { counts: Record<"active" | "validation", QueueCount | null> }) {
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
      count: counts.active,
    },
    {
      queue: "validation",
      label: t("tabs.needsValidation"),
      to: operationsQueuePath("validation"),
      count: counts.validation,
    },
  ] as const;

  return (
    <TabNav label={t("tabs.ariaLabel")}>
      {tabs.map(({ queue, label, to, count }) => {
        const isActive = queue === activeQueue;

        return (
          <Link
            key={queue}
            to={to}
            className={tabClassName(isActive)}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
            {count && (
              <Badge tone={isActive ? "accent" : "neutral"}>
                {count.more ? t("queue.moreAvailable", { value: formatNumber(count.value) }) : formatNumber(count.value)}
              </Badge>
            )}
          </Link>
        );
      })}
    </TabNav>
  );
}
