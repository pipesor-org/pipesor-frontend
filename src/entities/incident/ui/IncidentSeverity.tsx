import { useTranslation } from "react-i18next";

import { StatusBadge, type StatusTone } from "../../../shared/ui/status-badge";
import type { IncidentSeverityLevel } from "../model/types";
import { SEVERITY_LABEL_KEY } from "./labels";

const TONE_BY_SEVERITY: Record<IncidentSeverityLevel, StatusTone> = {
  Critical: "critical",
  High: "warning",
  Medium: "neutral",
  Low: "neutral",
};

interface IncidentSeverityProps {
  /** `null` when the incident has not been classified; shown as such, never guessed. */
  severity: IncidentSeverityLevel | null;
}

/** Incident severity as a status pill; the label always carries the meaning. */
export function IncidentSeverity({ severity }: IncidentSeverityProps) {
  const { t } = useTranslation("operations");
  if (severity === null) return <StatusBadge tone="neutral">{t("severity.unclassified")}</StatusBadge>;
  return <StatusBadge tone={TONE_BY_SEVERITY[severity]}>{t(SEVERITY_LABEL_KEY[severity])}</StatusBadge>;
}
