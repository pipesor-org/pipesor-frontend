import type { ReactNode } from "react";

import styles from "./Badge.module.css";

export type BadgeTone = "accent" | "neutral";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
}

/** Small count pill next to navigation and tab labels. Statuses use `StatusBadge`. */
export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return <span className={`${styles.badge} ${styles[tone]}`}>{children}</span>;
}
