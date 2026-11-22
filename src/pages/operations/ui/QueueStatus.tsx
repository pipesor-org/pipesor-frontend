import { useTranslation } from "react-i18next";

import { isApiError } from "../../../shared/api";
import { Button } from "../../../shared/ui/button";

import styles from "./OperationsPage.module.css";

/** Loading and failure states of a queue, with a retry and a safe error reference. */
export function QueueStatus({ status, error, onRetry }: { status: "loading" | "error"; error: unknown; onRetry: () => void }) {
  const { t } = useTranslation("operations");
  if (status === "loading") return <p className={styles.status} role="status">{t("queue.loading")}</p>;
  return (
    <div className={styles.failure} role="alert">
      <p>{t("queue.error")}</p>
      {isApiError(error) && error.correlationId && (
        <p className={styles.reference}>{t("queue.errorCode", { code: error.code ?? (error.kind === "http" ? String(error.status) : error.kind), reference: error.correlationId })}</p>
      )}
      <Button onClick={onRetry}>{t("queue.retry")}</Button>
    </div>
  );
}

/** "Load more" control for the next page of a queue. */
export function LoadMore({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) {
  const { t } = useTranslation("operations");
  return (
    <div className={styles.more}>
      <Button onClick={onClick} disabled={loading}>{loading ? t("queue.loadingMore") : label}</Button>
    </div>
  );
}
