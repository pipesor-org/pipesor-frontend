import { z } from "zod";

import { apiRequest, createRequestCache } from "../../../shared/api";

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

/**
 * Discovery reads ask for at most this many items, the backend maximum.
 * Ingestion never truncates a list: when the caller can see more items than
 * `limit` it answers 503 VERIFICATION_UNAVAILABLE, so a smaller limit fails for
 * anyone with more repositories (or workflows) than that.
 */
export const DISCOVERY_LIMIT = 100;

/** One authorized repository discovery: who it was read for and what they can see. */
export interface RepositoryDiscovery {
  /** The caller's Pipesor principal reference (`tid:oid`). */
  principalRef: string;
  repositories: GitHubRepository[];
}

/**
 * The session's latest discovery read, shared by every consumer (cleared with
 * the other request caches when the session changes). Reads are not tied to
 * one caller's AbortSignal so a view that unmounts cannot fail another view's
 * read; `useApiQuery` already ignores results of superseded loads.
 */
const discovery = createRequestCache<RepositoryDiscovery>();
const DISCOVERY_KEY = "repositories";

async function readDiscovery(): Promise<RepositoryDiscovery> {
  const page = await apiRequest("ingestion", {
    path: "/api/v1/github/repositories",
    query: { limit: DISCOVERY_LIMIT },
    schema: repositoriesSchema,
  });
  return { principalRef: `${page.context.tenantId}:${page.context.subjectObjectId}`, repositories: page.repositories };
}

/**
 * Repositories the caller can register workflows from. Always a fresh read
 * (the user may just have changed access on GitHub); it also refreshes the
 * discovery `fetchSelfPrincipalRef` reuses.
 */
export async function fetchRepositories(): Promise<GitHubRepository[]> {
  discovery.delete(DISCOVERY_KEY);
  return (await discovery.get(DISCOVERY_KEY, readDiscovery)).repositories;
}

/**
 * The caller's Pipesor principal reference (`tid:oid`) as reported by
 * Ingestion's authorized discovery context, used to grant the caller a
 * capability (the session does not carry it yet). Reuses the session's
 * discovery read when there is one, so the page and the grant share a call.
 */
export async function fetchSelfPrincipalRef(): Promise<string> {
  return (await discovery.get(DISCOVERY_KEY, readDiscovery)).principalRef;
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
