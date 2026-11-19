import { useTranslation } from "react-i18next";

import {
  IncidentValidationStatus,
  STAGE_LABEL_KEY,
  STATUS_LABEL_KEY,
  isOperationallyResolved,
  type Incident,
} from "../../../entities/incident";
import { useFormatters } from "../../../shared/i18n";
import styles from "./IncidentWorkspace.module.css";

// Excerpts transcribed from the explicitly synthetic INC-1039 Paper artboard.
const paperEvidence = [
  ["09:12:03Z", "Build / Install dependencies", "npm WARN ERESOLVE overriding peer dependency"],
  ["09:12:04Z", "Build / Install dependencies", "npm ERR! ERESOLVE unable to resolve dependency tree"],
  ["09:12:05Z", "Build / Job result", "Error: Process completed with exit code 1."],
] as const;

export function FixtureIncident({ incident }: { incident: Incident }) {
  const { t } = useTranslation("operations");
  const { formatTimestamp, formatDuration, formatPreciseDuration } = useFormatters();
  const resolved = isOperationallyResolved(incident);
  const hasPaperEvidence = incident.id === "INC-1039";

  return (
    <div className={styles.columns}>
      <article className={styles.surface}>
        <section>
          <p className={styles.eyebrow}>{t("workspace.inference")}</p>
          <h2>{incident.diagnosis}</h2>
          {incident.diagnosisNote && <p>{incident.diagnosisNote}</p>}
        </section>
        <section>
          <h2>{t("workspace.evidence")}</h2>
          {hasPaperEvidence ? <>
            <p>{t("workspace.paperEvidence")}</p>
            <ul className={styles.evidence}>
              {paperEvidence.map(([time, stage, excerpt]) => (
                <li key={time}>
                  <small>{time} · {stage}</small>
                  <pre>{excerpt}</pre>
                </li>
              ))}
            </ul>
          </> : <p>{t("workspace.evidenceUnavailable")}</p>}
        </section>
        <section>
          <h2>{t("workspace.recommendation")}</h2>
          <p>{t(hasPaperEvidence ? "workspace.paperRecommendation" : "workspace.recommendationUnavailable")}</p>
        </section>
        {resolved && <section>
          <h2>{t("workspace.validation")}</h2>
          <IncidentValidationStatus status={incident.validationStatus} />
          <p>{t("workspace.fixtureReview")}</p>
        </section>}
      </article>
      <aside className={styles.rail} aria-label={t("workspace.details")}>
        <section>
          <h2>{t("workspace.details")}</h2>
          <dl>
            <div><dt>{t("filters.repository")}</dt><dd>{incident.repository}</dd></div>
            <div><dt>{t("workspace.workflow")}</dt><dd>{incident.workflow}</dd></div>
            <div><dt>{t("table.stage")}</dt><dd>{t(STAGE_LABEL_KEY[incident.stage])}</dd></div>
            <div><dt>{t("table.assignee")}</dt><dd>{incident.assignee ?? t("table.unassigned")}</dd></div>
          </dl>
        </section>
        <section>
          <h2>{t("workspace.timing")}</h2>
          <dl>
            {resolved ? <>
              <div><dt>{t("table.resolved")}</dt><dd>{formatTimestamp(incident.resolvedAt)}</dd></div>
              {incident.diagnosisDurationSeconds !== undefined &&
                <div><dt>{t("workspace.diagnosisTime")}</dt><dd>{formatPreciseDuration(incident.diagnosisDurationSeconds * 1000)}</dd></div>}
              {incident.resolutionDurationSeconds !== undefined &&
                <div><dt>{t("workspace.resolutionTime")}</dt><dd>{formatPreciseDuration(incident.resolutionDurationSeconds * 1000)}</dd></div>}
            </> : <div><dt>{t("table.elapsed")}</dt><dd>{formatDuration(incident.elapsedMinutes * 60_000)}</dd></div>}
          </dl>
        </section>
        <section>
          <h2>{t("workspace.timeline")}</h2>
          {resolved ? <p><time dateTime={incident.resolvedAt}>{formatTimestamp(incident.resolvedAt)}</time> · {t(STATUS_LABEL_KEY.Resolved)}</p>
            : <p>{t("workspace.timelineUnavailable")}</p>}
        </section>
      </aside>
    </div>
  );
}
