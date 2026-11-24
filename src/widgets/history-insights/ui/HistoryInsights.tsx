import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { IncidentInsights } from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";

import { buildInsights, INSIGHTS_WINDOW_DAYS, type InsightsRecord } from "../model/insights";
import { HistoryInsightsDiagnosisTrend } from "./HistoryInsightsDiagnosisTrend";
import { HistoryInsightsRecurringContexts } from "./HistoryInsightsRecurringContexts";
import { HistoryInsightsStageOutcome } from "./HistoryInsightsStageOutcome";
import { HistoryInsightsSummary } from "./HistoryInsightsSummary";
import styles from "./HistoryInsights.module.css";

type HistoryInsightsProps =
  /** Computed by Pipeline over every resolved incident the caller may view. */
  | { source: "service"; insights: IncidentInsights }
  | {
      source: "browser";
      /** Resolved incidents loaded so far whose diagnosis read has settled. */
      records: InsightsRecord[];
      /** Resolved incidents loaded, including those still being completed. */
      loaded: number;
      nowMs: number;
    };

/**
 * History — Insights analytical composition. Figures come from Pipeline when
 * it provides them; otherwise they are computed here over the loaded resolved
 * incidents. The scope line states the period, how many incidents the figures
 * cover and, in the browser, of how many loaded, so a partial load is never
 * presented as a complete history.
 */
export function HistoryInsights(props: HistoryInsightsProps) {
  const { t } = useTranslation("history");
  const { formatNumber, formatShortDateRange } = useFormatters();
  const browser = props.source === "browser" ? props : null;
  const records = browser?.records ?? null;
  const nowMs = browser?.nowMs ?? 0;
  const computed = useMemo(() => (records ? buildInsights(records, nowMs) : null), [records, nowMs]);
  const model = props.source === "service" ? props.insights : computed;
  if (!model) return null;

  const scope = {
    days: INSIGHTS_WINDOW_DAYS,
    range: formatShortDateRange(model.window.start, model.window.end),
    count: model.summary.resolvedIncidents,
    countFormatted: formatNumber(model.summary.resolvedIncidents),
  };

  return (
    <>
      <p className={styles.scope}>
        {browser ? t("insights.scope", { ...scope, loaded: formatNumber(browser.loaded) }) : t("insights.scopeService", scope)}
      </p>
      <HistoryInsightsSummary summary={model.summary} />
      <HistoryInsightsDiagnosisTrend trend={model.trend} window={model.window} />
      <HistoryInsightsStageOutcome stages={model.stages} summary={model.summary} />
      <HistoryInsightsRecurringContexts groups={model.recurring} truncated={model.recurringTruncated} />
    </>
  );
}
