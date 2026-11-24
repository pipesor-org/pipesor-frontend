/**
 * Single source of truth for app-level navigation.
 *
 * Paths mirror the screens authored in the Paper source file ("Pipesor").
 * Add a destination here and register its route in `app/App.tsx` when the
 * screen is implemented; set `implemented` to `true` at the same time so the
 * sidebar can expose it.
 */
export const routes = {
  operations: "/operations",
  /**
   * Legacy queue URLs. Kept only so previously shared links and bookmarks keep
   * working: `app/App.tsx` redirects them to the canonical query-parameter URLs
   * below. Do not link to these from new code.
   */
  operationsActiveIncidentsLegacy: "/operations/active-incidents",
  operationsNeedsValidationLegacy: "/operations/needs-validation",
  history: "/history",
  incidentWorkspace: "/incidents/:incidentId",
  pipelines: "/pipelines",
  addMonitoredWorkflow: "/pipelines/new",
  pipelineDetail: "/pipelines/:pipelineId",
  /** Public "About Pipesor" area: how it works, getting started, AI transparency, security. */
  about: "/about",
  aboutView: "/about/:view",
} as const;

/** Views of the About Pipesor area, in tab order. */
export const ABOUT_VIEWS = ["how-it-works", "getting-started", "ai", "security"] as const;
export type AboutView = (typeof ABOUT_VIEWS)[number];

export function isAboutView(value: string | undefined): value is AboutView {
  return ABOUT_VIEWS.some((view) => view === value);
}

export function aboutPath(view: AboutView = "how-it-works"): string {
  return `${routes.about}/${view}`;
}

export function incidentWorkspacePath(id: string, origin: OperationsQueue | "history") {
  return `/incidents/${encodeURIComponent(id)}?from=${origin}`;
}

export function pipelineDetailPath(pipelineId: string): string {
  return `${routes.pipelines}/${encodeURIComponent(pipelineId)}`;
}

/**
 * Operations queue identity.
 *
 * The Active Incidents and Needs Validation queues are different read
 * projections of the same Incident domain, not separate features, so they share
 * a single route and are selected by a query parameter rather than by separate
 * paths. This keeps one URL contract for deep-linking, history and refresh while
 * each queue keeps its own table and summary composition.
 */
export const operationsQueues = ["active", "validation"] as const;
export type OperationsQueue = (typeof operationsQueues)[number];

/** Queue shown when the URL omits or mis-states the `queue` parameter. */
export const DEFAULT_OPERATIONS_QUEUE: OperationsQueue = "active";

/** Query parameter that selects the Operations queue. */
export const OPERATIONS_QUEUE_PARAM = "queue";

/** Narrows an arbitrary value (e.g. a raw query string) to a queue. */
export function isOperationsQueue(
  value: string | null | undefined,
): value is OperationsQueue {
  return (operationsQueues as readonly string[]).includes(value ?? "");
}

/** Parses a raw query value, falling back to the default queue. */
export function parseOperationsQueue(
  value: string | null | undefined,
): OperationsQueue {
  return isOperationsQueue(value) ? value : DEFAULT_OPERATIONS_QUEUE;
}

/** Canonical deep-link URL for a queue. */
export function operationsQueuePath(queue: OperationsQueue): string {
  return `${routes.operations}?${OPERATIONS_QUEUE_PARAM}=${queue}`;
}

/**
 * History view identity.
 *
 * Incidents and Insights are two read presentations of the same resolved-
 * incident domain, so they share `/history` and are selected by a `view` query
 * parameter. Both tabs write the parameter so the active view is always
 * deep-linkable; a bare `/history` still renders the default view for backwards
 * compatibility with previously shared links.
 */
export const historyViews = ["incidents", "insights"] as const;
export type HistoryView = (typeof historyViews)[number];

/** View shown when the URL omits or mis-states the `view` parameter. */
export const DEFAULT_HISTORY_VIEW: HistoryView = "incidents";

/** Query parameter that selects the History view. */
export const HISTORY_VIEW_PARAM = "view";

/** Narrows an arbitrary value (e.g. a raw query string) to a History view. */
export function isHistoryView(
  value: string | null | undefined,
): value is HistoryView {
  return (historyViews as readonly string[]).includes(value ?? "");
}

/** Parses a raw query value, falling back to the default History view. */
export function parseHistoryView(
  value: string | null | undefined,
): HistoryView {
  return isHistoryView(value) ? value : DEFAULT_HISTORY_VIEW;
}

/** Canonical deep-link URL for a History view. */
export function historyViewPath(view: HistoryView): string {
  return `${routes.history}?${HISTORY_VIEW_PARAM}=${view}`;
}

export type AppDestinationKey = "operations" | "history" | "pipelines";

/**
 * Translation key for a destination label, in the `common` namespace. The
 * config carries the key — not the copy — so localization stays in the view
 * layer and this module remains free of presentation strings.
 */
export type AppDestinationLabelKey = `nav.${AppDestinationKey}`;

export interface AppDestination {
  key: AppDestinationKey;
  /** Translation key resolved by the sidebar (`useTranslation("common")`). */
  labelKey: AppDestinationLabelKey;
  /** Route path the destination resolves to once implemented. */
  path: string;
  /** Whether the destination's screen exists yet; unbuilt destinations are not navigable. */
  implemented: boolean;
}

/** Top-level destinations shown in the global sidebar, in display order. */
export const appDestinations: AppDestination[] = [
  {
    key: "operations",
    labelKey: "nav.operations",
    // Canonical queue URL so the sidebar entry stays active across every queue.
    path: operationsQueuePath(DEFAULT_OPERATIONS_QUEUE),
    implemented: true,
  },
  {
    key: "history",
    labelKey: "nav.history",
    path: routes.history,
    implemented: true,
  },
  {
    key: "pipelines",
    labelKey: "nav.pipelines",
    path: routes.pipelines,
    implemented: true,
  },
];

/** Unauthenticated entry routes. They never act as a post-sign-in destination. */
export const authRoutes = {
  signIn: "/login",
  complete: "/auth/complete",
} as const;

/** Query parameter carrying the in-app path to restore after sign-in. */
export const RETURN_TO_PARAM = "return_to";

/**
 * Narrows an untrusted value to a same-origin in-app path.
 *
 * Accepts only absolute paths (`/…`), never protocol-relative or backslash
 * forms that a browser could resolve to another origin, and never the sign-in
 * routes themselves. Returns `null` when the value is not safe.
 */
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value || value.length > 2048) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) return null;
  }
  const path = value.split(/[?#]/, 1)[0];
  if (path === authRoutes.signIn || path.startsWith("/auth/")) return null;
  return value;
}

/** Sign-in URL that returns to `path` afterwards (when safe). */
export function signInPath(path?: string | null): string {
  const safe = safeReturnPath(path);
  return safe ? `${authRoutes.signIn}?${RETURN_TO_PARAM}=${encodeURIComponent(safe)}` : authRoutes.signIn;
}
