import { useTranslation } from "react-i18next";

import type { IncidentSeverityLevel } from "../model/types";
import { SEVERITY_LABEL_KEY } from "./labels";

import styles from "./IncidentSeverity.module.css";

type SeverityTone = "critical" | "warning" | "neutral";

const TONE_BY_SEVERITY: Record<IncidentSeverityLevel, SeverityTone> = {
  Critical: "critical",
  High: "warning",
  Medium: "neutral",
  Low: "neutral",
};

interface IncidentSeverityProps {
  /** `null` when the incident has not been classified; shown as such, never guessed. */
  severity: IncidentSeverityLevel | null;
}

/** Colored dot + label describing an incident's severity. */
export function IncidentSeverity({ severity }: IncidentSeverityProps) {
  const { t } = useTranslation("operations");
  if (severity === null) {
    return (
      <span className={styles.root}>
        <span className={`${styles.label} ${styles.neutral}`}>{t("severity.unclassified")}</span>
      </span>
    );
  }
  const tone = TONE_BY_SEVERITY[severity];

  return (
    <span className={styles.root}>
      <span className={`${styles.dot} ${styles[tone]}`} />
      <span className={`${styles.label} ${styles[tone]}`}>
        {t(SEVERITY_LABEL_KEY[severity])}
      </span>
    </span>
  );
}
