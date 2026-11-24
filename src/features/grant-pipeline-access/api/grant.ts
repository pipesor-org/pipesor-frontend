import { apiRequest } from "../../../shared/api";
import type { PipelineCapability } from "../../../entities/monitored-pipeline";

const grantPath = (pipelineId: string, principalRef: string, capability: PipelineCapability) =>
  `/api/v1/pipelines/${encodeURIComponent(pipelineId)}/grants/${encodeURIComponent(principalRef)}/${capability}`;

/** `PUT /api/v1/pipelines/{id}/grants/{tid:oid}/{capability}` (204). Requires CONFIGURE. */
export function grantCapability(pipelineId: string, principalRef: string, capability: PipelineCapability): Promise<void> {
  return apiRequest("pipeline", { method: "PUT", path: grantPath(pipelineId, principalRef, capability), schema: null });
}

/** `DELETE …/grants/{tid:oid}/{capability}` (204). Requires CONFIGURE; `409 LAST_CONFIGURE_GRANT` for the last one. */
export function revokeCapability(pipelineId: string, principalRef: string, capability: PipelineCapability): Promise<void> {
  return apiRequest("pipeline", { method: "DELETE", path: grantPath(pipelineId, principalRef, capability), schema: null });
}

/**
 * Applies a change of access one grant at a time: additions first, then
 * removals, so a person never passes through "no access". Stops at the
 * first failure (what was applied stays; the view reloads the grants).
 */
export async function applyAccessChanges(
  pipelineId: string,
  principalRef: string,
  changes: { add: readonly PipelineCapability[]; remove: readonly PipelineCapability[] },
): Promise<void> {
  for (const capability of changes.add) await grantCapability(pipelineId, principalRef, capability);
  for (const capability of changes.remove) await revokeCapability(pipelineId, principalRef, capability);
}
