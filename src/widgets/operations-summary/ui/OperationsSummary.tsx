import { useTranslation } from "react-i18next";

import { useFormatters } from "../../../shared/i18n";
import { Button } from "../../../shared/ui/button";

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
 * Summary strip under the queue tabs. Counts describe the incidents loaded so
 * far (`N+` when more pages exist); the page derives them from the queue.
 */
export function OperationsSummary(props: OperationsSummaryProps) {
  const { t } = useTranslation("operations");
  const { formatDuration, formatNumber, formatTimestamp } = useFormatters();
  const count = (value: number, more: boolean) =>
    more ? t("queue.moreAvailable", { value: formatNumber(value) }) : formatNumber(value);

  const freshness = (
    <div className={styles.snapshot}>
      {props.loadedAt !== null && <span>{t("queue.updated", { time: formatTimestamp(new Date(props.loadedAt).toISOString()) })}</span>}
      <Button variant="link" className={styles.refresh} onClick={props.onRefresh}>
        {t("queue.refresh")}
      </Button>
    </div>
  );

  if (props.variant === "validation") {
    return (
      <section className={styles.summary} aria-label={t("validation.summary.ariaLabel", { count: props.pending })}>
        <div className={styles.cell}>
          <span className={styles.value}>{count(props.pending, props.more)}</span>
          <span className={styles.label}>{t("validation.summary.pending")}</span>
        </div>
        <div className={`${styles.cell} ${styles.cellDivided}`}>
          <span className={styles.valueMono}>{props.oldestPendingMs === null ? "—" : formatDuration(props.oldestPendingMs)}</span>
          <span className={styles.label}>{t("validation.summary.oldestPending")}</span>
        </div>
        {freshness}
      </section>
    );
  }

  return (
    <section className={styles.summary} aria-label={t("active.summary.ariaLabel", { count: props.total })}>
      <div className={styles.cell}>
        <span className={styles.value}>{count(props.total, props.more)}</span>
        <span className={styles.label}>{t("active.summary.active")}</span>
      </div>
      <div className={`${styles.cell} ${styles.cellDivided}`}>
        <span className={styles.severityGroup}>
          <span className={styles.value}>{formatNumber(props.critical)}</span>
          <span className={styles.label}>{t("severity.critical")}</span>
          <span className={styles.label}>·</span>
          <span className={styles.value}>{formatNumber(props.high)}</span>
          <span className={styles.label}>{t("severity.high")}</span>
        </span>
      </div>
      <div className={`${styles.cell} ${styles.cellDivided}`}>
        <span className={styles.value}>{formatNumber(props.analyzing)}</span>
        <span className={styles.label}>{t("active.summary.analyzing")}</span>
      </div>
      {freshness}
    </section>
  );
}
