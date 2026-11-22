import { useTranslation } from "react-i18next";

import styles from "./HistoryHeader.module.css";

/**
 * History workspace header. Page-local because it is a purely presentational
 * section rather than a reusable widget.
 */
export function HistoryHeader() {
  const { t } = useTranslation("history");

  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
      </div>
    </header>
  );
}
