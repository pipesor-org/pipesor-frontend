import { useTranslation } from "react-i18next";

import { PageHeader } from "../../../shared/ui/page-header";

interface OperationsHeaderProps {
  /** Screen-specific description shown under the "Operations" title. */
  subtitle: string;
}

export function OperationsHeader({ subtitle }: OperationsHeaderProps) {
  const { t } = useTranslation("operations");

  return <PageHeader title={t("title")} subtitle={subtitle} />;
}
