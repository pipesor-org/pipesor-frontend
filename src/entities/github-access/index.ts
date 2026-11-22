/** Public API of the `github-access` entity: connection status and discovery through Ingestion. */
export { fetchGitHubConnection, fetchRepositories, fetchSelfPrincipalRef, fetchWorkflows } from "./model/api";
export type { GitHubConnection, GitHubRepository, GitHubWorkflow } from "./model/api";
