import { useTranslation } from "react-i18next";

import {
  IncidentSeverity,
  STAGE_LABEL_KEY,
  STATUS_LABEL_KEY,
  selectActiveIncidents,
} from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";
import { ChevronRightIcon } from "../../../shared/ui/icons";
import styles from "./IncidentsTable.module.css";

const HEADER_CELLS = [
  { key: "severity", labelKey: "table.severity", column: "colSeverity" },
  {
    key: "incident",
    labelKey: "table.incidentWorkflow",
    column: "colIncident",
  },
  { key: "stage", labelKey: "table.stage", column: "colStage" },
  { key: "diagnosis", labelKey: "table.diagnosis", column: "colDiagnosis" },
  { key: "status", labelKey: "table.status", column: "colStatus" },
  { key: "assignee", labelKey: "table.assignee", column: "colAssignee" },
  { key: "elapsed", labelKey: "table.elapsed", column: "colElapsed" },
] as const;

const MS_PER_MINUTE = 60_000;

export function IncidentsTable() {
  const { t } = useTranslation("operations");
  const { formatDuration } = useFormatters();

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

      {selectActiveIncidents().map((incident) => (
        <div key={incident.id} className={styles.row}>
          <div className={`${styles.cell} ${styles.colSeverity}`}>
            <IncidentSeverity severity={incident.severity} />
          </div>

          <div className={`${styles.cell} ${styles.colIncident}`}>
            <span className={styles.incidentId}>{incident.id}</span>
            <span className={styles.incidentRepository}>
              {incident.repository}
            </span>
            <span className={styles.incidentWorkflow}>{incident.workflow}</span>
          </div>

          <div className={`${styles.cell} ${styles.colStage}`}>
            <span className={styles.stage}>
              {t(STAGE_LABEL_KEY[incident.stage])}
            </span>
          </div>

          <div className={`${styles.cell} ${styles.colDiagnosis}`}>
            <span className={styles.diagnosisTitle}>{incident.diagnosis}</span>
            {incident.diagnosisNote ? (
              <span className={styles.diagnosisNote}>
                {incident.diagnosisNote}
              </span>
            ) : null}
          </div>

          <div className={`${styles.cell} ${styles.colStatus}`}>
            <span className={styles.status}>
              {t(STATUS_LABEL_KEY[incident.status])}
            </span>
          </div>

          <div className={`${styles.cell} ${styles.colAssignee}`}>
            {incident.assignee ? (
              <span className={styles.assignee}>{incident.assignee}</span>
            ) : (
              <>
                <span className={styles.assigneeUnassigned}>
                  {t("table.unassigned")}
                </span>
                <span className={styles.assignAction}>
                  {t("table.assignToMe")}
                </span>
              </>
            )}
          </div>

          <div className={`${styles.cell} ${styles.colElapsed}`}>
            <span className={styles.elapsedRow}>
              <span className={styles.elapsedValue}>
                {formatDuration(incident.elapsedMinutes * MS_PER_MINUTE)}
              </span>
              <ChevronRightIcon className={styles.elapsedChevron} />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
