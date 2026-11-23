import { z } from "zod";

import { apiRequest, apiUrl } from "../../../shared/api";
import { RETURN_TO_PARAM, safeReturnPath } from "../../../shared/config";

import { readInstallReturn } from "./installReturn";

/** GitHub identity of the signed-in person, as returned by Ingestion. */
export const sessionUserSchema = z.object({
  githubUserId: z.string().min(1),
  login: z.string().min(1).max(39),
});

/** `POST /api/v1/auth/session` response (platform identity contract §5). */
const sessionResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.iso.datetime({ offset: true }),
  user: sessionUserSchema,
  returnTo: z.string().nullish(),
});

const storedSessionSchema = sessionResponseSchema.omit({ returnTo: true });

export type SessionUser = z.infer<typeof sessionUserSchema>;
export type Session = z.infer<typeof storedSessionSchema>;

/** Why the previous session ended; drives the sign-in screen message. */
export type SessionEndReason = "expired" | "unauthorized" | "signedOut";

export interface SessionState {
  session: Session | null;
  endReason: SessionEndReason | null;
}

/**
 * Tab-scoped persistence: survives reloads of this tab only and is cleared when
 * the tab closes. There is no refresh token; an expired session is discarded.
 */
const STORAGE_KEY = "pipesor.session";
/** Browsers cap `setTimeout` delays at 2^31-1 ms. */
const MAX_TIMER_MS = 2_147_483_647;

function expiresInMs(session: Session): number {
  return Date.parse(session.expiresAt) - Date.now();
}

function readStored(): Session | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = storedSessionSchema.safeParse(JSON.parse(raw));
    if (parsed.success && expiresInMs(parsed.data) > 0) return parsed.data;
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Unavailable or corrupt storage means "signed out".
  }
  return null;
}

function writeStored(session: Session | null): void {
  try {
    if (session) window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // The in-memory session still applies to this page.
  }
}

let state: SessionState = { session: readStored(), endReason: null };
const listeners = new Set<() => void>();
let expiryTimer: ReturnType<typeof setTimeout> | undefined;

function setState(next: SessionState): void {
  state = next;
  writeStored(next.session);
  scheduleExpiry();
  listeners.forEach((listener) => listener());
}

function scheduleExpiry(): void {
  clearTimeout(expiryTimer);
  const { session } = state;
  if (!session) return;
  const remaining = expiresInMs(session);
  if (remaining <= 0) {
    // Defer so a render-time read never triggers a synchronous update.
    expiryTimer = setTimeout(() => endSession("expired"), 0);
    return;
  }
  expiryTimer = setTimeout(() => {
    if (state.session && expiresInMs(state.session) <= 0) endSession("expired");
    else scheduleExpiry();
  }, Math.min(remaining, MAX_TIMER_MS));
}

scheduleExpiry();

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSessionState(): SessionState {
  return state;
}

/** Current bearer token, or `null` when signed out or expired. */
export function getAccessToken(): string | null {
  const { session } = state;
  return session && expiresInMs(session) > 0 ? session.accessToken : null;
}

/** Discards the local session. Idempotent. */
export function endSession(reason: SessionEndReason): void {
  if (!state.session) return;
  setState({ session: null, endReason: reason });
}

/**
 * Starts the GitHub sign-in (identity contract §5 step 1) with a full-page
 * navigation to Ingestion, which redirects to GitHub and back to
 * `/auth/complete`. Only a safe in-app path is forwarded as `return_to`;
 * without one, the path saved before a GitHub App installation is used.
 *
 * Ingestion currently accepts a path without query (`?…` answers 400), so the
 * query is dropped and the view returns with its default criteria.
 */
export function startGitHubSignIn(returnTo?: string | null): void {
  // Without a requested destination, continue where an App installation started.
  const safe = safeReturnPath(safeReturnPath(returnTo ?? readInstallReturn())?.split(/[?#]/, 1)[0]);
  window.location.assign(apiUrl("ingestion", "/api/v1/auth/github/start", safe ? { [RETURN_TO_PARAM]: safe } : undefined));
}

const exchanges = new Map<string, Promise<string | null>>();

/**
 * Exchanges the one-time handoff for a session (§5 step 3) and returns the safe
 * in-app path to continue to. The handoff is single-use, so concurrent or
 * repeated calls for the same value share one request.
 */
export function completeSignIn(handoff: string): Promise<string | null> {
  let pending = exchanges.get(handoff);
  if (!pending) {
    pending = apiRequest("ingestion", {
      method: "POST",
      path: "/api/v1/auth/session",
      body: { handoff },
      schema: sessionResponseSchema,
      authenticated: false,
    }).then(({ returnTo, ...session }) => {
      setState({ session, endReason: null });
      return safeReturnPath(returnTo);
    });
    exchanges.set(handoff, pending);
  }
  return pending;
}

/**
 * Signs out: asks Ingestion to invalidate the server-side link generation and
 * always discards the local session, even if that call fails.
 */
export async function signOut(): Promise<void> {
  try {
    if (getAccessToken()) await apiRequest("ingestion", { method: "POST", path: "/api/v1/auth/logout", schema: null });
  } catch {
    // The local session is discarded regardless; the server token expires on its own.
  } finally {
    endSession("signedOut");
  }
}
