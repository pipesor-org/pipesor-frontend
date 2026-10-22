import { useTranslation } from "react-i18next";

import { selectInsightsSummary } from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";

import styles from "./HistoryInsightsSummary.module.css";

/**
 * KPI strip for History — Insights.
 *
 * Values come from the incident entity; this component only formats them. A
 * metric without samples renders an em dash plus a visually hidden "No data"
 * rather than zero, so missing measurements are never presented as results. The
 * strip is a description list so each value keeps its label in the accessibility
 * tree.
 */
export function HistoryInsightsSummary() {
  const { t } = useTranslation("history");
  const { formatNumber, formatPercent, formatPreciseDuration } = useFormatters();
  const summary = selectInsightsSummary();

  const metrics = [
    {
      key: "meanDiagnosis",
      label: t("insights.summary.meanDiagnosis"),
      value:
        summary.meanDiagnosis.meanMs === null
          ? null
          : formatPreciseDuration(summary.meanDiagnosis.meanMs),
      mono: true,
    },
    {
      key: "meanResolution",
      label: t("insights.summary.meanResolution"),
      value:
        summary.meanResolution.meanMs === null
          ? null
          : formatPreciseDuration(summary.meanResolution.meanMs),
      mono: true,
    },
    {
      key: "confirmationRate",
      label: t("insights.summary.confirmationRate"),
      value:
        summary.confirmationRate === null
          ? null
          : formatPercent(summary.confirmationRate),
      mono: false,
    },
    {
      key: "resolvedIncidents",
      label: t("insights.summary.resolvedIncidents"),
      value: formatNumber(summary.resolvedIncidents),
      mono: false,
    },
  ];

  return (
    <dl className={styles.strip}>
      {metrics.map(({ key, label, value, mono }) => (
        <div key={key} className={styles.cell}>
          <dt className={styles.label}>{label}</dt>
          <dd className={`${styles.value}${mono ? ` ${styles.mono}` : ""}`}>
            {value ?? (
              <>
                <span aria-hidden="true">—</span>
                <span className={styles.srOnly}>
                  {t("insights.summary.noData")}
                </span>
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
