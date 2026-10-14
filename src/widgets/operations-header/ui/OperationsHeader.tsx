import { useTranslation } from "react-i18next";

import { Badge } from "../../../shared/ui/badge";

import styles from "./OperationsHeader.module.css";

interface OperationsHeaderProps {
  /** Screen-specific description shown under the "Operations" title. */
  subtitle: string;
}

export function OperationsHeader({ subtitle }: OperationsHeaderProps) {
  const { t } = useTranslation("operations");

  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <Badge variant="outline">{t("demoBadge")}</Badge>
    </header>
  );
}
