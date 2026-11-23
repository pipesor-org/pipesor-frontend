import { useTranslation } from "react-i18next";

import { StatusBadge, type StatusTone } from "../../../shared/ui/status-badge";
import type { DiagnosisStatus } from "../model/schema";

const TONE: Record<DiagnosisStatus, StatusTone> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CORRECTED: "critical",
  REJECTED: "critical",
};

const LABEL_KEY = {
  PENDING: "diagnosis.status.pending",
  CONFIRMED: "diagnosis.status.confirmed",
  CORRECTED: "diagnosis.status.corrected",
  REJECTED: "diagnosis.status.rejected",
} as const satisfies Record<DiagnosisStatus, string>;

/** Review status of a diagnosis (human validation) as a status pill. */
export function DiagnosisStatusLabel({ status }: { status: DiagnosisStatus }) {
  const { t } = useTranslation("operations");
  return <StatusBadge tone={TONE[status]}>{t(LABEL_KEY[status])}</StatusBadge>;
}
