import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DiagnosisStatusLabel, type DiagnosisStatus } from "../../../entities/diagnosis";
import { IncidentSeverity, STAGE_LABEL_KEY, type IncidentSeverityLevel, type IncidentStage } from "../../../entities/incident";
import { incidentWorkspacePath } from "../../../shared/config";
import { useFormatters } from "../../../shared/i18n";
import { ChevronRightIcon } from "../../../shared/ui/icons";

import styles from "./NeedsValidationTable.module.css";

export interface PendingValidationRow {
  id: string;
  label: string;
  severity: IncidentSeverityLevel | null;
  stage: IncidentStage;
  resolvedAt: string;
  /** `null` when the pipeline read failed. */
  pipeline: { repository: string; workflow: string | null } | null;
  probableCause: string;
  status: DiagnosisStatus;
}

const HEADER_CELLS = [
  { key: "severity", labelKey: "table.severity", column: "colSeverity" },
  { key: "incident", labelKey: "table.incidentWorkflow", column: "colIncident" },
  { key: "stage", labelKey: "table.stage", column: "colStage" },
  { key: "diagnosis", labelKey: "table.proposedDiagnosis", column: "colDiagnosis" },
  { key: "resolved", labelKey: "table.resolved", column: "colResolved" },
  { key: "validation", labelKey: "table.validation", column: "colValidation" },
] as const;

/**
 * Needs Validation queue table: resolved incidents whose diagnosis is still
 * awaiting human review. Pending time is live from `resolvedAt`.
 */
export function NeedsValidationTable({ rows, now }: { rows: PendingValidationRow[]; now: number }) {
  const { t } = useTranslation("operations");
  const { formatDuration, formatTimestamp } = useFormatters();

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
          {rows.length === 0 ? (
            <tr>
              <td colSpan={HEADER_CELLS.length} className={styles.emptyCell}>
                <div className={styles.empty}>
                  <span className={styles.emptyTitle}>{t("validation.empty.title")}</span>
                  <span className={styles.emptyText}>{t("validation.empty.text")}</span>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id} className={styles.row}>
                <td>
                  <div className={styles.cell}>
                    <IncidentSeverity severity={row.severity} />
                  </div>
                </td>
                <td>
                  <div className={styles.cell}>
                    <Link className={styles.incidentId} to={incidentWorkspacePath(row.id, "validation")}>
                      {row.label}
                    </Link>
                    {row.pipeline ? (
                      <>
                        <span className={styles.incidentRepository}>{row.pipeline.repository}</span>
                        {row.pipeline.workflow && <span className={styles.incidentWorkflow}>{row.pipeline.workflow}</span>}
                      </>
                    ) : (
                      <span className={styles.incidentWorkflow}>{t("table.pipelineUnavailable")}</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.cell}>
                    <span className={styles.stage}>{t(STAGE_LABEL_KEY[row.stage])}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.cell}>
                    <span className={styles.diagnosisTitle}>{row.probableCause}</span>
                  </div>
                </td>
                <td>
                  <div className={styles.cell}>
                    <time className={styles.resolvedAt} dateTime={row.resolvedAt}>{formatTimestamp(row.resolvedAt)}</time>
                    <span className={styles.pendingFor}>
                      {t("validation.pendingFor", { duration: formatDuration(Math.max(0, now - Date.parse(row.resolvedAt))) })}
                    </span>
                  </div>
                </td>
                <td>
                  <div className={`${styles.cell} ${styles.validationCell}`}>
                    <DiagnosisStatusLabel status={row.status} />
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
