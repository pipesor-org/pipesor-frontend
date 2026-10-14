import { useTranslation } from "react-i18next";

import {
  INCIDENT_SNAPSHOT_AT,
  selectActiveIncidentSummary,
  selectNeedsValidationSummary,
} from "../../../entities/incident";
import { durationMs } from "../../../shared/lib";
import { useFormatters } from "../../../shared/i18n";

import styles from "./OperationsSummary.module.css";

type OperationsSummaryVariant = "active" | "validation";

interface OperationsSummaryProps {
  /** Selects the queue-specific metrics to display. */
  variant: OperationsSummaryVariant;
}

/**
 * Compact summary strip shown under the queue tabs. All counts come from the
 * canonical selectors; only their rendering is locale-aware.
 */
export function OperationsSummary({ variant }: OperationsSummaryProps) {
  const { t } = useTranslation("operations");
  const { formatDuration, formatNumber, formatTimestamp } = useFormatters();
  const snapshot = t("snapshot", {
    timestamp: formatTimestamp(INCIDENT_SNAPSHOT_AT),
  });

  if (variant === "validation") {
    const { pending, oldestPendingAt } = selectNeedsValidationSummary();
    const oldestPending = oldestPendingAt
      ? formatDuration(durationMs(oldestPendingAt, INCIDENT_SNAPSHOT_AT))
      : "—";

    return (
      <section
        className={styles.summary}
        aria-label={t("validation.summary.ariaLabel", { count: pending })}
      >
        <div className={styles.cell}>
          <span className={styles.value}>{formatNumber(pending)}</span>
          <span className={styles.label}>{t("validation.summary.pending")}</span>
        </div>

        <div className={`${styles.cell} ${styles.cellDivided}`}>
          <span className={styles.valueMono}>{oldestPending}</span>
          <span className={styles.label}>
            {t("validation.summary.oldestPending")}
          </span>
        </div>

        <div className={styles.snapshot}>{snapshot}</div>
      </section>
    );
  }

  const { total, critical, high, analyzing } = selectActiveIncidentSummary();

  return (
    <section
      className={styles.summary}
      aria-label={t("active.summary.ariaLabel", { count: total })}
    >
      <div className={styles.cell}>
        <span className={styles.value}>{formatNumber(total)}</span>
        <span className={styles.label}>{t("active.summary.active")}</span>
      </div>

      <div className={`${styles.cell} ${styles.cellDivided}`}>
        <span className={styles.severityGroup}>
          <span className={styles.value}>{formatNumber(critical)}</span>
          <span className={styles.label}>{t("severity.critical")}</span>
          <span className={styles.label}>·</span>
          <span className={styles.value}>{formatNumber(high)}</span>
          <span className={styles.label}>{t("severity.high")}</span>
        </span>
      </div>

      <div className={`${styles.cell} ${styles.cellDivided}`}>
        <span className={styles.value}>{formatNumber(analyzing)}</span>
        <span className={styles.label}>{t("active.summary.analyzing")}</span>
      </div>

      <div className={styles.snapshot}>{snapshot}</div>
    </section>
  );
}
