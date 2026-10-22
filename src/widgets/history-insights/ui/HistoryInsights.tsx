import { HistoryInsightsDiagnosisTrend } from "./HistoryInsightsDiagnosisTrend";
import { HistoryInsightsRecurringContexts } from "./HistoryInsightsRecurringContexts";
import { HistoryInsightsStageOutcome } from "./HistoryInsightsStageOutcome";
import { HistoryInsightsSummary } from "./HistoryInsightsSummary";

/**
 * History — Insights analytical composition.
 *
 * A single widget owns the analytical surface because every section reads the
 * same resolved-incident population over the same fixed window. The KPI strip
 * sets the vertical rhythm (24px above each section); the diagnosis trend and
 * the stage/outcome distributions follow it, and the recurring groups close the
 * view above the page hint.
 */
export function HistoryInsights() {
  return (
    <>
      <HistoryInsightsSummary />
      <HistoryInsightsDiagnosisTrend />
      <HistoryInsightsStageOutcome />
      <HistoryInsightsRecurringContexts />
    </>
  );
}
