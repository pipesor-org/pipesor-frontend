import { useTranslation } from "react-i18next";

import { isApiError } from "../../../shared/api";
import { Button } from "../../../shared/ui/button";
import { TableSkeleton } from "../../../shared/ui/data-table";
import { Notice } from "../../../shared/ui/notice";

import styles from "./QueueStatus.module.css";

/** Loading and failure states of a queue, with a retry and a safe error reference. */
export function QueueStatus({ status, error, onRetry }: { status: "idle" | "loading" | "error"; error: unknown; onRetry: () => void }) {
  const { t } = useTranslation("operations");
  if (status !== "error") {
    return (
      <div className={styles.loading} role="status">
        <span className={styles.srOnly}>{t("queue.loading")}</span>
        <TableSkeleton />
      </div>
    );
  }
  return (
    <Notice tone="critical" role="alert" className={styles.failure}>
      <p>{t("queue.error")}</p>
      {isApiError(error) && error.correlationId && (
        <p className={styles.reference}>{t("queue.errorCode", { code: error.code ?? (error.kind === "http" ? String(error.status) : error.kind), reference: error.correlationId })}</p>
      )}
      <Button size="sm" onClick={onRetry}>{t("queue.retry")}</Button>
    </Notice>
  );
}

/** "Load more" control for the next page of a queue. */
export function LoadMore({ label, loading, onClick }: { label: string; loading: boolean; onClick: () => void }) {
  const { t } = useTranslation("operations");
  return (
    <div className={styles.more}>
      <Button onClick={onClick} disabled={loading} loading={loading}>{loading ? t("queue.loadingMore") : label}</Button>
    </div>
  );
}
