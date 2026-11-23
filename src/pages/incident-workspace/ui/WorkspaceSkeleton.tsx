import { Skeleton } from "../../../shared/ui/skeleton";

import styles from "./IncidentWorkspace.module.css";

/** Placeholder lines for the diagnosis while it loads (inference band, cause, note). */
export function DiagnosisSkeleton() {
  return (
    <div className={styles.skeletonStack} aria-hidden="true">
      <Skeleton width="28%" height="10px" />
      <Skeleton width="92%" height="16px" />
      <Skeleton width="76%" height="16px" />
      <Skeleton width="40%" />
    </div>
  );
}

/**
 * Placeholder for the whole Workspace while the incident loads: a diagnosis
 * card, a lifecycle card and the rail. Decorative; the heading says it loads.
 */
export function WorkspaceSkeleton() {
  return (
    <div className={styles.columns} aria-hidden="true">
      <div className={styles.main}>
        <div className={styles.card}>
          <section className={styles.inference}><DiagnosisSkeleton /></section>
          <section>
            <div className={styles.skeletonStack}>
              <Skeleton width="34%" height="14px" />
              <Skeleton width="100%" height="64px" />
            </div>
          </section>
        </div>
        <div className={styles.card}>
          <section>
            <div className={styles.skeletonStack}>
              <Skeleton width="38%" height="14px" />
              <Skeleton width="88%" height="24px" shape="pill" />
            </div>
          </section>
        </div>
      </div>
      <div className={styles.rail}>
        <section>
          <div className={styles.skeletonStack}>
            {["40%", "86%", "70%", "78%", "62%"].map((width, index) => (
              <Skeleton key={index} width={width} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
