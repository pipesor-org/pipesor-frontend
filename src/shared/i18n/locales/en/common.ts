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
