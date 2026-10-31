import { useId } from "react";
import { useTranslation } from "react-i18next";

import {
  STAGE_LABEL_KEY,
  selectRecurringContexts,
} from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";
import { ChevronRightIcon } from "../../../shared/ui/icons";

import styles from "./HistoryInsightsRecurringContexts.module.css";

/**
 * The frame shows three recurring groups. The demo population has seven, so the
 * table keeps the frame's height with the deterministic top three produced by
 * `selectRecurringContexts` and the caption states how many are omitted.
 */
const RECURRING_GROUP_LIMIT = 3;

/**
 * Recurring incident groups.
 *
 * Groups come from the incident entity (repository + workflow + stage, highest
 * count first). This is a deterministic demo grouping, not a root-cause
 * taxonomy. The table is presentational, like the History table: the frame's
 * hover affordance and chevron are rendered, but no navigation or filtering is
 * wired up, because the corresponding interaction is not part of this view.
 */
export function HistoryInsightsRecurringContexts() {
  const { t } = useTranslation("history");
  const { t: tOperations } = useTranslation("operations");
  const { formatNumber } = useFormatters();
  const titleId = useId();

  const allGroups = selectRecurringContexts();
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
                  key={`${group.repository}\u0000${group.workflow}\u0000${group.stage}`}
                  className={styles.row}
                >
                  <td>
                    <div className={styles.stack}>
                      <span className={styles.repository}>
                        {group.repository}
                      </span>
                      <span className={styles.workflow}>{group.workflow}</span>
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
                  <td className={styles.actionCell} aria-hidden="true">
                    <ChevronRightIcon className={styles.chevron} />
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
