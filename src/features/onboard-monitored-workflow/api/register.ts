import { apiRequest } from "../../../shared/api";
import {
  pipelineViewSchema,
  type PipelineCriticality,
  type PipelineMonitoringStatus,
  type PipelineRecord,
} from "../../../entities/monitored-pipeline";

export interface Registration {
  githubRepositoryId: string;
  githubWorkflowId: string;
  criticality: PipelineCriticality;
  monitoringStatus: PipelineMonitoringStatus;
  environment?: string;
  responsibleTeamNameSnapshot?: string;
}

/**
 * `POST /api/v1/pipelines` (201). Pipeline re-verifies the GitHub facts through
 * Ingestion with the caller's token; nothing about the workflow is trusted from
 * the browser beyond its ids. A duplicate answers 409.
 */
export function registerPipeline(registration: Registration): Promise<PipelineRecord> {
  return apiRequest("pipeline", { method: "POST", path: "/api/v1/pipelines", body: registration, schema: pipelineViewSchema });
}
