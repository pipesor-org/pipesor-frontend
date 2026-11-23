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
import { TableEmptyRow, dataTable } from "../../../shared/ui/data-table";
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
    <div className={dataTable.frame}>
      <table className={`${dataTable.table} ${styles.table}`} aria-label={t("tabs.activeIncidents")}>
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
            <TableEmptyRow colSpan={HEADER_CELLS.length} title={t("active.empty.title")} text={t("active.empty.text")} />
          ) : (
            rows.map((row) => (
              <tr key={row.id} className={dataTable.interactiveRow}>
                <td>
                  <IncidentSeverity severity={row.severity} />
                </td>
                <td>
                  <div className={dataTable.stack}>
                    <Link className={`${dataTable.rowLink} ${dataTable.id}`} to={incidentWorkspacePath(row.id, "active")}>
                      {row.label}
                    </Link>
                    {row.pipeline.kind === "ready" ? (
                      <>
                        <span className={dataTable.mono}>{row.pipeline.value.repository}</span>
                        {row.pipeline.value.workflow && <span className={dataTable.muted}>{row.pipeline.value.workflow}</span>}
                      </>
                    ) : row.pipeline.kind === "error" ? (
                      <span className={dataTable.muted}>{t("table.pipelineUnavailable")}</span>
                    ) : (
                      <Skeleton width="160px" />
                    )}
                  </div>
                </td>
                <td>{t(STAGE_LABEL_KEY[row.stage])}</td>
                <td>
                  {row.diagnosis.kind === "ready" ? (
                    <span className={dataTable.clamp}>{row.diagnosis.value}</span>
                  ) : (
                    <span className={dataTable.muted}>
                      {row.diagnosis.kind === "absent"
                        ? t("diagnosis.analyzing")
                        : row.diagnosis.kind === "error"
                          ? t("diagnosis.unavailable")
                          : t("diagnosis.loading")}
                    </span>
                  )}
                </td>
                <td>
                  <IncidentStatusBadge status={row.status} />
                </td>
                <td>
                  <span className={dataTable.trailing}>
                    <span className={dataTable.mono}>{formatDuration(Math.max(0, now - Date.parse(row.detectedAt)))}</span>
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
