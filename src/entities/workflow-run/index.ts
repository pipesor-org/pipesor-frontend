/**
 * Public API of the `workflow-run` entity: GitHub Actions run attempts read
 * through Ingestion and their durable analysis/capture receipt.
 */
export { AnalysisTimeoutError, analysisBlock, isTerminalPhase } from "./model/analysis";
export type { AnalysisBlock, AnalysisPhase } from "./model/analysis";
export {
  fetchRunAnalysis,
  fetchWorkflowRuns,
  requestRunAnalysis,
  runAnalysisToCompletion,
  safeRunUrl,
} from "./model/api";
export type { RunAnalysis, RunAttemptRef, RunConclusion, WorkflowRef, WorkflowRun } from "./model/api";
