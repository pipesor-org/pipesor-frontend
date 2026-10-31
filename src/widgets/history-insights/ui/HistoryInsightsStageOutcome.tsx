import { useTranslation } from "react-i18next";

import {
  STAGE_LABEL_KEY,
  selectInsightsSummary,
  selectStageDistribution,
} from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";

import styles from "./HistoryInsightsStageOutcome.module.css";

/**
 * Stage concentration and diagnosis outcomes.
 *
 * Both panels read the same resolved-incident population as the rest of
 * Insights. Stage labels reuse the entity's canonical translation map (the same
 * vocabulary as the incident tables), and outcome labels reuse the domain
 * validation status copy; only the section titles are new.
 *
 * The bars are decorative: every stage row states its count in text, and the
 * outcome rows state `count · percent`, so no value is conveyed by bar length or
 * colour alone. A population without stage data or validated diagnoses renders
 * an explicit no-data message instead of an empty or zero-valued graphic.
 */
export function HistoryInsightsStageOutcome() {
  const { t } = useTranslation("history");
  const { t: tOperations } = useTranslation("operations");
  const { formatNumber, formatPercent } = useFormatters();

  const stages = selectStageDistribution();
  const summary = selectInsightsSummary();

  const validated = summary.confirmed + summary.rejected;
  const maxCount = stages[0]?.count ?? 0;

  return (
    <div className={styles.section}>
      <div className={styles.panels}>
        <section className={styles.stages}>
          <div className={styles.header}>
            <h2 className={styles.title}>{t("insights.stage.title")}</h2>
            <p className={styles.caption}>{t("insights.stage.caption")}</p>
          </div>

          {stages.length === 0 ? (
            <p className={styles.noData}>{t("insights.summary.noData")}</p>
          ) : (
            <ul className={styles.stageList}>
              {stages.map(({ stage, count }) => (
                <li key={stage} className={styles.stageRow}>
                  <span className={styles.stageLabel}>
                    {tOperations(STAGE_LABEL_KEY[stage])}
                  </span>
                  <span className={styles.track} aria-hidden="true">
                    <span
                      className={styles.fill}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </span>
                  <span className={styles.stageCount}>
                    {formatNumber(count)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.outcome}>
          <h2 className={styles.title}>{t("insights.outcome.title")}</h2>
          <p className={styles.subtitle}>
            {t("insights.outcome.validated", {
              count: validated,
              countFormatted: formatNumber(validated),
            })}
          </p>

          {validated === 0 ? (
            <p className={styles.noData}>{t("insights.summary.noData")}</p>
          ) : (
            <>
              <div className={styles.barBlock}>
                <div className={styles.bar} aria-hidden="true">
                  <span
                    className={styles.confirmedSegment}
                    style={{ width: `${(summary.confirmed / validated) * 100}%` }}
                  />
                  <span
                    className={styles.rejectedSegment}
                    style={{ width: `${(summary.rejected / validated) * 100}%` }}
                  />
                </div>
              </div>

              <dl className={styles.rows}>
                <div className={`${styles.row} ${styles.confirmedRow}`}>
                  <dt className={styles.legend}>
                    <span
                      className={`${styles.dot} ${styles.confirmedDot}`}
                      aria-hidden="true"
                    />
                    {tOperations("validationStatus.confirmed")}
                  </dt>
                  <dd className={styles.value}>
                    {t("insights.outcome.value", {
                      incidents: formatNumber(summary.confirmed),
                      percent: formatPercent(summary.confirmed / validated),
                    })}
                  </dd>
                </div>
                <div className={`${styles.row} ${styles.rejectedRow}`}>
                  <dt className={styles.legend}>
                    <span
                      className={`${styles.dot} ${styles.rejectedDot}`}
                      aria-hidden="true"
                    />
                    {tOperations("validationStatus.rejected")}
                  </dt>
                  <dd className={styles.value}>
                    {t("insights.outcome.value", {
                      incidents: formatNumber(summary.rejected),
                      percent: formatPercent(summary.rejected / validated),
                    })}
                  </dd>
                </div>
              </dl>

              <p className={styles.note}>{t("insights.outcome.note")}</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
