import { useTranslation } from "react-i18next";

import type { Diagnosis } from "../../../entities/diagnosis";
import { STAGE_LABEL_KEY, githubCommitUrl, githubRunUrl, incidentLabel } from "../../../entities/incident";
import { pipelineWorkflowLabel } from "../../../entities/monitored-pipeline";
import { useFormatters } from "../../../shared/i18n";
import { durationMs } from "../../../shared/lib";

import type { WorkspaceData } from "../model/loadWorkspace";
import styles from "./IncidentWorkspace.module.css";

interface DetailsRailProps {
  data: WorkspaceData;
  diagnosis: Diagnosis | null;
  now: number;
}

/** Context rail: run identity, ownership, timing and a timeline built from recorded timestamps only. */
export function DetailsRail({ data, diagnosis, now }: DetailsRailProps) {
  const { t } = useTranslation("operations");
  const { formatTimestamp, formatPreciseDuration } = useFormatters();
  const { incident, pipeline, origin } = data;
  const unavailable = <span className={styles.muted}>{t("workspace.details.unavailable")}</span>;
  const runUrl = pipeline && origin ? githubRunUrl(pipeline.fullName, origin) : null;
  const commitUrl = pipeline && origin?.commitSha ? githubCommitUrl(pipeline.fullName, origin.commitSha) : null;
  const newTab = <span className={styles.srOnly}> {t("workspace.opensInNewTab")}</span>;

  const timeline = [
    { key: "detected", at: incident.detectedAt },
    { key: "diagnosisReady", at: diagnosis?.createdAt ?? null },
    { key: "remediationStarted", at: incident.remediationStartedAt },
    { key: "verificationStarted", at: incident.verificationStartedAt },
    { key: "resolved", at: incident.resolvedAt },
  ]
    .filter((entry): entry is { key: string; at: string } => entry.at !== null)
    .sort((a, b) => a.at.localeCompare(b.at));

  return (
    <aside className={styles.rail} aria-label={t("workspace.details.title")}>
      <section>
        <h2>{t("workspace.details.title")}</h2>
        <dl>
          <div><dt>{t("workspace.details.incident")}</dt><dd className={styles.mono}>{incidentLabel(incident)}</dd></div>
          <div><dt>{t("workspace.details.repository")}</dt><dd className={styles.mono}>{pipeline?.fullName ?? unavailable}</dd></div>
          <div><dt>{t("workspace.details.workflow")}</dt><dd>{(pipeline && pipelineWorkflowLabel(pipeline)) ?? unavailable}</dd></div>
          <div><dt>{t("workspace.details.stage")}</dt><dd>{t(STAGE_LABEL_KEY[incident.stage])}</dd></div>
          <div>
            <dt>{t("workspace.details.run")}</dt>
            <dd className={styles.mono}>
              {origin ? (
                runUrl ? (
                  <a href={runUrl} target="_blank" rel="noreferrer noopener">#{origin.githubRunId} ↗{newTab}</a>
                ) : `#${origin.githubRunId}`
              ) : unavailable}
              {origin && origin.runAttempt > 1 && <span className={styles.muted}> · {t("workspace.attempt", { attempt: origin.runAttempt })}</span>}
            </dd>
          </div>
          {origin?.branch && <div><dt>{t("workspace.details.branch")}</dt><dd className={styles.mono}>{origin.branch}</dd></div>}
          {origin?.commitSha && (
            <div>
              <dt>{t("workspace.details.commit")}</dt>
              <dd className={styles.mono}>
                {commitUrl ? <a href={commitUrl} target="_blank" rel="noreferrer noopener">{origin.commitSha.slice(0, 7)} ↗{newTab}</a> : origin.commitSha.slice(0, 7)}
              </dd>
            </div>
          )}
        </dl>
      </section>

      {pipeline?.responsibleTeamNameSnapshot && (
        <section>
          <h2>{t("workspace.ownership.title")}</h2>
          <dl>
            <div><dt>{t("workspace.ownership.team")}</dt><dd>{pipeline.responsibleTeamNameSnapshot}</dd></div>
          </dl>
        </section>
      )}

      <section>
        <h2>{t("workspace.timing.title")}</h2>
        <dl>
          <div><dt>{t("workspace.timing.detected")}</dt><dd><time dateTime={incident.detectedAt}>{formatTimestamp(incident.detectedAt)}</time></dd></div>
          {diagnosis && (
            <div><dt>{t("workspace.timing.timeToDiagnosis")}</dt><dd className={styles.mono}>{formatPreciseDuration(durationMs(incident.detectedAt, diagnosis.createdAt))}</dd></div>
          )}
          {incident.resolvedAt ? (
            <div><dt>{t("workspace.timing.timeToResolution")}</dt><dd className={styles.mono}>{formatPreciseDuration(durationMs(incident.detectedAt, incident.resolvedAt))}</dd></div>
          ) : (
            <div><dt>{t("workspace.timing.elapsed")}</dt><dd className={styles.mono}>{formatPreciseDuration(Math.max(0, now - Date.parse(incident.detectedAt)))}</dd></div>
          )}
        </dl>
      </section>

      <section>
        <h2>{t("workspace.timeline.title")}</h2>
        <ol className={styles.timeline}>
          {timeline.map((entry) => (
            <li key={entry.key}>
              <time dateTime={entry.at}>{formatTimestamp(entry.at)}</time>
              <span>{t(`workspace.timeline.${entry.key as "detected"}`)}</span>
            </li>
          ))}
        </ol>
      </section>
    </aside>
  );
}
