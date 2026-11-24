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
    consent: "I have read the <privacy>Privacy policy</privacy> and authorize the processing of my data to use Pipesor, including its transfer to the United States, where Microsoft (Azure and Azure OpenAI) and GitHub host and process it. I accept the <terms>Terms of use</terms>.",
    consentRequired: "To continue, accept the Privacy policy and the Terms of use.",
    points: {
      readOnly: "Read-only: Pipesor never changes your code, workflows, secrets or GitHub permissions.",
      repositories: "Any GitHub account can sign in. Repositories appear once their administrator selects them in the Pipesor GitHub App, and you only see those you can access on GitHub.",
      session: "Your session lasts up to one hour and is kept only in this browser tab.",
    },
    manageAccess: "Install the GitHub App or manage repository access",
    preferences: "Display preferences",
    about: { label: "About Pipesor", howItWorks: "How it works", ai: "AI transparency", security: "Security" },
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
