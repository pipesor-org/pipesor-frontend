/**
 * Safe access to small, non-critical UI preferences in `localStorage`.
 *
 * Storage can throw (private/embedded contexts) and is unavailable during SSR,
 * so every access is guarded and a failure degrades to "no preference" rather
 * than breaking the render.
 */

export function readStoredValue(key: string): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStoredValue(key: string, value: string): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Non-fatal: the in-memory state still applies for this session.
  }
}
