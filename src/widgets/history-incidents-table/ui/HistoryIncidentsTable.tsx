import { useId } from "react";
import { useTranslation } from "react-i18next";

import {
  IncidentValidationStatus,
  STAGE_LABEL_KEY,
  selectHistoryIncidents,
} from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";
import { ChevronRightIcon } from "../../../shared/ui/icons";

import styles from "./HistoryIncidentsTable.module.css";

const COLUMNS = [
  {
    key: "incident",
    labelKey: "columns.incidentWorkflow",
    column: "colIncident",
  },
  { key: "stage", labelKey: "columns.stage", column: "colStage" },
  { key: "diagnosis", labelKey: "columns.diagnosis", column: "colDiagnosis" },
  {
    key: "validation",
    labelKey: "columns.validation",
    column: "colValidation",
  },
  { key: "assignee", labelKey: "columns.assignee", column: "colAssignee" },
  {
    key: "diagnosisTime",
    labelKey: "columns.diagnosisTime",
    column: "colDiagnosisTime",
  },
  {
    key: "resolutionTime",
    labelKey: "columns.resolutionTime",
    column: "colResolutionTime",
  },
  { key: "resolved", labelKey: "columns.resolved", column: "colResolved" },
] as const;

const SECONDS_TO_MS = 1_000;

/** Shown when an optional duration is absent; durations are demo presentation data. */
const EMPTY_VALUE = "—";

/**
 * History — Incidents table.
 *
 * Lists resolved incidents with a terminal diagnosis validation, newest first.
 *
 * Durations come from the optional structured seconds fields and are formatted
 * with the shared precise formatter; no timestamp arithmetic is invented.
 */
export function HistoryIncidentsTable() {
  const { t } = useTranslation("history");
  // Stage labels are domain copy owned by the shared entity label map, which
  // resolves against the `operations` catalog.
  const { t: tOperations } = useTranslation("operations");
  const { formatPreciseDuration, formatTimestamp } = useFormatters();
  const incidents = selectHistoryIncidents();
  const titleId = useId();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle} id={titleId}>
          {t("section.title")}
        </h2>
        <span className={styles.sectionSort}>{t("section.sort")}</span>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table} aria-labelledby={titleId}>
          <colgroup>
            {COLUMNS.map((column) => (
              <col key={column.key} className={styles[column.column]} />
            ))}
          </colgroup>

          <thead>
            <tr className={styles.headerRow}>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={styles.headerCell}
                >
                  {t(column.labelKey)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {incidents.length === 0 ? (
              <tr>
                <td className={styles.empty} colSpan={COLUMNS.length}>
                  {t("empty")}
                </td>
              </tr>
            ) : (
              incidents.map((incident) => (
                <tr key={incident.id} className={styles.row}>
                  <td>
                    <div className={styles.stack}>
                      {/* Fixture IDs have no Workspace; links return when History reads Pipeline. */}
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
                    <span className={styles.stage}>
                      {tOperations(STAGE_LABEL_KEY[incident.stage])}
                    </span>
                  </td>

                  <td>
                    <span className={styles.diagnosis}>
                      {incident.diagnosis}
                    </span>
                  </td>

                  <td>
                    <IncidentValidationStatus
                      status={incident.validationStatus}
                      variant="dot"
                    />
                  </td>

                  <td>
                    {incident.assignee ? (
                      <span className={styles.assignee}>
                        {incident.assignee}
                      </span>
                    ) : (
                      <span className={styles.assigneeUnassigned}>
                        {t("unassigned")}
                      </span>
                    )}
                  </td>

                  <td>
                    <span className={styles.duration}>
                      {incident.diagnosisDurationSeconds == null
                        ? EMPTY_VALUE
                        : formatPreciseDuration(
                            incident.diagnosisDurationSeconds * SECONDS_TO_MS,
                          )}
                    </span>
                  </td>

                  <td>
                    <span className={styles.duration}>
                      {incident.resolutionDurationSeconds == null
                        ? EMPTY_VALUE
                        : formatPreciseDuration(
                            incident.resolutionDurationSeconds * SECONDS_TO_MS,
                          )}
                    </span>
                  </td>

                  <td>
                    <div className={styles.resolvedCell}>
                      <span className={styles.resolvedAt}>
                        {formatTimestamp(incident.resolvedAt)}
                      </span>
                      <ChevronRightIcon className={styles.chevron} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
