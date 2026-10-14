import { useTranslation } from "react-i18next";

import { DiagnosisValidationStatus } from "../model/types";
import { VALIDATION_STATUS_LABEL_KEY } from "./labels";

import styles from "./IncidentValidationStatus.module.css";

interface IncidentValidationStatusProps {
  status: DiagnosisValidationStatus;
}

/**
 * Human-readable label for an incident's diagnosis-validation state. The
 * mapping from domain token to copy lives in `./labels` so the domain model
 * stays free of presentation strings.
 */
export function IncidentValidationStatus({
  status,
}: IncidentValidationStatusProps) {
  const { t } = useTranslation("operations");

  return (
    <span className={styles.root} data-status={status}>
      {t(VALIDATION_STATUS_LABEL_KEY[status])}
    </span>
  );
}
