import { HistoryInsightsSummary } from "./HistoryInsightsSummary";

/**
 * History — Insights analytical composition.
 *
 * A single widget owns the analytical surface because every section reads the
 * same resolved-incident population over the same fixed window. Later phases
 * add the diagnosis trend, outcome and stage distributions and the recurring
 * contexts inside this composition; the summary strip defined its vertical
 * rhythm (24px above the first section).
 */
export function HistoryInsights() {
  return <HistoryInsightsSummary />;
}
