import styles from "./TabNav.module.css";

/** Classes for a tab link inside `TabNav`; `active` shows the accent underline. */
export function tabClassName(active: boolean): string {
  return active ? `${styles.tab} ${styles.active}` : styles.tab;
}
