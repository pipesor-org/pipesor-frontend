import { useEffect, useId, useRef, useState, type FocusEvent } from "react";

import { ChevronDownIcon } from "../icons";

import styles from "./FacetMenu.module.css";

export interface FacetOption {
  value: string;
  label: string;
}

interface FacetMenuProps {
  /** Facet name, also the button label and the group's accessible name. */
  label: string;
  options: readonly FacetOption[];
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  /** Visually hidden text after the count, e.g. "selected". */
  selectedLabel: string;
  clearLabel: string;
  /** Shown instead of the options when there are none. */
  emptyLabel?: string;
  /**
   * One value at most (radio buttons, e.g. a period): the button shows the
   * chosen value instead of a count. `selectedLabel` is then unused.
   */
  single?: boolean;
}

/**
 * A filter facet: a quiet button that shows how many values are chosen (or,
 * with `single`, the chosen value), opening a non-modal panel of checkboxes
 * (or radio buttons). Escape closes it and returns focus to the button; a
 * click outside or tabbing out closes it.
 */
export function FacetMenu({ label, options, selected, onChange, selectedLabel, clearLabel, emptyLabel, single = false }: FacetMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const count = selected.length;
  const chosen = single ? options.find((option) => option.value === selected[0]) : undefined;

  useEffect(() => {
    if (!open) return;
    (panel.current?.querySelector<HTMLInputElement>("input:checked") ?? panel.current?.querySelector<HTMLInputElement>("input"))?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      setOpen(false);
      button.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (open && event.relatedTarget && !root.current?.contains(event.relatedTarget as Node)) setOpen(false);
  };

  const toggle = (value: string) =>
    onChange(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);

  return (
    <div className={styles.root} ref={root} onBlur={onBlur}>
      <button
        ref={button}
        type="button"
        className={`${styles.trigger}${count ? ` ${styles.active}` : ""}`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
      >
        {label}
        {chosen ? (
          <span className={styles.value}>{chosen.label}</span>
        ) : count ? (
          <span className={styles.count}>
            {count}
            <span className={styles.srOnly}> {selectedLabel}</span>
          </span>
        ) : null}
        <ChevronDownIcon className={styles.chevron} />
      </button>

      {open ? (
        <div id={panelId} ref={panel} className={styles.panel} role={single ? "radiogroup" : "group"} aria-label={label}>
          {options.length ? (
            <div className={styles.options}>
              {options.map((option) => (
                <label key={option.value} className={styles.option}>
                  {single ? (
                    <input type="radio" name={panelId} checked={selected[0] === option.value} onChange={() => onChange([option.value])} />
                  ) : (
                    <input type="checkbox" checked={selected.includes(option.value)} onChange={() => toggle(option.value)} />
                  )}
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <p className={styles.empty}>{emptyLabel}</p>
          )}
          {count ? (
            <button type="button" className={styles.clear} onClick={() => onChange([])}>
              {clearLabel}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
