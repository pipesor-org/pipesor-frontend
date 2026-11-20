import {
  monitoredPipelines,
  PIPELINE_CRITICALITIES,
  PIPELINE_MONITORING_STATUSES,
  type MonitoredPipeline,
  type PersistedPipeline,
} from "../../../entities/monitored-pipeline";
import { routes } from "../../../shared/config";

export const responsibleTeams = [...new Set(monitoredPipelines.map(({ ownership }) => ownership.responsibleTeam))];

export function isPendingSearchEcho(navigationType: string, search: string, pendingValues: ReadonlySet<string>) {
  return navigationType === "REPLACE" && pendingValues.has(search);
}

export function readInventoryQuery(params: URLSearchParams, teams: readonly string[] = responsibleTeams) {
  return {
    q: params.get("q") ?? "",
    criticality: PIPELINE_CRITICALITIES.find((value) => value === params.get("criticality")) ?? "",
    team: teams.find((value) => value === params.get("team")) ?? "",
    monitoring: PIPELINE_MONITORING_STATUSES.find((value) => value === params.get("monitoring")) ?? "",
  };
}

export function selectInventoryPipelines(
  query: ReturnType<typeof readInventoryQuery>,
  all: readonly (MonitoredPipeline | PersistedPipeline)[] = monitoredPipelines,
) {
  const search = query.q.trim().toLowerCase();
  return all.filter((pipeline) =>
    (!search || [pipeline.slug, pipeline.github.workflowName, pipeline.github.repository]
      .some((value) => value.toLowerCase().includes(search))) &&
    (!query.criticality || pipeline.policy.criticality === query.criticality) &&
    (!query.team || pipeline.ownership.responsibleTeam === query.team) &&
    (!query.monitoring || pipeline.policy.monitoringStatus === query.monitoring),
  );
}

// Only inventory criteria can return through router state, never an arbitrary URL.
export function pipelineInventoryReturnPath(state: unknown): string {
  if (!state || typeof state !== "object" || !("pipelineSearch" in state) ||
    typeof state.pipelineSearch !== "string") return routes.pipelines;
  const search = new URLSearchParams(state.pipelineSearch);
  const query = readInventoryQuery(search, [search.get("team") ?? ""]);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  return `${routes.pipelines}${params.size ? `?${params}` : ""}`;
}
