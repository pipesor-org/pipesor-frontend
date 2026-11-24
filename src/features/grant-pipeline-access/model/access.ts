import type { GitHubCollaborator } from "../../../entities/github-access";
import type { PipelineCapability, PipelineGrant } from "../../../entities/monitored-pipeline";

/**
 * Access a person has on a pipeline, as one level instead of separate
 * capabilities. Pipeline stores capability grants (ADR-020): any grant
 * implies VIEW, CONFIGURE does not imply OPERATE.
 */
export const ACCESS_LEVELS = ["VIEW", "OPERATE", "CONFIGURE", "OPERATE_CONFIGURE"] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

const CAPABILITIES: Record<AccessLevel, readonly PipelineCapability[]> = {
  VIEW: ["VIEW"],
  OPERATE: ["OPERATE"],
  CONFIGURE: ["CONFIGURE"],
  OPERATE_CONFIGURE: ["OPERATE", "CONFIGURE"],
};

/** Levels that include CONFIGURE (GitHub administrators only). */
export function configures(level: AccessLevel): boolean {
  return CAPABILITIES[level].includes("CONFIGURE");
}

export function levelOf(capabilities: ReadonlySet<PipelineCapability>): AccessLevel {
  if (capabilities.has("CONFIGURE")) return capabilities.has("OPERATE") ? "OPERATE_CONFIGURE" : "CONFIGURE";
  return capabilities.has("OPERATE") ? "OPERATE" : "VIEW";
}

/**
 * Grants to add and to remove to move a person to `level` (or remove them,
 * `null`). Additions go first, so a person never passes through "no access".
 */
export function accessChanges(current: ReadonlySet<PipelineCapability>, level: AccessLevel | null) {
  const target = new Set<PipelineCapability>(level ? CAPABILITIES[level] : []);
  return {
    add: [...target].filter((capability) => !current.has(capability)),
    remove: [...current].filter((capability) => !target.has(capability)),
  };
}

export interface PersonWithAccess {
  principalRef: string;
  capabilities: ReadonlySet<PipelineCapability>;
  level: AccessLevel;
  /** From GitHub's collaborator list; `null` when not (or not yet) known. */
  collaborator: GitHubCollaborator | null;
  /** The complete collaborator list does not include them: they lost access on GitHub. */
  noLongerOnGitHub: boolean;
  /** The only person who can configure: CONFIGURE cannot be removed from them. */
  lastConfigurer: boolean;
}

/**
 * People holding grants, joined with GitHub's collaborators by principal.
 * Sorted by login (people without one last), the caller first.
 */
export function peopleWithAccess(
  grants: readonly PipelineGrant[],
  collaborators: { list: readonly GitHubCollaborator[]; complete: boolean } | null,
  selfRef: string | null,
): PersonWithAccess[] {
  const byPrincipal = new Map<string, Set<PipelineCapability>>();
  for (const grant of grants) {
    const set = byPrincipal.get(grant.principalRef) ?? new Set<PipelineCapability>();
    set.add(grant.capability);
    byPrincipal.set(grant.principalRef, set);
  }
  const known = new Map((collaborators?.list ?? []).map((collaborator) => [collaborator.principalRef, collaborator]));
  const configurers = [...byPrincipal.values()].filter((set) => set.has("CONFIGURE")).length;

  return [...byPrincipal.entries()]
    .map(([principalRef, capabilities]) => ({
      principalRef,
      capabilities,
      level: levelOf(capabilities),
      collaborator: known.get(principalRef) ?? null,
      noLongerOnGitHub: Boolean(collaborators?.complete) && !known.has(principalRef),
      lastConfigurer: configurers === 1 && capabilities.has("CONFIGURE"),
    }))
    .sort(
      (a, b) =>
        Number(b.principalRef === selfRef) - Number(a.principalRef === selfRef) ||
        Number(!a.collaborator) - Number(!b.collaborator) ||
        (a.collaborator?.login ?? a.principalRef).localeCompare(b.collaborator?.login ?? b.principalRef, undefined, { sensitivity: "base" }),
    );
}

/** Collaborators without access yet, by login, filtered by a search on login (every word). */
export function candidates(collaborators: readonly GitHubCollaborator[], grants: readonly PipelineGrant[], query = ""): GitHubCollaborator[] {
  const holding = new Set(grants.map((grant) => grant.principalRef));
  const words = query.normalize("NFKC").trim().toLowerCase().split(/\s+/).filter(Boolean);
  return collaborators
    .filter((collaborator) => !holding.has(collaborator.principalRef))
    .filter((collaborator) => words.every((word) => collaborator.login.toLowerCase().includes(word)))
    .sort((a, b) => a.login.localeCompare(b.login, undefined, { sensitivity: "base" }));
}

/** Levels that may be offered to a person: CONFIGURE only to GitHub administrators, never dropped from the last configurer. */
export function offeredLevels(role: GitHubCollaborator["role"] | null, lastConfigurer: boolean): AccessLevel[] {
  return ACCESS_LEVELS.filter((level) => (lastConfigurer ? configures(level) : !configures(level) || role === "ADMIN"));
}
