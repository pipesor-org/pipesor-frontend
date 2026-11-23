import type { ReactNode } from "react";

import type { StatusTone } from "../status-badge";

import styles from "./Stat.module.css";

interface StatGroupProps {
  /** Accessible name of the group (for example the counts it summarizes). */
  label?: string;
  /** Trailing content that is not a metric, such as data freshness. */
  aside?: ReactNode;
  children: ReactNode;
}

/**
 * A row of key figures in one card. The metrics form a description list, so
 * each value keeps its label for assistive technology.
 */
export function StatGroup({ label, aside, children }: StatGroupProps) {
  return (
    <section className={styles.group} aria-label={label}>
      <dl className={styles.stats}>{children}</dl>
      {aside ? <div className={styles.aside}>{aside}</div> : null}
    </section>
  );
}

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** Status dot before the label; meaning stays in the label text. */
  tone?: StatusTone;
  /** Pulses the dot for an ongoing process. */
  live?: boolean;
  /** Durations and other technical values use the mono face. */
  mono?: boolean;
}

export function Stat({ label, value, tone, live = false, mono = false }: StatProps) {
  return (
    <div className={styles.stat}>
      <dt className={styles.label}>
        {tone ? <span className={`${styles.dot} ${styles[tone]}${live ? ` ${styles.live}` : ""}`} aria-hidden="true" /> : null}
        {label}
      </dt>
      <dd className={`${styles.value}${mono ? ` ${styles.mono}` : ""}`}>{value}</dd>
    </div>
  );
}
