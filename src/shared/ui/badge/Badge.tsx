import type { ReactNode } from "react";

import styles from "./Badge.module.css";

export type BadgeTone = "accent" | "neutral";
export type BadgeVariant = "solid" | "outline";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  /** Visual treatment: a filled count pill (`solid`) or a bordered label (`outline`). */
  variant?: BadgeVariant;
}

/** Small pill used next to navigation/tab labels and for static status labels. */
export function Badge({
  children,
  tone = "neutral",
  variant = "solid",
}: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[tone]}`}>
      {children}
    </span>
  );
}
