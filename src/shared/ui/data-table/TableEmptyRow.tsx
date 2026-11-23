import type { ReactNode } from "react";

import styles from "./DataTable.module.css";

interface TableEmptyRowProps {
  colSpan: number;
  title?: ReactNode;
  text?: ReactNode;
  /** Decorative icon above the title. */
  icon?: ReactNode;
  /** `success` for a reassuring empty state ("nothing needs attention"). */
  tone?: "neutral" | "success";
  /** A next step, such as the action that fills the table. */
  action?: ReactNode;
}

/** The single row a data table shows when it has nothing to list. */
export function TableEmptyRow({ colSpan, title, text, icon, tone = "neutral", action }: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className={styles.empty}>
        <div className={styles.emptyBody}>
          {icon ? <span className={`${styles.emptyIcon} ${styles[tone]}`} aria-hidden="true">{icon}</span> : null}
          {title ? <span className={styles.emptyTitle}>{title}</span> : null}
          {text ? <span className={styles.emptyText}>{text}</span> : null}
          {action ? <span className={styles.emptyAction}>{action}</span> : null}
        </div>
      </td>
    </tr>
  );
}
