import { useTranslation } from "react-i18next";

import type { DiagnosisStatus } from "../model/schema";

import styles from "./DiagnosisStatusLabel.module.css";

const TONE: Record<DiagnosisStatus, "warning" | "success" | "critical"> = {
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

/** Review status of a diagnosis (human validation), with a decorative tone dot. */
export function DiagnosisStatusLabel({ status }: { status: DiagnosisStatus }) {
  const { t } = useTranslation("operations");
  return (
    <span className={styles.root} data-status={status}>
      <span className={`${styles.dot} ${styles[TONE[status]]}`} aria-hidden="true" />
      <span className={styles[TONE[status]]}>{t(LABEL_KEY[status])}</span>
    </span>
  );
}
