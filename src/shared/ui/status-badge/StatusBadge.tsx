import type { ReactNode } from "react";

import styles from "./StatusBadge.module.css";

export type StatusTone = "neutral" | "accent" | "info" | "success" | "warning" | "critical";
export type StatusBadgeVariant = "soft" | "dot";

interface StatusBadgeProps {
  tone: StatusTone;
  /**
   * `soft` (default): tinted pill, for statuses that need to stand out.
   * `dot`: colored dot with plain text, for dense lists and secondary facts.
   */
  variant?: StatusBadgeVariant;
  /** Pulses the dot for an ongoing process (analysis, capture). Off under reduced motion. */
  live?: boolean;
  children: ReactNode;
}

/**
 * The single representation of a status. The label always carries the
 * meaning; color and dot only reinforce it (never color alone).
 */
export function StatusBadge({ tone, variant = "soft", live = false, children }: StatusBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[tone]}`} data-tone={tone}>
      <span className={`${styles.indicator}${live ? ` ${styles.live}` : ""}`} aria-hidden="true" />
      <span className={styles.label}>{children}</span>
    </span>
  );
}
