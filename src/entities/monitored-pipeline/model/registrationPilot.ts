import { useEffect, useState } from "react";
import { z } from "zod";

import { pipelineIdSchema } from "./schema";

const criticality = { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" } as const;
const monitoring = { ACTIVE: "Active", PAUSED: "Paused" } as const;
export const pilotEnvironments = { Production: "prod", QA: "qa", Development: "dev" } as const;
export const pilotTeams = [["team-platform", "Platform Engineering"]] as const;

const pipeline = z.object({
  id: pipelineIdSchema,
  fullName: z.string().min(1),
  defaultBranch: z.string().nullable(),
  workflowName: z.string().min(1),
  workflowFile: z.string().min(1),
  criticality: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  monitoringStatus: z.enum(["ACTIVE", "PAUSED"]),
  environment: z.string().nullable(),
  responsibleTeamNameSnapshot: z.string().nullable(),
  effectiveCapabilities: z.array(z.enum(["VIEW", "OPERATE", "CONFIGURE"])),
}).transform((value) => ({
  id: value.id,
  slug: value.workflowFile.split("/").at(-1)?.replace(/\.ya?ml$/, "") || value.workflowName,
  github: {
    repository: value.fullName,
    workflowName: value.workflowName,
    workflowPath: value.workflowFile,
    defaultBranch: value.defaultBranch ?? "",
  },
  policy: { criticality: criticality[value.criticality], monitoringStatus: monitoring[value.monitoringStatus] },
  ownership: { responsibleTeam: value.responsibleTeamNameSnapshot ?? "", pipelineOwners: undefined },
  environment: value.environment,
  capabilities: value.effectiveCapabilities,
}));

export type PersistedPipeline = z.output<typeof pipeline>;

const catalogSchema = z.array(z.object({
  repository: z.string(),
  repositoryId: z.string().regex(/^[1-9]\d*$/),
  workflowId: z.string().regex(/^[1-9]\d*$/),
  workflowName: z.string(),
  workflowPath: z.string(),
  defaultBranch: z.string(),
})).min(1);

declare const __PIPESOR_REGISTRATION_CATALOG__: string | undefined;
const catalogInput = typeof __PIPESOR_REGISTRATION_CATALOG__ === "string" ? __PIPESOR_REGISTRATION_CATALOG__ : "";
export const registrationPilot = import.meta.env?.DEV && catalogInput.length > 0;

export function readPilotCatalog() {
  try {
    return catalogSchema.parse(JSON.parse(catalogInput));
  } catch {
    return undefined;
  }
}

export async function pipelineRequest(token: string, path: string, init?: RequestInit) {
  const response = await fetch(`/api/v1/pipelines${path}`, {
    ...init,
    signal: init?.signal ?? AbortSignal.timeout(10_000),
    cache: "no-store",
    credentials: "omit",
    redirect: "error",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
  });
  if (!response.ok) throw response;
  return response.json() as Promise<unknown>;
}

export function pilotError(failure: unknown) {
  if (failure instanceof Response) {
    if (failure.status === 409) return "duplicate";
    if ([400, 422].includes(failure.status)) return "invalid";
    if ([401, 403, 404].includes(failure.status)) return "denied";
  }
  return "unavailable";
}

export async function registerPilotPipeline(token: string, payload: object) {
  return pipeline.parse(await pipelineRequest(token, "", { method: "POST", body: JSON.stringify(payload) }));
}

const pageSchema = z.object({ items: z.array(pipeline).max(25), offset: z.number(), limit: z.literal(25) });

export async function savePilotPolicy(token: string, id: string, payload: object) {
  const updated = pipeline.parse(await pipelineRequest(token, `/${id}/policy`, {
    method: "PUT", body: JSON.stringify(payload),
  }));
  if (updated.id !== id) throw new Error("Pipeline identity mismatch");
  return updated;
}

export function usePilotPipelineRead(token: string, id?: string) {
  const [result, setResult] = useState<{ id?: string; records?: PersistedPipeline[]; error?: ReturnType<typeof pilotError> }>();
  useEffect(() => {
    const controller = new AbortController();
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(10_000)]);
    async function read() {
      if (id !== undefined) {
        const parsedId = z.uuid().parse(id);
        const record = pipeline.parse(await pipelineRequest(token, `/${parsedId}`, { signal }));
        if (record.id !== parsedId) throw new Error("Pipeline identity mismatch");
        return [record];
      }
      const records: PersistedPipeline[] = [];
      for (let offset = 0; ; offset += 25) {
        const page = pageSchema.parse(await pipelineRequest(token, `?limit=25&offset=${offset}`, { signal }));
        if (page.offset !== offset) throw new Error("Pipeline page mismatch");
        records.push(...page.items);
        if (page.items.length < 25) return records;
      }
    }
    void read().then(
      (records) => { if (!controller.signal.aborted) setResult({ id, records }); },
      (failure: unknown) => { if (!controller.signal.aborted) setResult({ id, error: pilotError(failure) }); },
    );
    return () => controller.abort();
  }, [id, token]);

  return result && result.id === id ? result : undefined;
}
