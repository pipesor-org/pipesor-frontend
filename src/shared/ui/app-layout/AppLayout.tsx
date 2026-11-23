import type { ReactNode } from "react";

import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  /** Navigation rail rendered in the fixed left column. */
  sidebar: ReactNode;
  /** Optional helper text pinned below the content. */
  hint?: ReactNode;
  /** Main screen content. */
  children: ReactNode;
}

/**
 * Generic two-column app shell: a fixed navigation rail plus a padded content
 * column. Layer-agnostic so pages can compose it while keeping the sidebar (a
 * widget) in the page's own slot.
 */
export function AppLayout({ sidebar, hint, children }: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      {sidebar}

      <main className={styles.main}>
        <div className={styles.content}>
          {children}

          {hint ? (
            <div className={styles.hintRow}>
              <span className={styles.hintText}>{hint}</span>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
