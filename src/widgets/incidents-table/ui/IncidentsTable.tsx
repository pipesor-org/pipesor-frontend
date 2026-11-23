import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  IncidentSeverity,
  IncidentStatusBadge,
  STAGE_LABEL_KEY,
  type IncidentSeverityLevel,
  type IncidentStage,
  type IncidentStatus,
} from "../../../entities/incident";
import { incidentWorkspacePath } from "../../../shared/config";
import { useFormatters } from "../../../shared/i18n";
import { ChevronRightIcon } from "../../../shared/ui/icons";
import { Skeleton } from "../../../shared/ui/skeleton";
import styles from "./IncidentsTable.module.css";

/** Row state for a value that is read separately from the incident itself. */
export type Deferred<T> = { kind: "loading" } | { kind: "error" } | { kind: "ready"; value: T };

export interface ActiveIncidentRow {
  id: string;
  label: string;
  severity: IncidentSeverityLevel | null;
  stage: IncidentStage;
  status: IncidentStatus;
  detectedAt: string;
  pipeline: Deferred<{ repository: string; workflow: string | null }>;
  /** `absent` while the analysis has not produced a diagnosis yet. */
  diagnosis: Deferred<string> | { kind: "absent" };
}

const HEADER_CELLS = [
  { key: "severity", labelKey: "table.severity", column: "colSeverity" },
  { key: "incident", labelKey: "table.incidentWorkflow", column: "colIncident" },
  { key: "stage", labelKey: "table.stage", column: "colStage" },
  { key: "diagnosis", labelKey: "table.diagnosis", column: "colDiagnosis" },
  { key: "status", labelKey: "table.status", column: "colStatus" },
  { key: "elapsed", labelKey: "table.elapsed", column: "colElapsed" },
] as const;

/** Active Incidents queue table. Elapsed time is live from `detectedAt`. */
export function IncidentsTable({ rows, now }: { rows: ActiveIncidentRow[]; now: number }) {
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
          {rows.length === 0 ? (
            <tr>
              <td colSpan={HEADER_CELLS.length} className={styles.emptyCell}>
                <div className={styles.empty}>
                  <span className={styles.emptyTitle}>{t("active.empty.title")}</span>
                  <span className={styles.emptyText}>{t("active.empty.text")}</span>
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
                    <Link className={styles.incidentId} to={incidentWorkspacePath(row.id, "active")}>
                      {row.label}
                    </Link>
                    {row.pipeline.kind === "ready" ? (
                      <>
                        <span className={styles.incidentRepository}>{row.pipeline.value.repository}</span>
                        {row.pipeline.value.workflow && <span className={styles.incidentWorkflow}>{row.pipeline.value.workflow}</span>}
                      </>
                    ) : row.pipeline.kind === "error" ? (
                      <span className={styles.incidentWorkflow}>{t("table.pipelineUnavailable")}</span>
                    ) : (
                      <span className={styles.placeholder}><Skeleton width="160px" /></span>
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
                    {row.diagnosis.kind === "ready" ? (
                      <span className={styles.diagnosisTitle}>{row.diagnosis.value}</span>
                    ) : (
                      <span className={styles.diagnosisNote}>
                        {row.diagnosis.kind === "absent"
                          ? t("diagnosis.analyzing")
                          : row.diagnosis.kind === "error"
                            ? t("diagnosis.unavailable")
                            : t("diagnosis.loading")}
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className={styles.cell}>
                    <IncidentStatusBadge status={row.status} />
                  </div>
                </td>
                <td>
                  <div className={styles.cell}>
                    <span className={styles.elapsedRow}>
                      <span className={styles.elapsedValue}>{formatDuration(Math.max(0, now - Date.parse(row.detectedAt)))}</span>
                      <ChevronRightIcon className={styles.elapsedChevron} />
                    </span>
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
