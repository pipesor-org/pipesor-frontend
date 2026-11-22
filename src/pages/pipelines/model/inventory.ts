import {
  PIPELINE_CRITICALITIES,
  PIPELINE_MONITORING_STATUSES,
  pipelineWorkflowLabel,
  type PipelineRecord,
} from "../../../entities/monitored-pipeline";
import { routes } from "../../../shared/config";

export interface InventoryQuery {
  q: string;
  criticality: string;
  team: string;
  monitoring: string;
}

/** Recognized inventory criteria from the URL; unknown values are dropped. */
export function readInventoryQuery(params: URLSearchParams, teams: readonly string[]): InventoryQuery {
  return {
    q: params.get("q") ?? "",
    criticality: PIPELINE_CRITICALITIES.find((value) => value === params.get("criticality")) ?? "",
    team: teams.find((value) => value === params.get("team")) ?? "",
    monitoring: PIPELINE_MONITORING_STATUSES.find((value) => value === params.get("monitoring")) ?? "",
  };
}

/**
 * Client-side search and filters over the complete inventory the caller may
 * VIEW (Pipeline returns all of it; there are no server criteria).
 */
export function selectInventoryPipelines(query: InventoryQuery, all: readonly PipelineRecord[]): PipelineRecord[] {
  const search = query.q.trim().toLowerCase();
  return all.filter((pipeline) =>
    (!search || [pipelineWorkflowLabel(pipeline) ?? "", pipeline.workflowFile ?? "", pipeline.fullName]
      .some((value) => value.toLowerCase().includes(search))) &&
    (!query.criticality || pipeline.criticality === query.criticality) &&
    (!query.team || pipeline.responsibleTeamNameSnapshot === query.team) &&
    (!query.monitoring || pipeline.monitoringStatus === query.monitoring),
  );
}

// Only inventory criteria can return through router state, never an arbitrary URL.
export function pipelineInventoryReturnPath(state: unknown): string {
  if (!state || typeof state !== "object" || !("pipelineSearch" in state) || typeof state.pipelineSearch !== "string") {
    return routes.pipelines;
  }
  const search = new URLSearchParams(state.pipelineSearch);
  const query = readInventoryQuery(search, [search.get("team") ?? ""]);
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  return `${routes.pipelines}${params.size ? `?${params}` : ""}`;
}
