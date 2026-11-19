import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  IncidentSeverity,
  STAGE_LABEL_KEY,
  STATUS_LABEL_KEY,
  selectActiveIncidents,
} from "../../../entities/incident";
import { incidentWorkspacePath } from "../../../shared/config";
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
      <table className={styles.table} aria-label={t("tabs.activeIncidents")}>
        <colgroup>
          {HEADER_CELLS.map((cell) => (
            <col key={cell.key} className={styles[cell.column]} />
          ))}
        </colgroup>
        <thead>
          <tr className={styles.headerRow}>
            {HEADER_CELLS.map((cell) => (
              <th key={cell.key} scope="col" className={styles.headerCell}>
                {t(cell.labelKey)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {selectActiveIncidents().map((incident) => (
            <tr key={incident.id} className={styles.row}>
              <td>
                <div className={styles.cell}>
                  <IncidentSeverity severity={incident.severity} />
                </div>
              </td>

              <td>
                <div className={styles.cell}>
                  <Link className={styles.incidentId} to={incidentWorkspacePath(incident.id, "active")}>
                    {incident.id}
                  </Link>
                  <span className={styles.incidentRepository}>
                    {incident.repository}
                  </span>
                  <span className={styles.incidentWorkflow}>{incident.workflow}</span>
                </div>
              </td>

              <td>
                <div className={styles.cell}>
                  <span className={styles.stage}>
                    {t(STAGE_LABEL_KEY[incident.stage])}
                  </span>
                </div>
              </td>

              <td>
                <div className={styles.cell}>
                  <span className={styles.diagnosisTitle}>{incident.diagnosis}</span>
                  {incident.diagnosisNote ? (
                    <span className={styles.diagnosisNote}>
                      {incident.diagnosisNote}
                    </span>
                  ) : null}
                </div>
              </td>

              <td>
                <div className={styles.cell}>
                  <span className={styles.status}>
                    {t(STATUS_LABEL_KEY[incident.status])}
                  </span>
                </div>
              </td>

              <td>
                <div className={styles.cell}>
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
              </td>

              <td>
                <div className={styles.cell}>
                  <span className={styles.elapsedRow}>
                    <span className={styles.elapsedValue}>
                      {formatDuration(incident.elapsedMinutes * MS_PER_MINUTE)}
                    </span>
                    <ChevronRightIcon className={styles.elapsedChevron} />
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
