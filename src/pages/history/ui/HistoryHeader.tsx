import { useTranslation } from "react-i18next";

import { PageHeader } from "../../../shared/ui/page-header";

/**
 * History workspace header. Page-local because it is a purely presentational
 * section rather than a reusable widget.
 */
export function HistoryHeader() {
  const { t } = useTranslation("history");

  return <PageHeader title={t("title")} subtitle={t("subtitle")} />;
}
