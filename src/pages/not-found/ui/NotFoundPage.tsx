import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  DEFAULT_OPERATIONS_QUEUE,
  operationsQueuePath,
} from "../../../shared/config";

import styles from "./NotFoundPage.module.css";

/**
 * Fallback screen for unknown routes.
 *
 * Replaces the previous silent redirect to Active Incidents so that an
 * unmatched URL is visibly distinguishable from `/`, while still giving the
 * user a way back into the approved Operations flow.
 */
export function NotFoundPage() {
  const { t } = useTranslation("common");

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>{t("notFound.title")}</h1>
        <p className={styles.text}>{t("notFound.text")}</p>
        <Link
          className={styles.link}
          to={operationsQueuePath(DEFAULT_OPERATIONS_QUEUE)}
        >
          {t("notFound.backToOperations")}
        </Link>
      </div>
    </main>
  );
}
