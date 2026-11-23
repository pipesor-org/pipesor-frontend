import type { CSSProperties } from "react";

import styles from "./Skeleton.module.css";

interface SkeletonProps {
  /** CSS width (e.g. "60%", "120px"); defaults to the full line. */
  width?: CSSProperties["width"];
  /** CSS height; defaults to one line of body text. */
  height?: CSSProperties["height"];
  /** Rounder shape for avatars and pills. */
  shape?: "line" | "pill" | "circle";
}

/**
 * Placeholder for content that is loading. Purely decorative: the region that
 * loads announces its own state (role="status"), so skeletons are hidden from
 * assistive technology. The shimmer stops under prefers-reduced-motion.
 */
export function Skeleton({ width = "100%", height, shape = "line" }: SkeletonProps) {
  return <span className={`${styles.skeleton} ${styles[shape]}`} style={{ width, height }} aria-hidden="true" />;
}
