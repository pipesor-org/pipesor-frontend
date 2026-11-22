import { useCallback, useEffect, useRef, useState } from "react";

export type QueryState<T> =
  | { status: "loading" }
  /** `refreshing` is set while a reload of the same key is in flight. */
  | { status: "success"; data: T; refreshing?: boolean }
  | { status: "error"; error: unknown };

/**
 * Minimal read hook: runs `load` whenever `key` changes (or on `reload`),
 * aborts the previous request, and ignores results of superseded calls. A
 * `null` key skips loading. A reload of the same key keeps the current data
 * (marked `refreshing`) so the view does not flash back to a loading state.
 * This is not a data-cache library; cross-view reuse belongs in an explicit
 * `createRequestCache`.
 */
export function useApiQuery<T>(key: string | null, load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<QueryState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const loader = useRef(load);
  loader.current = load;
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    const sameKey = lastKey.current === key;
    lastKey.current = key;
    setState((previous) =>
      sameKey && previous.status === "success" ? { ...previous, refreshing: true } : { status: "loading" },
    );
    loader.current(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: "success", data });
      },
      (error: unknown) => {
        if (!controller.signal.aborted) setState({ status: "error", error });
      },
    );
    return () => controller.abort();
  }, [key, attempt]);

  const reload = useCallback(() => setAttempt((value) => value + 1), []);
  return { state, reload, setData: useCallback((data: T) => setState({ status: "success", data }), []) };
}
