import { Skeleton } from "../skeleton";

import styles from "./DataTable.module.css";

/** Widths per row so the placeholder reads as varied content, not a grid of bars. */
const LINE_WIDTHS = [
  ["72%", "48%", "86%"],
  ["64%", "40%", "70%"],
  ["80%", "52%", "60%"],
  ["58%", "44%", "78%"],
];

/**
 * Placeholder for a table that is loading: the frame, a header band and a few
 * rows of lines. Decorative; the caller announces the loading state in words.
 */
export function TableSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className={`${styles.frame} ${styles.skeletonFrame}`} aria-hidden="true">
      <div className={styles.skeletonHead} />
      {Array.from({ length: rows }, (_, index) => {
        const [first, second, third] = LINE_WIDTHS[index % LINE_WIDTHS.length];
        return (
          <div key={index} className={styles.skeletonRow}>
            <Skeleton width="56px" height="20px" shape="pill" />
            <span className={styles.skeletonStack}>
              <Skeleton width={first} />
              <Skeleton width={second} />
            </span>
            <Skeleton width={third} />
          </div>
        );
      })}
    </div>
  );
}
