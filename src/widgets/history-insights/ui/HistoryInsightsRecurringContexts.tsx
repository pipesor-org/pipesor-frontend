import { useId } from "react";
import { useTranslation } from "react-i18next";

import { STAGE_LABEL_KEY } from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";
import { TableEmptyRow, dataTable } from "../../../shared/ui/data-table";

import type { RecurringContext } from "../model/insights";
import styles from "./HistoryInsightsRecurringContexts.module.css";

/** The frame shows three recurring groups; the caption states how many are omitted. */
const RECURRING_GROUP_LIMIT = 3;

/**
 * Recurring incident groups.
 *
 * Groups are monitored pipeline + stage, highest count first. This is a
 * grouping, not a root-cause taxonomy. Drill-down to History (D05) is not
 * implemented, so rows are not interactive and show no chevron.
 */
export function HistoryInsightsRecurringContexts({ groups: allGroups }: { groups: RecurringContext[] }) {
  const { t } = useTranslation("history");
  const { t: tOperations } = useTranslation("operations");
  const { formatNumber } = useFormatters();
  const titleId = useId();

  const groups = allGroups.slice(0, RECURRING_GROUP_LIMIT);
  const isTruncated = allGroups.length > groups.length;

  return (
    <section className={styles.section} aria-labelledby={titleId}>
      <div className={styles.header}>
        <h2 className={styles.title} id={titleId}>
          {t("insights.recurring.title")}
        </h2>
        <p className={styles.caption}>
          {isTruncated
            ? t("insights.recurring.captionTruncated", {
                shown: formatNumber(groups.length),
                total: formatNumber(allGroups.length),
              })
            : t("insights.recurring.caption")}
        </p>
      </div>

      <div className={dataTable.frame}>
        <table className={`${dataTable.table} ${styles.table}`} aria-labelledby={titleId}>
          <colgroup>
            <col className={styles.colPipeline} />
            <col className={styles.colStage} />
            <col className={styles.colIncidents} />
            <col className={styles.colAction} />
          </colgroup>

          <thead>
            <tr>
              <th scope="col">
                {t("filters.pipeline")}
              </th>
              <th scope="col">
                {t("columns.stage")}
              </th>
              <th scope="col">
                {t("insights.stage.caption")}
              </th>
              <th scope="col" aria-hidden="true" />
            </tr>
          </thead>

          <tbody>
            {groups.length === 0 ? (
              <TableEmptyRow colSpan={4} text={t("insights.summary.noData")} />
            ) : (
              groups.map((group) => (
                <tr key={`${group.pipelineId}:${group.stage}`}>
                  <td>
                    <div className={dataTable.stack}>
                      <span className={`${dataTable.mono} ${styles.ellipsis}`}>
                        {group.repository ?? t("insights.recurring.pipelineUnavailable")}
                      </span>
                      {group.workflow && <span className={`${dataTable.muted} ${styles.ellipsis}`}>{group.workflow}</span>}
                    </div>
                  </td>
                  <td>
                    {tOperations(STAGE_LABEL_KEY[group.stage])}
                  </td>
                  <td>
                    <span className={dataTable.mono}>
                      {formatNumber(group.count)}
                    </span>
                  </td>
                  <td aria-hidden="true" />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
