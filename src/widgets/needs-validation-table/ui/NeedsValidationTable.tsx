import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DiagnosisStatusLabel, type DiagnosisStatus } from "../../../entities/diagnosis";
import { IncidentSeverity, STAGE_LABEL_KEY, type IncidentSeverityLevel, type IncidentStage } from "../../../entities/incident";
import { incidentWorkspacePath } from "../../../shared/config";
import { useFormatters } from "../../../shared/i18n";
import { TableEmptyRow, dataTable } from "../../../shared/ui/data-table";
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
    <div className={dataTable.frame}>
      <table className={`${dataTable.table} ${styles.table}`} aria-label={t("tabs.needsValidation")}>
        <colgroup>
          {HEADER_CELLS.map((cell) => (
            <col key={cell.key} className={styles[cell.column]} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {HEADER_CELLS.map((cell) => (
              <th key={cell.key} scope="col">
                {t(cell.labelKey)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <TableEmptyRow colSpan={HEADER_CELLS.length} title={t("validation.empty.title")} text={t("validation.empty.text")} />
          ) : (
            rows.map((row) => (
              <tr key={row.id} className={dataTable.interactiveRow}>
                <td>
                  <IncidentSeverity severity={row.severity} />
                </td>
                <td>
                  <div className={dataTable.stack}>
                    <Link className={`${dataTable.rowLink} ${dataTable.id}`} to={incidentWorkspacePath(row.id, "validation")}>
                      {row.label}
                    </Link>
                    {row.pipeline ? (
                      <>
                        <span className={dataTable.mono}>{row.pipeline.repository}</span>
                        {row.pipeline.workflow && <span className={dataTable.muted}>{row.pipeline.workflow}</span>}
                      </>
                    ) : (
                      <span className={dataTable.muted}>{t("table.pipelineUnavailable")}</span>
                    )}
                  </div>
                </td>
                <td>{t(STAGE_LABEL_KEY[row.stage])}</td>
                <td>
                  <span className={dataTable.clamp}>{row.probableCause}</span>
                </td>
                <td>
                  <div className={dataTable.stack}>
                    <time className={dataTable.mono} dateTime={row.resolvedAt}>{formatTimestamp(row.resolvedAt)}</time>
                    <span className={dataTable.muted}>
                      {t("validation.pendingFor", { duration: formatDuration(Math.max(0, now - Date.parse(row.resolvedAt))) })}
                    </span>
                  </div>
                </td>
                <td>
                  <span className={dataTable.trailing}>
                    <DiagnosisStatusLabel status={row.status} />
                    <ChevronRightIcon className={dataTable.chevron} />
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
