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
      <table className={styles.table} aria-label={t("tabs.needsValidation")}>
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
          {incidents.length === 0 ? (
            <tr>
              <td colSpan={HEADER_CELLS.length} className={styles.emptyCell}>
                <div className={styles.empty}>
                  <span className={styles.emptyTitle}>
                    {t("validation.empty.title")}
                  </span>
                  <span className={styles.emptyText}>
                    {t("validation.empty.text")}
                  </span>
                </div>
              </td>
            </tr>
          ) : (
            incidents.map((incident) => (
              <tr key={incident.id} className={styles.row}>
                <td>
                  <div className={styles.cell}>
                    <IncidentSeverity severity={incident.severity} />
                  </div>
                </td>

                <td>
                  <div className={styles.cell}>
                    <span className={styles.incidentId}>{incident.id}</span>
                    <span className={styles.incidentRepository}>
                      {incident.repository}
                    </span>
                    <span className={styles.incidentWorkflow}>
                      {incident.workflow}
                    </span>
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
                    <span className={styles.diagnosisTitle}>
                      {incident.diagnosis}
                    </span>
                  </div>
                </td>

                <td>
                  <div className={styles.cell}>
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
                </td>

                <td>
                  <div className={styles.cell}>
                    {incident.assignee ? (
                      <span className={styles.assignee}>{incident.assignee}</span>
                    ) : (
                      <span className={styles.assigneeUnassigned}>
                        {t("table.unassigned")}
                      </span>
                    )}
                  </div>
                </td>

                <td>
                  <div className={`${styles.cell} ${styles.validationCell}`}>
                    <IncidentValidationStatus status={incident.validationStatus} />
                    <ChevronRightIcon className={styles.validationChevron} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
