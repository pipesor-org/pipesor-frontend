import { useTranslation } from "react-i18next";

import { useFormatters } from "../../../shared/i18n";
import { Stat, StatGroup } from "../../../shared/ui/stat";

import type { InsightsSummary } from "../model/insights";
import styles from "./HistoryInsightsSummary.module.css";

/**
 * Key figures for History — Insights.
 *
 * Values come from the incident entity; this component only formats them. A
 * metric without samples renders an em dash plus a visually hidden "No data"
 * rather than zero, so missing measurements are never presented as results.
 */
export function HistoryInsightsSummary({ summary }: { summary: InsightsSummary }) {
  const { t } = useTranslation("history");
  const { formatNumber, formatPercent, formatPreciseDuration } = useFormatters();

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
    <div className={styles.summary}>
      <StatGroup>
        {metrics.map(({ key, label, value, mono }) => (
          <Stat
            key={key}
            label={label}
            mono={mono}
            value={value ?? (
              <>
                <span aria-hidden="true">—</span>
                <span className={styles.srOnly}>{t("insights.summary.noData")}</span>
              </>
            )}
          />
        ))}
      </StatGroup>
    </div>
  );
}
