import { HistoryInsightsDiagnosisTrend } from "./HistoryInsightsDiagnosisTrend";
import { HistoryInsightsSummary } from "./HistoryInsightsSummary";

/**
 * History — Insights analytical composition.
 *
 * A single widget owns the analytical surface because every section reads the
 * same resolved-incident population over the same fixed window. The KPI strip
 * sets the vertical rhythm (24px above each section); the diagnosis trend follows
 * it. Later phases add the outcome and stage distributions and the recurring
 * contexts here.
 */
export function HistoryInsights() {
  return (
    <>
      <HistoryInsightsSummary />
      <HistoryInsightsDiagnosisTrend />
    </>
  );
}
