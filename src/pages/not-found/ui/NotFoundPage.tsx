import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import {
  DEFAULT_OPERATIONS_QUEUE,
  operationsQueuePath,
} from "../../../shared/config";
import { buttonClassName } from "../../../shared/ui/button";
import { StandalonePage } from "../../../shared/ui/standalone-page";

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
    <StandalonePage>
      <div className={styles.heading}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>{t("notFound.title")}</h1>
        <p className={styles.text}>{t("notFound.text")}</p>
      </div>
      <Link className={buttonClassName({ variant: "primary" })} to={operationsQueuePath(DEFAULT_OPERATIONS_QUEUE)}>
        {t("notFound.backToOperations")}
      </Link>
    </StandalonePage>
  );
}
