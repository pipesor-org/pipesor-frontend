import type { ReactNode, Ref } from "react";

import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Link back to the parent screen, supplied by the page and shown above the title. */
  back?: ReactNode;
  /** Supporting facts under the subtitle, such as the repository or the GitHub connection. */
  meta?: ReactNode;
  /** Page-level actions, aligned to the end of the title row. */
  actions?: ReactNode;
  /** Separates the header from a dense body with a hairline. */
  divider?: boolean;
  /**
   * Programmatic focus target after navigation. Passing it makes the heading
   * focusable by script (`tabIndex={-1}`) without adding it to the tab order.
   */
  headingRef?: Ref<HTMLHeadingElement>;
  /** Announces title changes politely (a title that resolves after loading). */
  live?: boolean;
}

/**
 * The title block every navigable screen starts with: one `h1`, an optional
 * back link, subtitle, facts and actions, on a single typographic scale.
 */
export function PageHeader({ title, subtitle, back, meta, actions, divider = false, headingRef, live = false }: PageHeaderProps) {
  return (
    <header className={`${styles.header}${divider ? ` ${styles.divider}` : ""}`}>
      {back ? <div className={styles.back}>{back}</div> : null}
      <div className={styles.row}>
        <div className={styles.titleBlock}>
          <h1 ref={headingRef} tabIndex={headingRef ? -1 : undefined} aria-live={live ? "polite" : undefined} className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
          {meta ? <div className={styles.meta}>{meta}</div> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>
    </header>
  );
}
