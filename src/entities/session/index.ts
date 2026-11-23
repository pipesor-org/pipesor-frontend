/**
 * Public API of the `session` entity: the signed-in GitHub identity and its
 * short-lived Pipesor access token (memory + tab `sessionStorage`, no refresh).
 */
export {
  completeSignIn,
  endSession,
  getAccessToken,
  signOut,
  startGitHubSignIn,
} from "./model/session";
export type { Session, SessionEndReason, SessionState, SessionUser } from "./model/session";
export { clearInstallReturn, readInstallReturn, rememberInstallReturn, signInDestination } from "./model/installReturn";
export { useSession } from "./model/useSession";
