import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DiagnosisStatusLabel, type DiagnosisStatus } from "../../../entities/diagnosis";
import { STAGE_LABEL_KEY, type IncidentStage } from "../../../entities/incident";
import { incidentWorkspacePath } from "../../../shared/config";
import { useFormatters } from "../../../shared/i18n";
import { ChevronRightIcon } from "../../../shared/ui/icons";

import styles from "./HistoryIncidentsTable.module.css";

type Deferred<T> = { kind: "loading" } | { kind: "error" } | { kind: "ready"; value: T };

export interface HistoryIncidentRow {
  id: string;
  label: string;
  stage: IncidentStage;
  resolvedAt: string;
  pipeline: Deferred<{ repository: string; workflow: string | null }>;
  /** `absent` when the incident has no diagnosis. */
  diagnosis: Deferred<{ probableCause: string; status: DiagnosisStatus }> | { kind: "absent" };
  /** `diagnosis.createdAt − detectedAt`, when a diagnosis exists. */
  diagnosisMs: number | null;
  /** `resolvedAt − detectedAt`. */
  resolutionMs: number | null;
}

const COLUMNS = [
  { key: "incident", labelKey: "columns.incidentWorkflow", column: "colIncident" },
  { key: "stage", labelKey: "columns.stage", column: "colStage" },
  { key: "diagnosis", labelKey: "columns.diagnosis", column: "colDiagnosis" },
  { key: "validation", labelKey: "columns.validation", column: "colValidation" },
  { key: "diagnosisTime", labelKey: "columns.diagnosisTime", column: "colDiagnosisTime" },
  { key: "resolutionTime", labelKey: "columns.resolutionTime", column: "colResolutionTime" },
  { key: "resolved", labelKey: "columns.resolved", column: "colResolved" },
] as const;

const EMPTY_VALUE = "—";

/**
 * History — Incidents: every operationally resolved incident (D03, including
 * those still pending review), newest resolution first. Durations are computed
 * from recorded timestamps; a missing measurement shows an em dash.
 */
export function HistoryIncidentsTable({ rows }: { rows: HistoryIncidentRow[] }) {
  const { t } = useTranslation("history");
  const { t: tOperations } = useTranslation("operations");
  const { formatPreciseDuration, formatTimestamp } = useFormatters();
  const titleId = useId();

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle} id={titleId}>{t("section.title")}</h2>
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
                <th key={column.key} scope="col" className={styles.headerCell}>{t(column.labelKey)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className={styles.empty} colSpan={COLUMNS.length}>{t("empty")}</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className={styles.row}>
                  <td>
                    <div className={styles.stack}>
                      <Link className={styles.incidentId} to={incidentWorkspacePath(row.id, "history")}>{row.label}</Link>
                      {row.pipeline.kind === "ready" ? (
                        <>
                          <span className={styles.incidentRepository}>{row.pipeline.value.repository}</span>
                          {row.pipeline.value.workflow && <span className={styles.incidentWorkflow}>{row.pipeline.value.workflow}</span>}
                        </>
                      ) : row.pipeline.kind === "error" ? (
                        <span className={styles.incidentWorkflow}>{tOperations("table.pipelineUnavailable")}</span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <span className={styles.stage}>{tOperations(STAGE_LABEL_KEY[row.stage])}</span>
                  </td>
                  <td>
                    {row.diagnosis.kind === "ready" ? (
                      <span className={styles.diagnosis}>{row.diagnosis.value.probableCause}</span>
                    ) : (
                      <span className={styles.muted}>
                        {row.diagnosis.kind === "absent"
                          ? t("noDiagnosis")
                          : row.diagnosis.kind === "error"
                            ? tOperations("diagnosis.unavailable")
                            : tOperations("diagnosis.loading")}
                      </span>
                    )}
                  </td>
                  <td>
                    {row.diagnosis.kind === "ready" ? <DiagnosisStatusLabel status={row.diagnosis.value.status} /> : <span className={styles.muted}>{EMPTY_VALUE}</span>}
                  </td>
                  <td>
                    <span className={styles.duration}>{row.diagnosisMs === null ? EMPTY_VALUE : formatPreciseDuration(row.diagnosisMs)}</span>
                  </td>
                  <td>
                    <span className={styles.duration}>{row.resolutionMs === null ? EMPTY_VALUE : formatPreciseDuration(row.resolutionMs)}</span>
                  </td>
                  <td>
                    <div className={styles.resolvedCell}>
                      <time className={styles.resolvedAt} dateTime={row.resolvedAt}>{formatTimestamp(row.resolvedAt)}</time>
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
