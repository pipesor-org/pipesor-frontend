import { z } from "zod";

import { apiRequest } from "../../../shared/api";

/**
 * Pipeline lifecycle commands (`POST /api/v1/incidents/{id}/...`). Each needs
 * OPERATE on the incident's pipeline and answers the updated incident; the
 * Workspace reloads its read model afterwards, so only success is checked.
 */
const ack = z.object({ id: z.guid() });

function command(incidentId: string, action: "remediation" | "verification" | "resolve", executionId?: string) {
  return apiRequest("pipeline", {
    method: "POST",
    path: `/api/v1/incidents/${encodeURIComponent(incidentId)}/${action}`,
    body: executionId ? { executionId } : undefined,
    schema: ack,
  });
}

/** OPEN → IN_REMEDIATION: records that a person started intervening (no automated fix). */
export const startRemediation = (incidentId: string) => command(incidentId, "remediation");

/** IN_REMEDIATION → VERIFICATION with a run that started after the intervention. */
export const startVerification = (incidentId: string, executionId: string) => command(incidentId, "verification", executionId);

/** VERIFICATION → RESOLVED with a linked, successful verification run. */
export const resolveIncident = (incidentId: string, executionId: string) => command(incidentId, "resolve", executionId);
