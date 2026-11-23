import { safeReturnPath } from "../../../shared/config";

/**
 * Where to continue after leaving for the Pipesor GitHub App installation.
 *
 * The installation opens in the same tab, so this tab's `sessionStorage` (and
 * the session in it) survives the round trip to github.com. The path is saved
 * before leaving and used once the user is signed in again: when GitHub's
 * redirect or the Back button does not land in the onboarding flow, sign-in
 * still continues there. Only a safe in-app path is kept, for a limited time.
 */
const STORAGE_KEY = "pipesor.installReturn";

/** An installation abandoned for longer than this no longer steers sign-in. */
export const INSTALL_RETURN_TTL_MS = 30 * 60 * 1000;

export type TabStore = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function tabStore(): TabStore | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function rememberInstallReturn(path: string, store: TabStore | null = tabStore(), now: number = Date.now()): void {
  const safe = safeReturnPath(path);
  if (!safe || !store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify({ path: safe, savedAt: now }));
  } catch {
    // Non-fatal: GitHub's redirect still returns to the onboarding flow.
  }
}

/** The saved path while it is fresh and safe, otherwise `null`. Does not consume it. */
export function readInstallReturn(store: TabStore | null = tabStore(), now: number = Date.now()): string | null {
  if (!store) return null;
  try {
    const raw = store.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null) return null;
    const { path, savedAt } = value as { path?: unknown; savedAt?: unknown };
    if (typeof path !== "string" || typeof savedAt !== "number") return null;
    if (savedAt > now || now - savedAt > INSTALL_RETURN_TTL_MS) return null;
    return safeReturnPath(path);
  } catch {
    return null;
  }
}

/** Forgets the saved path once the user is back in the flow it pointed to. */
export function clearInstallReturn(store: TabStore | null = tabStore()): void {
  try {
    store?.removeItem(STORAGE_KEY);
  } catch {
    // Non-fatal: the value expires on its own.
  }
}

/**
 * Where to go once signed in. The server echoes the requested `return_to`
 * and falls back to `/` when none was sent; only a specific destination wins
 * over a fresh install return path.
 */
export function signInDestination(
  serverReturnTo: string | null,
  store: TabStore | null = tabStore(),
  now: number = Date.now(),
): string | null {
  const requested = serverReturnTo && serverReturnTo !== "/" ? serverReturnTo : null;
  return requested ?? readInstallReturn(store, now);
}
