import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useFormatters } from "../../../shared/i18n";

import { buildInsights, INSIGHTS_WINDOW_DAYS, type InsightsRecord } from "../model/insights";
import { HistoryInsightsDiagnosisTrend } from "./HistoryInsightsDiagnosisTrend";
import { HistoryInsightsRecurringContexts } from "./HistoryInsightsRecurringContexts";
import { HistoryInsightsStageOutcome } from "./HistoryInsightsStageOutcome";
import { HistoryInsightsSummary } from "./HistoryInsightsSummary";
import styles from "./HistoryInsights.module.css";

interface HistoryInsightsProps {
  /** Resolved incidents loaded so far whose diagnosis read has settled. */
  records: InsightsRecord[];
  /** Resolved incidents loaded, including those still being completed. */
  loaded: number;
  nowMs: number;
}

/**
 * History — Insights analytical composition, computed in the browser from the
 * loaded resolved incidents (no analytics API). The scope line states the
 * period and how many incidents the figures cover, so a partial load is never
 * presented as a complete history.
 */
export function HistoryInsights({ records, loaded, nowMs }: HistoryInsightsProps) {
  const { t } = useTranslation("history");
  const { formatNumber, formatShortDateRange } = useFormatters();
  const model = useMemo(() => buildInsights(records, nowMs), [records, nowMs]);

  return (
    <>
      <p className={styles.scope}>
        {t("insights.scope", {
          days: INSIGHTS_WINDOW_DAYS,
          range: formatShortDateRange(model.window.start, model.window.end),
          count: model.summary.resolvedIncidents,
          countFormatted: formatNumber(model.summary.resolvedIncidents),
          loaded: formatNumber(loaded),
        })}
      </p>
      <HistoryInsightsSummary summary={model.summary} />
      <HistoryInsightsDiagnosisTrend trend={model.trend} window={model.window} />
      <HistoryInsightsStageOutcome stages={model.stages} summary={model.summary} />
      <HistoryInsightsRecurringContexts groups={model.recurring} />
    </>
  );
}
