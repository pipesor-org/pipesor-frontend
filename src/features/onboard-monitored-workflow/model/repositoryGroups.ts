import type { GitHubRepository } from "../../../entities/github-access";

/** A monitored workflow the caller can see, reduced to what the browser marks. */
export interface MonitoredRef {
  pipelineId: string;
  githubRepositoryId: string;
  githubWorkflowId: string;
}

export interface RepositoryEntry {
  repository: GitHubRepository;
  /** Monitored workflows of this repository the caller can see, by GitHub workflow id. */
  monitored: ReadonlyMap<string, string>;
}

/** The repositories of one GitHub account (organization or user). */
export interface AccountGroup {
  account: string;
  /** Repositories that match the search, by name. */
  repositories: RepositoryEntry[];
  /** Every repository of the account, whatever the search. */
  total: number;
  /** Monitored workflows the caller can see in the matching repositories. */
  monitoredCount: number;
}

/** The GitHub account that owns a repository (`owner` of `owner/name`). */
export function repositoryAccount(fullName: string): string {
  return fullName.split("/", 1)[0];
}

function normalize(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Repositories grouped by account, accounts and repositories by name
 * (case-insensitive). A search keeps repositories whose full name contains
 * every word, and drops accounts left without matches; `total` still counts
 * the whole account.
 */
export function groupRepositories(
  repositories: readonly GitHubRepository[],
  monitored: readonly MonitoredRef[],
  query = "",
): AccountGroup[] {
  const byRepository = new Map<string, Map<string, string>>();
  for (const ref of monitored) {
    const workflows = byRepository.get(ref.githubRepositoryId) ?? new Map<string, string>();
    workflows.set(ref.githubWorkflowId, ref.pipelineId);
    byRepository.set(ref.githubRepositoryId, workflows);
  }

  const words = normalize(query).split(" ").filter(Boolean);
  const byName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: "base" });
  const accounts = new Map<string, { total: number; repositories: RepositoryEntry[] }>();
  for (const repository of repositories) {
    const account = repositoryAccount(repository.fullName);
    const group = accounts.get(account) ?? { total: 0, repositories: [] };
    group.total += 1;
    const name = normalize(repository.fullName);
    if (words.every((word) => name.includes(word))) {
      group.repositories.push({ repository, monitored: byRepository.get(repository.repositoryId) ?? new Map() });
    }
    accounts.set(account, group);
  }

  return [...accounts.entries()]
    .filter(([, group]) => group.repositories.length > 0)
    .sort(([a], [b]) => byName(a, b))
    .map(([account, group]) => ({
      account,
      total: group.total,
      repositories: group.repositories.sort((a, b) => byName(a.repository.fullName, b.repository.fullName)),
      monitoredCount: group.repositories.reduce((sum, entry) => sum + entry.monitored.size, 0),
    }));
}
