import { useTranslation } from "react-i18next";

import { DEFAULT_INSIGHTS_WINDOW } from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";
import { ChevronDownIcon } from "../../../shared/ui/icons";

import styles from "./HistoryInsightsFilters.module.css";

/**
 * History — Insights filter row.
 *
 * The period is fixed by the demo snapshot and none of the dimension menus exist
 * yet, so every control is static presentational text. Rendering real buttons
 * would promise popovers and filtering the screen cannot deliver, so the row is
 * not exposed as an interactive form until that behaviour is implemented. The
 * layout keeps the frame's wide period control followed by four equal-width
 * dimension slots.
 */
export function HistoryInsightsFilters() {
  const { t } = useTranslation("history");
  const { formatShortDateRange } = useFormatters();

  const range = formatShortDateRange(
    DEFAULT_INSIGHTS_WINDOW.start,
    DEFAULT_INSIGHTS_WINDOW.end,
  );

  const controls = [
    {
      key: "date",
      label: t("filters.dateRangeValue", { range }),
      wide: true,
    },
    { key: "repository", label: t("filters.repository"), wide: false },
    { key: "pipeline", label: t("filters.pipeline"), wide: false },
    { key: "stage", label: t("filters.stage"), wide: false },
    { key: "severity", label: t("filters.severity"), wide: false },
  ] as const;

  return (
    <div className={styles.filters}>
      {controls.map(({ key, label, wide }) => (
        <span
          key={key}
          className={`${styles.control}${wide ? ` ${styles.controlWide}` : ""}`}
        >
          <span className={styles.label}>{label}</span>
          <ChevronDownIcon className={styles.chevron} />
        </span>
      ))}
    </div>
  );
}
