import { monitoredPipelines } from "./monitoredPipelines";
import type { MonitoredPipeline } from "./schema";

export function selectMonitoredPipelineById(
  id: string | undefined,
  all: readonly MonitoredPipeline[] = monitoredPipelines,
): MonitoredPipeline | undefined {
  return all.find((pipeline) => pipeline.id === id);
}
