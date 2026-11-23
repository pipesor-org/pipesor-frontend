import type { ReactNode } from "react";

import styles from "./StandalonePage.module.css";

/**
 * Frame for screens outside the app shell (sign-in, sign-in completion, not
 * found): one elevated card, centred over a quiet dotted canvas that fades out
 * toward the edges. The canvas is decorative and carries no content.
 */
export function StandalonePage({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.card}>{children}</div>
    </main>
  );
}
