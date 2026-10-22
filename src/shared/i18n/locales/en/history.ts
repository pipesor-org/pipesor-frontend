/**
 * `history` namespace — English.
 *
 * History workspace copy: header and view switcher. Values preserve the copy
 * authored in the Paper source ("History v1 — Resolved incidents").
 */
const history = {
  title: "History",
  subtitle: "Resolved CI/CD incidents and diagnosis outcomes.",
  demoBadge: "Prototype · Demo data",

  tabs: {
    ariaLabel: "History views",
    incidents: "Incidents",
    insights: "Insights",
    /** Announced for the Insights view, which has no screen yet. */
    insightsUnavailable: "not available yet",
  },
} as const;

export default history;
