/**
 * `common` namespace — English.
 *
 * App-level and reusable UI copy that is not specific to the Operations
 * workspace. Values preserve the copy authored in the Paper source.
 */
const common = {
  nav: {
    /** Accessible name of the global sidebar navigation landmark. */
    primary: "Primary",
    operations: "Operations",
    history: "History",
    pipelines: "Pipelines",
    /** Accessible name of the sidebar's secondary navigation (About, Settings). */
    secondary: "More",
    about: "About Pipesor",
    settings: "Settings",
  },
  settings: {
    title: "Settings",
    subtitle: "Your account, preferences, GitHub connection and what you can do in Pipesor.",
    profile: {
      title: "Account",
      signedIn: "Signed in with GitHub as {{login}}.",
      session: "This session ends at {{time}} and lives only in this browser tab.",
      signOut: "Sign out",
      signOutNote: "Signing out also disconnects your GitHub account from Pipesor; your access comes back when you sign in again. It does not revoke the authorization you gave the Pipesor GitHub App.",
      revoke: "Revoke it in Authorized GitHub Apps",
      newTab: "opens in a new tab",
    },
    preferences: {
      title: "Preferences",
      language: "Language",
      theme: "Theme",
      themes: { system: "System", light: "Light", dark: "Dark" },
      note: "Preferences are saved in this browser only.",
    },
    github: {
      title: "GitHub",
      text: "Pipesor reads your repositories through its read-only GitHub App. Choose which organizations and repositories it can see on GitHub.",
      manage: "Choose repositories on GitHub",
    },
    access: {
      title: "Your access",
      text: "Pipelines you can see and what you can do on each. Access is given per pipeline by whoever configures it.",
      workflow: "Workflow",
      repository: "Repository",
      level: "Your access",
      empty: "You have no access to any pipeline yet. Register a workflow you administer, or ask a repository administrator to add you.",
      error: "Your pipelines could not be loaded.",
      loading: "Loading your pipelines…",
    },
    browser: {
      title: "Stored in this browser",
      items: {
        session: "Your Pipesor session, in this tab only; it ends when you close the tab or sign out.",
        preferences: "Theme, language and sidebar preferences.",
        nothing: "No cookies and no analytics.",
      },
      more: "Privacy policy: data in your browser",
    },
  },
  /** Announced for sidebar destinations whose screen does not exist yet. */
  destinationUnavailable: "not available yet",
  sidebar: {
    /** Accessible name of the narrow-viewport overlay trigger. */
    open: "Open navigation",
    /** Accessible name of the toggle when it closes the mobile overlay. */
    close: "Close navigation",
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",
  },
  userMenu: {
    /** Accessible name of the profile popover dialog. */
    label: "Account menu",
    signedInWith: "GitHub account",
    signOut: "Sign out",
  },
  language: {
    label: "Language",
  },
  theme: {
    label: "Theme",
    switchToDark: "Switch to dark mode",
    switchToLight: "Switch to light mode",
  },
  filters: {
    scope: "Scope",
    scopeMine: "Mine",
    scopeUnassigned: "Unassigned",
    scopeAll: "All",
  },
  /** Compact duration labels; the separators/spacing are locale-specific. */
  duration: {
    daysHours: "{{days}}d {{hours}}h",
    hoursMinutes: "{{hours}}h {{minutes}}m",
    minutes: "{{minutes}}m",
    /** Sub-hour durations keep seconds, zero-padded (`1m 42s`, `3m 05s`). */
    minutesSeconds: "{{minutes}}m {{seconds}}s",
  },
  notFound: {
    title: "Page not found",
    text: "The page you requested does not exist or has not been built yet.",
    backToOperations: "Back to Operations — Active Incidents",
  },
} as const;

export default common;
