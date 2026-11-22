/**
 * Public API of the `workflow-run` entity: GitHub Actions run attempts read
 * through Ingestion and their durable analysis/capture receipt.
 */
export {
  AnalysisTimeoutError,
  fetchRunAnalysis,
  fetchWorkflowRuns,
  requestRunAnalysis,
  runAnalysisToCompletion,
  safeRunUrl,
} from "./model/api";
export type { AnalysisPhase, RunAnalysis, RunAttemptRef, RunConclusion, WorkflowRef, WorkflowRun } from "./model/api";
