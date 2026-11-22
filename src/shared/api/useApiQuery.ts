import { useCallback, useEffect, useRef, useState } from "react";

export type QueryState<T> =
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: unknown };

/**
 * Minimal read hook: runs `load` whenever `key` changes (or on `reload`),
 * aborts the previous request, and ignores results of superseded calls. A
 * `null` key skips loading. This is not a data-cache library; cross-view reuse
 * belongs in an explicit `createRequestCache`.
 */
export function useApiQuery<T>(key: string | null, load: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<QueryState<T>>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const loader = useRef(load);
  loader.current = load;

  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    setState({ status: "loading" });
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
