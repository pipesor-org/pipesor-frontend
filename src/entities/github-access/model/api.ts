import { z } from "zod";

import { apiRequest, createRequestCache, isApiError } from "../../../shared/api";

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

const nextPageToken = z.string().min(1).nullish();
const repositoriesSchema = z.object({ context: contextSchema, repositories: z.array(repositorySchema), nextPageToken });

/**
 * Discovery is read page by page (`pageSize`, then `nextPageToken`), the
 * largest page the backend allows, up to `DISCOVERY_CAP` items.
 */
export const DISCOVERY_PAGE_SIZE = 100;
export const DISCOVERY_CAP = 1000;

/**
 * Legacy read of an Ingestion without pages: the complete list in one
 * response, at most this many items (the backend maximum). It never truncates:
 * beyond `limit` it answers 503 VERIFICATION_UNAVAILABLE.
 */
export const DISCOVERY_LIMIT = 100;

interface DiscoveryPage<T> {
  items: T[];
  context: z.infer<typeof contextSchema> | null;
  nextPageToken: string | null;
}

/**
 * Every page of a discovery list up to `DISCOVERY_CAP`. An Ingestion without
 * pages rejects `pageSize` with 400 on the first read; the list is then read
 * the legacy way (`limit`), as before.
 */
async function readDiscoveryList<T>(
  readPage: (query: { pageSize?: number; pageToken?: string; limit?: number }) => Promise<DiscoveryPage<T>>,
): Promise<{ items: T[]; context: DiscoveryPage<T>["context"]; truncated: boolean }> {
  let first: DiscoveryPage<T>;
  try {
    first = await readPage({ pageSize: DISCOVERY_PAGE_SIZE });
  } catch (error) {
    if (!isApiError(error) || error.status !== 400) throw error;
    const legacy = await readPage({ limit: DISCOVERY_LIMIT });
    return { items: legacy.items, context: legacy.context, truncated: false };
  }
  const items = [...first.items];
  let token = first.nextPageToken;
  while (token && items.length < DISCOVERY_CAP) {
    const page = await readPage({ pageSize: DISCOVERY_PAGE_SIZE, pageToken: token });
    items.push(...page.items);
    token = page.nextPageToken;
  }
  return { items: items.slice(0, DISCOVERY_CAP), context: first.context, truncated: token !== null || items.length > DISCOVERY_CAP };
}

/** One authorized repository discovery: who it was read for and what they can see. */
export interface RepositoryDiscovery {
  /** The caller's Pipesor principal reference (`tid:oid`). */
  principalRef: string;
  repositories: GitHubRepository[];
  /** More repositories exist than `DISCOVERY_CAP`; the list holds the first ones by name. */
  truncated: boolean;
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
  const list = await readDiscoveryList(async (query) => {
    const page = await apiRequest("ingestion", { path: "/api/v1/github/repositories", query, schema: repositoriesSchema });
    return { items: page.repositories, context: page.context, nextPageToken: page.nextPageToken ?? null };
  });
  // Every repositories page carries the context; the first one always exists.
  const context = list.context as z.infer<typeof contextSchema>;
  return { principalRef: `${context.tenantId}:${context.subjectObjectId}`, repositories: list.items, truncated: list.truncated };
}

/** Repositories the caller can register workflows from, and whether the list stops at the cap. */
export interface RepositoryList {
  repositories: GitHubRepository[];
  truncated: boolean;
}

/**
 * Repositories the caller can register workflows from. Always a fresh read
 * (the user may just have changed access on GitHub); it also refreshes the
 * discovery `fetchSelfPrincipalRef` reuses.
 */
export async function fetchRepositories(): Promise<RepositoryList> {
  discovery.delete(DISCOVERY_KEY);
  const { repositories, truncated } = await discovery.get(DISCOVERY_KEY, readDiscovery);
  return { repositories, truncated };
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

const workflowsSchema = z.object({ workflows: z.array(workflowSchema), nextPageToken });

/** Workflows of one repository, every page (a repository with more than `DISCOVERY_CAP` is not realistic). */
export async function fetchWorkflows(repositoryId: string, signal?: AbortSignal): Promise<GitHubWorkflow[]> {
  const list = await readDiscoveryList(async (query) => {
    const page = await apiRequest("ingestion", {
      path: `/api/v1/github/repositories/${encodeURIComponent(repositoryId)}/workflows`,
      query,
      schema: workflowsSchema,
      signal,
    });
    return { items: page.workflows, context: null, nextPageToken: page.nextPageToken ?? null };
  });
  return list.items;
}

/** Repository roles GitHub reports for a collaborator (custom roles reduced to their base). */
export const GITHUB_ROLES = ["READ", "TRIAGE", "WRITE", "MAINTAIN", "ADMIN"] as const;
export type GitHubRole = (typeof GITHUB_ROLES)[number];

const collaboratorSchema = z.object({
  githubUserId: z.string().regex(/^[1-9][0-9]*$/),
  login: z.string().min(1),
  avatarUrl: z.string().nullish(),
  role: z.enum(GITHUB_ROLES),
  /** Exactly the principal a grant targets (`tid:oid`). */
  principalRef: z.string().regex(/^[^:\s]+:[^:\s]+$/),
  /** `ACTIVE`: has a Pipesor GitHub link (a grant can still require them to sign in again); `NONE`: never signed in. */
  pipesorConnection: z.enum(["ACTIVE", "NONE"]),
});

export type GitHubCollaborator = z.infer<typeof collaboratorSchema>;

const collaboratorsPageSchema = z.object({ items: z.array(collaboratorSchema), nextPageToken });

/** Collaborators read per repository at most (pages of 100). */
export const COLLABORATORS_CAP = 1000;

export interface CollaboratorList {
  collaborators: GitHubCollaborator[];
  /** Every page was read: absence from the list means "no access on GitHub". */
  complete: boolean;
}

/**
 * People with access to a repository on GitHub (users only), read with the
 * caller's own GitHub authorization; the caller must administer the
 * repository (`403 DENIED` otherwise). Every page up to `COLLABORATORS_CAP`.
 */
export async function fetchCollaborators(repositoryId: string, signal?: AbortSignal): Promise<CollaboratorList> {
  const collaborators: GitHubCollaborator[] = [];
  let pageToken: string | undefined;
  do {
    const page = await apiRequest("ingestion", {
      path: `/api/v1/github/repositories/${encodeURIComponent(repositoryId)}/collaborators`,
      query: { pageSize: DISCOVERY_PAGE_SIZE, pageToken },
      schema: collaboratorsPageSchema,
      signal,
    });
    collaborators.push(...page.items);
    pageToken = page.nextPageToken ?? undefined;
  } while (pageToken && collaborators.length < COLLABORATORS_CAP);
  return { collaborators: collaborators.slice(0, COLLABORATORS_CAP), complete: pageToken === undefined };
}
