/**
 * Per-session memoization of read requests that many views repeat (for
 * example a pipeline shared by several incident rows). Entries hold the
 * pending promise so concurrent callers share one request; failures are
 * evicted so the next caller retries. Every cache is registered so the app can
 * drop all of them when the session changes.
 */
const caches = new Set<Map<string, Promise<unknown>>>();

export interface RequestCache<T> {
  get(key: string, load: () => Promise<T>): Promise<T>;
  delete(key: string): void;
}

export function createRequestCache<T>(): RequestCache<T> {
  const entries = new Map<string, Promise<T>>();
  caches.add(entries as Map<string, Promise<unknown>>);
  return {
    get(key, load) {
      let pending = entries.get(key);
      if (!pending) {
        pending = load();
        entries.set(key, pending);
        pending.catch(() => {
          if (entries.get(key) === pending) entries.delete(key);
        });
      }
      return pending;
    },
    delete(key) {
      entries.delete(key);
    },
  };
}

/** Forgets every cached read (sign-in, sign-out, expiry). */
export function resetRequestCaches(): void {
  caches.forEach((entries) => entries.clear());
}
