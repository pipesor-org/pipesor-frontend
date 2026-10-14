import { useTranslation } from "react-i18next";

import { ChevronDownIcon, SearchIcon } from "../../../shared/ui/icons";
import styles from "./IncidentFilters.module.css";

/**
 * Filter scopes, in display order. Each scope carries a translation key rather
 * than a label so the copy stays in the catalogs.
 */
const SCOPE_OPTIONS = [
  { key: "mine", labelKey: "filters.scopeMine" },
  { key: "unassigned", labelKey: "filters.scopeUnassigned" },
  { key: "all", labelKey: "filters.scopeAll" },
] as const;

const ACTIVE_SCOPE = "all";

interface IncidentFiltersProps {
  /** Placeholder and accessible label for the search field. */
  searchPlaceholder: string;
  /** Labels for the filter dropdowns, in display order. */
  filterLabels: readonly string[];
  /** Current sort description shown at the end of the filter block. */
  sortLabel: string;
}

/**
 * Scope, search, filter and sort controls. The visual structure is shared by
 * every Operations queue; the queue-specific copy is passed in by the page.
 * The controls are presentational only — filtering is out of scope for now.
 */
export function IncidentFilters({
  searchPlaceholder,
  filterLabels,
  sortLabel,
}: IncidentFiltersProps) {
  const { t } = useTranslation("common");

  return (
    <div className={styles.filters}>
      <div className={styles.scopeRow}>
        <span className={styles.scopeLabel}>{t("filters.scope")}</span>
        <div
          className={styles.segmented}
          role="group"
          aria-label={t("filters.scope")}
        >
          {SCOPE_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              className={`${styles.segment}${option.key === ACTIVE_SCOPE ? ` ${styles.segmentActive}` : ""}`}
              aria-pressed={option.key === ACTIVE_SCOPE}
            >
              {t(option.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.queryRow}>
        <label className={styles.searchField}>
          <SearchIcon className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </label>

        {filterLabels.map((label) => (
          <button
            key={label}
            type="button"
            className={styles.filterSelect}
            aria-haspopup="listbox"
          >
            <span className={styles.filterLabel}>{label}</span>
            <ChevronDownIcon className={styles.filterChevron} />
          </button>
        ))}
      </div>

      <div className={styles.sortRow}>
        <span className={styles.sortLabel}>{sortLabel}</span>
      </div>
    </div>
  );
}
