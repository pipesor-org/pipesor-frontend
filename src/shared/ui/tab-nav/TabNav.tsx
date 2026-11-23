import type { ReactNode } from "react";

import styles from "./TabNav.module.css";

/**
 * Navigation between views of one screen. Each tab is a link supplied by the
 * page (styled with `tabClassName`) that marks the current view with
 * `aria-current="page"`.
 */
export function TabNav({ label, children }: { label: string; children: ReactNode }) {
  return (
    <nav className={styles.tabs} aria-label={label}>
      {children}
    </nav>
  );
}
