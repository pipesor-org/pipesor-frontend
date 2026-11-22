import { z } from "zod";

import { apiRequest } from "../../../shared/api";

/**
 * GitHub access through Ingestion, always with the signed-in user's own
 * GitHub authorization (ADR-020): connection status and discovery of the
 * admitted, readable repositories and their workflows.
 */
const connectionSchema = z.object({ locallyLinked: z.boolean() });

export type GitHubConnection = z.infer<typeof connectionSchema>;

export function fetchGitHubConnection(signal?: AbortSignal): Promise<GitHubConnection> {
  return apiRequest("ingestion", { path: "/api/v1/github/connection", schema: connectionSchema, signal });
}

/** Discovery context: who the read was authorized for. */
const contextSchema = z.object({
  tenantId: z.string().min(1),
  subjectObjectId: z.string().min(1),
});

const repositorySchema = z.object({
  repositoryId: z.string().regex(/^[1-9][0-9]*$/),
  fullName: z.string().min(1),
  defaultBranch: z.string().nullish(),
});

export type GitHubRepository = z.infer<typeof repositorySchema>;

const repositoriesSchema = z.object({ context: contextSchema, repositories: z.array(repositorySchema) });

/** Discovery reads ask for at most this many items (Ingestion requires `limit`). */
const DISCOVERY_LIMIT = 100;

export async function fetchRepositories(signal?: AbortSignal): Promise<GitHubRepository[]> {
  const page = await apiRequest("ingestion", {
    path: "/api/v1/github/repositories",
    query: { limit: DISCOVERY_LIMIT },
    schema: repositoriesSchema,
    signal,
  });
  return page.repositories;
}

/**
 * The caller's Pipesor principal reference (`tid:oid`) as reported by
 * Ingestion's authorized discovery context. Used to grant the caller a
 * capability; the session does not carry it yet.
 */
export async function fetchSelfPrincipalRef(signal?: AbortSignal): Promise<string> {
  const page = await apiRequest("ingestion", {
    path: "/api/v1/github/repositories",
    query: { limit: 1 },
    schema: repositoriesSchema,
    signal,
  });
  return `${page.context.tenantId}:${page.context.subjectObjectId}`;
}

const workflowSchema = z.object({
  workflowId: z.string().regex(/^[1-9][0-9]*$/),
  name: z.string().min(1),
  file: z.string().nullish(),
});

export type GitHubWorkflow = z.infer<typeof workflowSchema>;

export async function fetchWorkflows(repositoryId: string, signal?: AbortSignal): Promise<GitHubWorkflow[]> {
  const page = await apiRequest("ingestion", {
    path: `/api/v1/github/repositories/${encodeURIComponent(repositoryId)}/workflows`,
    query: { limit: DISCOVERY_LIMIT },
    schema: z.object({ workflows: z.array(workflowSchema) }),
    signal,
  });
  return page.workflows;
}
