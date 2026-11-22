/**
 * `auth` namespace — English.
 *
 * Copy for the GitHub sign-in entry and the sign-in completion screen.
 */
const auth = {
  signIn: {
    title: "Connect your GitHub account",
    lead: "Pipesor monitors your GitHub Actions workflows, diagnoses failed runs and lets your team review each diagnosis.",
    continue: "Continue with GitHub",
    redirecting: "Redirecting to GitHub…",
    points: {
      readOnly: "Read-only: Pipesor never changes your code, workflows, secrets or GitHub permissions.",
      repositories: "You will see the repositories where the Pipesor GitHub App is installed and that your organization has enabled in Pipesor.",
      session: "Your session lasts up to one hour and is kept only in this browser tab.",
    },
    manageAccess: "Manage repository access in GitHub",
    opensInNewTab: "(opens in a new tab)",
    preferences: "Display preferences",
  },
  ended: {
    expired: "Your session expired. Sign in again to continue where you left off.",
    unauthorized: "Your session is no longer valid. Sign in again to continue.",
    signedOut: "You signed out of Pipesor.",
  },
  complete: {
    working: "Completing sign-in…",
    failedTitle: "Sign-in could not be completed",
    failedText: "GitHub sign-in did not finish. Links from the sign-in redirect can be used only once and expire after one minute.",
    missing: "This page is only reached from the GitHub sign-in redirect.",
    network: "Pipesor could not be reached. Check your connection and try again.",
    tryAgain: "Sign in again",
    reference: "Error code: {{code}}",
  },
} as const;

export default auth;
