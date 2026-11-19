import { useTranslation } from "react-i18next";

import type { ReviewView } from "./diagnosticOutput";

export function ReviewHistory({ view }: { view: ReviewView }) {
  const { t } = useTranslation("operations");

  return (
    <>
      <h3>{t("diagnosticReview.history")}</h3>
      <ol>
        {view.history.map((entry) => (
          <li key={entry.id}>
            <strong>{t(`diagnosticReview.${entry.decision}`)}</strong> · {entry.reviewer} ·{" "}
            <time dateTime={entry.timestamp}>{entry.timestamp}</time>
            <p>{entry.comment}</p>
            {entry.actualCause && <p>{t("diagnosticReview.actualCause")}: {entry.actualCause}</p>}
            {entry.correctedRecommendation &&
              <p>{t("diagnosticReview.correctedRecommendation")}: {entry.correctedRecommendation}</p>}
          </li>
        ))}
      </ol>
    </>
  );
}
