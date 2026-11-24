import { useEffect, useRef, useState, type ReactNode } from "react";

import { TextInput } from "../field";
import { SearchIcon } from "../icons";

import styles from "./FilterBar.module.css";

/** Typing settles for this long before the query (and the URL) change. */
const SEARCH_DEBOUNCE_MS = 300;

export interface FilterBarProps {
  /** Committed search text (usually from the URL). */
  query: string;
  /** Called once typing settles. */
  onQueryChange: (query: string) => void;
  /** Placeholder and accessible name of the search field. */
  searchLabel: string;
  maxLength?: number;
  /** Facet controls, usually `FacetMenu`s. */
  facets?: ReactNode;
  /** Result line ("2 of 4 incidents"), announced politely. */
  result?: ReactNode;
  /** Some criterion is set; text being typed also counts. Shows Clear. */
  active: boolean;
  clearLabel: string;
  /** Clears every criterion; the bar empties its field and focuses it. */
  onClear: () => void;
}

/**
 * One quiet row of criteria above a list: search, facets, the result line and
 * Clear. Domain-free: each view decides its criteria, their URL form and how
 * they are applied. `/` focuses the search from anywhere outside a text field.
 */
export function FilterBar({ query, onQueryChange, searchLabel, maxLength, facets, result, active, clearLabel, onClear }: FilterBarProps) {
  const [text, setText] = useState(query);
  const search = useRef<HTMLInputElement>(null);
  // The latest callback, so re-renders while typing do not restart the wait.
  const commit = useRef(onQueryChange);
  commit.current = onQueryChange;

  // Follow outside changes (Clear, Back) without fighting the user's typing.
  useEffect(() => {
    setText((current) => (current.trim() === query.trim() ? current : query));
  }, [query]);

  useEffect(() => {
    if (text.trim() === query.trim()) return;
    const timer = setTimeout(() => commit.current(text), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      search.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className={styles.bar}>
      <label className={styles.search}>
        <span className={styles.srOnly}>{searchLabel}</span>
        <TextInput
          ref={search}
          type="search"
          value={text}
          placeholder={searchLabel}
          icon={<SearchIcon />}
          autoComplete="off"
          maxLength={maxLength}
          className={styles.searchInput}
          onChange={(event) => setText(event.target.value)}
        />
        {!text ? <kbd className={styles.shortcut} aria-hidden="true">/</kbd> : null}
      </label>

      {facets ? <div className={styles.facets}>{facets}</div> : null}

      <div className={styles.summary}>
        <span className={styles.result} role="status">{result}</span>
        {active || text.trim() !== "" ? (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              setText("");
              onClear();
              search.current?.focus();
            }}
          >
            {clearLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
