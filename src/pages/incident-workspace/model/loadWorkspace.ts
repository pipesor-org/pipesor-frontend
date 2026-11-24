import {
  fetchExecution,
  fetchIncident,
  fetchIncidentRuns,
  type Execution,
  type IncidentRecord,
} from "../../../entities/incident";
import { getPipeline, pipelineWorkflowLabel, type PipelineRecord } from "../../../entities/monitored-pipeline";

export interface WorkspaceData {
  incident: IncidentRecord;
  /** `null` when the pipeline read failed; the incident is still shown. */
  pipeline: PipelineRecord | null;
  /**
   * Repository and workflow names: from the pipeline, or from the facts
   * Pipeline attaches to the incident when the pipeline read failed. `null`
   * when neither is available.
   */
  repository: string | null;
  workflow: string | null;
  /** The failed run that opened the incident, when recorded. */
  origin: Execution | null;
  /** Successful runs linked as verification, newest last. */
  verifications: Execution[];
}

/**
 * Operational read model of the Workspace, all from Pipeline: the incident
 * (its 404 is surfaced to the caller as "not found or no access"), then its
 * pipeline and linked runs. Secondary reads degrade to "unavailable" instead
 * of hiding the incident; the incident's own repository and workflow facts
 * stand in for a failed pipeline read.
 */
export async function loadWorkspace(id: string, signal: AbortSignal): Promise<WorkspaceData> {
  // Runs depend only on the incident id, so they load alongside the incident.
  const runsRead = fetchIncidentRuns(id, signal).catch(() => []);
  const incident = await fetchIncident(id, signal);
  const runs = await runsRead;
  const [pipeline, executions] = await Promise.all([
    getPipeline(incident.pipelineId).catch(() => null),
    Promise.all(
      runs.map((run) =>
        fetchExecution(run.executionId, signal).then(
          (execution) => ({ run, execution }),
          () => null,
        ),
      ),
    ),
  ]);
  const linked = executions.filter((entry) => entry !== null);
  const origin = linked.find((entry) => entry.run.role === "ORIGIN")?.execution ?? null;
  const verifications = linked
    .filter((entry) => entry.run.role === "VERIFICATION")
    .sort((a, b) => a.run.createdAt.localeCompare(b.run.createdAt))
    .map((entry) => entry.execution);
  return {
    incident,
    pipeline,
    repository: pipeline?.fullName ?? incident.repository?.fullName ?? null,
    workflow: (pipeline ? pipelineWorkflowLabel(pipeline) : incident.repository?.workflow) ?? null,
    origin,
    verifications,
  };
}
