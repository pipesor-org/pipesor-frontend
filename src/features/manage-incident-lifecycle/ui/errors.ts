import { isApiError } from "../../../shared/api";
import { AnalysisTimeoutError } from "../../../entities/workflow-run";

export type LifecycleErrorKey =
  | "forbidden"
  | "conflict"
  | "notFound"
  | "invalid"
  | "network"
  | "captureScopePending"
  | "captureForbidden"
  | "captureTimeout"
  | "generic";

/** Maps a command or capture failure to user-facing copy; never the raw response. */
export function lifecycleErrorKey(error: unknown, source: "pipeline" | "capture"): LifecycleErrorKey {
  if (error instanceof AnalysisTimeoutError) return "captureTimeout";
  if (!isApiError(error)) return "generic";
  if (error.kind === "network") return "network";
  if (source === "capture") {
    if (error.status === 409 && error.code === "CAPTURE_SCOPE_PENDING") return "captureScopePending";
    if (error.status === 403) return "captureForbidden";
  }
  if (error.status === 403) return "forbidden";
  if (error.status === 409) return "conflict";
  if (error.status === 404) return "notFound";
  if (error.status === 400 || error.status === 422) return "invalid";
  return "generic";
}
