/** Public API of the `github-access` entity: connection status and discovery through Ingestion. */
export { fetchGitHubConnection, fetchRepositories, fetchSelfPrincipalRef, fetchWorkflows } from "./model/api";
export { COLLABORATORS_CAP, DISCOVERY_CAP, GITHUB_ROLES, fetchCollaborators } from "./model/api";
export type {
  CollaboratorList,
  GitHubCollaborator,
  GitHubConnection,
  GitHubRepository,
  GitHubRole,
  GitHubWorkflow,
  RepositoryList,
} from "./model/api";
