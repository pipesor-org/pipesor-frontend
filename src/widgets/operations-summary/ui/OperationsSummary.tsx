import { useTranslation } from "react-i18next";

import { useFormatters } from "../../../shared/i18n";
import { Button } from "../../../shared/ui/button";
import { Stat, StatGroup } from "../../../shared/ui/stat";

import styles from "./OperationsSummary.module.css";

interface Freshness {
  /** When the queue was read; `null` while loading. */
  loadedAt: number | null;
  onRefresh: () => void;
}

export type OperationsSummaryProps = Freshness &
  (
    | { variant: "active"; total: number; more: boolean; critical: number; high: number; analyzing: number }
    | { variant: "validation"; pending: number; more: boolean; oldestPendingMs: number | null }
  );

/**
 * Key figures under the queue tabs. Counts describe the incidents loaded so
 * far (`N+` when more pages exist); the page derives them from the queue.
 */
export function OperationsSummary(props: OperationsSummaryProps) {
  const { t } = useTranslation("operations");
  const { formatDuration, formatNumber, formatTimestamp } = useFormatters();
  const count = (value: number, more: boolean) =>
    more ? t("queue.moreAvailable", { value: formatNumber(value) }) : formatNumber(value);

  const freshness = (
    <>
      {props.loadedAt !== null && <span>{t("queue.updated", { time: formatTimestamp(new Date(props.loadedAt).toISOString()) })}</span>}
      <Button variant="link" className={styles.refresh} onClick={props.onRefresh}>
        {t("queue.refresh")}
      </Button>
    </>
  );

  if (props.variant === "validation") {
    return (
      <div className={styles.summary}>
        <StatGroup label={t("validation.summary.ariaLabel", { count: props.pending })} aside={freshness}>
          <Stat label={t("validation.summary.pending")} value={count(props.pending, props.more)} tone={props.pending > 0 ? "warning" : undefined} />
          <Stat
            label={t("validation.summary.oldestPending")}
            value={props.oldestPendingMs === null ? "—" : formatDuration(props.oldestPendingMs)}
            mono
          />
        </StatGroup>
      </div>
    );
  }

  return (
    <div className={styles.summary}>
      <StatGroup label={t("active.summary.ariaLabel", { count: props.total })} aside={freshness}>
        <Stat label={t("active.summary.active")} value={count(props.total, props.more)} />
        <Stat label={t("severity.critical")} value={formatNumber(props.critical)} tone="critical" />
        <Stat label={t("severity.high")} value={formatNumber(props.high)} tone="warning" />
        <Stat label={t("active.summary.analyzing")} value={formatNumber(props.analyzing)} tone="info" live={props.analyzing > 0} />
      </StatGroup>
    </div>
  );
}
