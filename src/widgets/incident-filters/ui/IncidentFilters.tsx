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
  /**
   * Current sort description shown at the end of the filter block. Omit it when
   * the screen presents ordering next to its own section heading.
   */
  sortLabel?: string;
  /**
   * Whether the Operations scope row is shown. Screens without assignment
   * scopes, such as History, hide it.
   */
  showScope?: boolean;
}

/**
 * Scope, search, filter and sort controls. The visual structure is shared by the
 * Operations queues and History; queue- and screen-specific copy is passed in by
 * the page, and the scope and sort groups are optional. The controls are
 * presentational only — filtering is out of scope for now.
 */
export function IncidentFilters({
  searchPlaceholder,
  filterLabels,
  sortLabel,
  showScope = true,
}: IncidentFiltersProps) {
  const { t } = useTranslation("common");

  return (
    <div className={styles.filters}>
      {showScope ? (
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
      ) : null}

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

      {sortLabel ? (
        <div className={styles.sortRow}>
          <span className={styles.sortLabel}>{sortLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
