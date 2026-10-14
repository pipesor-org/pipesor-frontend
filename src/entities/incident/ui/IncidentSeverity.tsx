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
  severity: IncidentSeverityLevel;
}

/** Colored dot + label describing an incident's severity. */
export function IncidentSeverity({ severity }: IncidentSeverityProps) {
  const { t } = useTranslation("operations");
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
