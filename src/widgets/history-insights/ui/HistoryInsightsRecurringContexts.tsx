import { useId } from "react";
import { useTranslation } from "react-i18next";

import { STAGE_LABEL_KEY } from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";

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

      <div className={styles.tableWrapper}>
        <table className={styles.table} aria-labelledby={titleId}>
          <colgroup>
            <col className={styles.colPipeline} />
            <col className={styles.colStage} />
            <col className={styles.colIncidents} />
            <col className={styles.colAction} />
          </colgroup>

          <thead>
            <tr className={styles.headerRow}>
              <th scope="col" className={styles.headerCell}>
                {t("filters.pipeline")}
              </th>
              <th scope="col" className={styles.headerCell}>
                {t("columns.stage")}
              </th>
              <th scope="col" className={styles.headerCell}>
                {t("insights.stage.caption")}
              </th>
              <th
                scope="col"
                className={styles.headerCell}
                aria-hidden="true"
              />
            </tr>
          </thead>

          <tbody>
            {groups.length === 0 ? (
              <tr>
                <td className={styles.empty} colSpan={4}>
                  {t("insights.summary.noData")}
                </td>
              </tr>
            ) : (
              groups.map((group) => (
                <tr
                  key={`${group.pipelineId}:${group.stage}`}
                  className={styles.row}
                >
                  <td>
                    <div className={styles.stack}>
                      <span className={styles.repository}>
                        {group.repository ?? t("insights.recurring.pipelineUnavailable")}
                      </span>
                      {group.workflow && <span className={styles.workflow}>{group.workflow}</span>}
                    </div>
                  </td>
                  <td>
                    <span className={styles.stage}>
                      {tOperations(STAGE_LABEL_KEY[group.stage])}
                    </span>
                  </td>
                  <td>
                    <span className={styles.count}>
                      {formatNumber(group.count)}
                    </span>
                  </td>
                  <td className={styles.actionCell} aria-hidden="true" />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
