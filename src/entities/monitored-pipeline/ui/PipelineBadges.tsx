import { useTranslation } from "react-i18next";

import { StatusBadge, type StatusTone } from "../../../shared/ui/status-badge";
import type { PipelineCriticality, PipelineMonitoringStatus } from "../model/api";

const CRITICALITY_TONE: Record<PipelineCriticality, StatusTone> = {
  CRITICAL: "critical",
  HIGH: "warning",
  MEDIUM: "neutral",
  LOW: "neutral",
};

/** Pipeline criticality (operational context, not incident severity). */
export function CriticalityBadge({ criticality }: { criticality: PipelineCriticality }) {
  const { t } = useTranslation("pipelines");
  return <StatusBadge tone={CRITICALITY_TONE[criticality]} variant="dot">{t(`criticality.${criticality}`)}</StatusBadge>;
}

/** Whether Pipesor captures this workflow's runs. */
export function MonitoringBadge({ status }: { status: PipelineMonitoringStatus }) {
  const { t } = useTranslation("pipelines");
  return <StatusBadge tone={status === "ACTIVE" ? "success" : "neutral"} variant="dot">{t(`monitoring.${status}`)}</StatusBadge>;
}
