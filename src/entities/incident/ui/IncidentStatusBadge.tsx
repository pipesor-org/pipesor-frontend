import { useTranslation } from "react-i18next";

import { StatusBadge, type StatusTone } from "../../../shared/ui/status-badge";
import type { IncidentStatus as IncidentStatusValue } from "../model/types";
import { STATUS_LABEL_KEY } from "./labels";

const TONE_BY_STATUS: Record<IncidentStatusValue, StatusTone> = {
  Open: "warning",
  "In remediation": "info",
  Verification: "accent",
  Resolved: "success",
};

/** Operational lifecycle status, as a dot and label (dense lists and headers). */
export function IncidentStatusBadge({ status }: { status: IncidentStatusValue }) {
  const { t } = useTranslation("operations");
  return <StatusBadge tone={TONE_BY_STATUS[status]} variant="dot">{t(STATUS_LABEL_KEY[status])}</StatusBadge>;
}
