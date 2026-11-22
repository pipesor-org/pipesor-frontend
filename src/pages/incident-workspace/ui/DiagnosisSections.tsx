import { useTranslation } from "react-i18next";

import type { Diagnosis } from "../../../entities/diagnosis";
import { useFormatters } from "../../../shared/i18n";

import { EvidenceItem } from "./EvidenceItem";
import styles from "./IncidentWorkspace.module.css";

/**
 * The diagnosis read in three explicitly labelled kinds of content — model
 * inference, observed evidence and retrieved knowledge — followed by the
 * recommendation.
 */
export function DiagnosisSections({ diagnosis }: { diagnosis: Diagnosis }) {
  const { t } = useTranslation("operations");
  const { formatTimestamp } = useFormatters();
  const { hypothesis } = diagnosis;
  const citedEvidence = new Set(hypothesis.evidenceIds);
  const citedChunks = new Set(hypothesis.chunkIds);
  const model = [diagnosis.model?.deployment, diagnosis.model?.modelVersion].filter(Boolean).join(" · ");

  return (
    <>
      <section>
        <p className={styles.eyebrow}>{t("workspace.inference.eyebrow")}</p>
        <p className={styles.label}>{t("workspace.inference.probableCause")}</p>
        <p className={styles.cause}>{hypothesis.probableCause}</p>
        {hypothesis.limitations && (
          <>
            <p className={styles.label}>{t("workspace.inference.limitations")}</p>
            <p>{hypothesis.limitations}</p>
          </>
        )}
        <p className={styles.footnote}>
          {t("workspace.inference.version", { version: diagnosis.version, time: formatTimestamp(diagnosis.createdAt) })}
          {model && <> · {t("workspace.inference.model", { model })}</>}
        </p>
      </section>

      <section>
        <div className={styles.sectionHead}>
          <h2>{t("workspace.evidence.title")}</h2>
          <span className={styles.muted}>{t("workspace.evidence.count", { count: diagnosis.evidence.length })}</span>
        </div>
        <p className={styles.muted}>{t("workspace.evidence.note")}</p>
        {diagnosis.evidence.length > 0 ? (
          <ul className={styles.evidence}>
            {diagnosis.evidence.map((item) => (
              <EvidenceItem key={item.evidenceId} evidence={item} cited={citedEvidence.has(item.evidenceId)} />
            ))}
          </ul>
        ) : (
          <p>{t("workspace.evidence.empty")}</p>
        )}
      </section>

      <section>
        <h2>{t("workspace.sources.title")}</h2>
        <p className={styles.muted}>{t("workspace.sources.note")}</p>
        {diagnosis.sources.length > 0 ? (
          <ul className={styles.sources}>
            {diagnosis.sources.map((source) => (
              <li key={source.chunkId}>
                <span>{source.provenance?.trim() || t("workspace.sources.unnamed")}</span>
                {citedChunks.has(source.chunkId) && <span className={styles.tag}>{t("workspace.sources.cited")}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p>{t("workspace.sources.empty")}</p>
        )}
      </section>

      <section>
        <h2>{t("workspace.recommendation.title")}</h2>
        <p className={styles.eyebrow}>{t("workspace.inference.eyebrow")}</p>
        <p>{hypothesis.recommendation?.trim() || t("workspace.recommendation.empty")}</p>
        <p className={styles.footnote}>{t("workspace.recommendation.note")}</p>
      </section>

    </>
  );
}
