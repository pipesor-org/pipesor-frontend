import { useTranslation } from "react-i18next";

import {
  INCIDENT_SNAPSHOT_AT,
  IncidentSeverity,
  IncidentValidationStatus,
  STAGE_LABEL_KEY,
  selectNeedsValidationIncidents,
} from "../../../entities/incident";
import { durationMs } from "../../../shared/lib";
import { useFormatters } from "../../../shared/i18n";
import { ChevronRightIcon } from "../../../shared/ui/icons";

import styles from "./NeedsValidationTable.module.css";

const HEADER_CELLS = [
  { key: "severity", labelKey: "table.severity", column: "colSeverity" },
  {
    key: "incident",
    labelKey: "table.incidentWorkflow",
    column: "colIncident",
  },
  { key: "stage", labelKey: "table.stage", column: "colStage" },
  {
    key: "diagnosis",
    labelKey: "table.proposedDiagnosis",
    column: "colDiagnosis",
  },
  { key: "resolved", labelKey: "table.resolved", column: "colResolved" },
  { key: "assignee", labelKey: "table.assignee", column: "colAssignee" },
  { key: "validation", labelKey: "table.validation", column: "colValidation" },
] as const;

/**
 * Needs Validation queue table: resolved incidents whose proposed diagnosis is
 * still awaiting human validation. Pending time is derived from each incident's
 * structured resolution timestamp, never from a stored display string.
 */
export function NeedsValidationTable() {
  const { t } = useTranslation("operations");
  const { formatDuration, formatTimestamp } = useFormatters();
  const incidents = selectNeedsValidationIncidents();

  return (
    <div className={styles.card}>
      <div className={styles.headerRow}>
        {HEADER_CELLS.map((cell) => (
          <span
            key={cell.key}
            className={`${styles.headerCell} ${styles[cell.column]}`}
          >
            {t(cell.labelKey)}
          </span>
        ))}
      </div>

      {incidents.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyTitle}>
            {t("validation.empty.title")}
          </span>
          <span className={styles.emptyText}>
            {t("validation.empty.text")}
          </span>
        </div>
      ) : (
        incidents.map((incident) => (
          <div key={incident.id} className={styles.row}>
            <div className={`${styles.cell} ${styles.colSeverity}`}>
              <IncidentSeverity severity={incident.severity} />
            </div>

            <div className={`${styles.cell} ${styles.colIncident}`}>
              <span className={styles.incidentId}>{incident.id}</span>
              <span className={styles.incidentRepository}>
                {incident.repository}
              </span>
              <span className={styles.incidentWorkflow}>
                {incident.workflow}
              </span>
            </div>

            <div className={`${styles.cell} ${styles.colStage}`}>
              <span className={styles.stage}>
                {t(STAGE_LABEL_KEY[incident.stage])}
              </span>
            </div>

            <div className={`${styles.cell} ${styles.colDiagnosis}`}>
              <span className={styles.diagnosisTitle}>
                {incident.diagnosis}
              </span>
            </div>

            <div className={`${styles.cell} ${styles.colResolved}`}>
              <span className={styles.resolvedAt}>
                {formatTimestamp(incident.resolvedAt)}
              </span>
              <span className={styles.pendingFor}>
                {t("validation.pendingFor", {
                  duration: formatDuration(
                    durationMs(incident.resolvedAt, INCIDENT_SNAPSHOT_AT),
                  ),
                })}
              </span>
            </div>

            <div className={`${styles.cell} ${styles.colAssignee}`}>
              {incident.assignee ? (
                <span className={styles.assignee}>{incident.assignee}</span>
              ) : (
                <span className={styles.assigneeUnassigned}>
                  {t("table.unassigned")}
                </span>
              )}
            </div>

            <div className={`${styles.cell} ${styles.colValidation}`}>
              <IncidentValidationStatus status={incident.validationStatus} />
              <ChevronRightIcon className={styles.validationChevron} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
