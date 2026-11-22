import { apiRequest } from "../../../shared/api";
import type { PipelineCapability } from "../../../entities/monitored-pipeline";

/** `PUT /api/v1/pipelines/{id}/grants/{tid:oid}/{capability}` (204). Requires CONFIGURE. */
export function grantCapability(pipelineId: string, principalRef: string, capability: PipelineCapability): Promise<void> {
  return apiRequest("pipeline", {
    method: "PUT",
    path: `/api/v1/pipelines/${encodeURIComponent(pipelineId)}/grants/${encodeURIComponent(principalRef)}/${capability}`,
    schema: null,
  });
}
