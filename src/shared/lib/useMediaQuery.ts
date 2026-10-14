import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribes to a CSS media query via `matchMedia`.
 *
 * Lets components branch on breakpoints for *behaviour* (not just styling)
 * without hand-rolling a resize listener. Returns `false` during SSR, i.e. the
 * desktop layout, so the server and first client render agree.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => {};

      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onStoreChange);
      return () => mediaQueryList.removeEventListener("change", onStoreChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
