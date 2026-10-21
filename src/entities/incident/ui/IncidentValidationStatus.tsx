import { useTranslation } from "react-i18next";

import { DiagnosisValidationStatus } from "../model/types";
import { VALIDATION_STATUS_LABEL_KEY } from "./labels";

import styles from "./IncidentValidationStatus.module.css";

type ValidationTone = "success" | "critical" | "warning" | "neutral";

type IncidentValidationStatusVariant = "text" | "dot";

const TONE_BY_VALIDATION_STATUS: Record<
  DiagnosisValidationStatus,
  ValidationTone
> = {
  NOT_APPLICABLE: "neutral",
  PENDING: "warning",
  CONFIRMED: "success",
  REJECTED: "critical",
};

interface IncidentValidationStatusProps {
  status: DiagnosisValidationStatus;
  /**
   * `text` (the default) renders the plain label used by Needs Validation.
   * `dot` adds the 5px status indicator and tinted label used by History.
   */
  variant?: IncidentValidationStatusVariant;
}

/**
 * Human-readable label for an incident's diagnosis-validation state. The
 * mapping from domain token to copy lives in `./labels` so the domain model
 * stays free of presentation strings.
 *
 * The `dot` variant mirrors `IncidentSeverity`; the default variant stays
 * text-only so the existing Operations tables are unaffected. The label always
 * carries the meaning, so the dot itself is decorative.
 */
export function IncidentValidationStatus({
  status,
  variant = "text",
}: IncidentValidationStatusProps) {
  const { t } = useTranslation("operations");
  const label = t(VALIDATION_STATUS_LABEL_KEY[status]);

  if (variant === "text") {
    return (
      <span className={styles.root} data-status={status}>
        {label}
      </span>
    );
  }

  const tone = TONE_BY_VALIDATION_STATUS[status];

  return (
    <span
      className={`${styles.root} ${styles.withDot}`}
      data-status={status}
    >
      <span
        className={`${styles.dot} ${styles[tone]}`}
        aria-hidden="true"
      />
      <span className={styles[tone]}>{label}</span>
    </span>
  );
}
