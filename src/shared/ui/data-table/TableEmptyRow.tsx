import type { ReactNode } from "react";

import styles from "./DataTable.module.css";

/** The single row a data table shows when it has nothing to list. */
export function TableEmptyRow({ colSpan, title, text }: { colSpan: number; title?: ReactNode; text?: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className={styles.empty}>
        <div className={styles.emptyBody}>
          {title ? <span className={styles.emptyTitle}>{title}</span> : null}
          {text ? <span className={styles.emptyText}>{text}</span> : null}
        </div>
      </td>
    </tr>
  );
}
