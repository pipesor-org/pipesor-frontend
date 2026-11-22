import { useId, useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { fetchRepositories, fetchWorkflows } from "../../../entities/github-access";
import {
  OPERATIONAL_ENVIRONMENTS,
  PIPELINE_CRITICALITIES,
  PIPELINE_MONITORING_STATUSES,
  type OperationalEnvironment,
  type PipelineCriticality,
  type PipelineMonitoringStatus,
  type PipelineRecord,
} from "../../../entities/monitored-pipeline";
import { isApiError, useApiQuery } from "../../../shared/api";
import { githubAppInstallUrl } from "../../../shared/config";
import { Button } from "../../../shared/ui/button";

import { registerPipeline } from "../api/register";
import styles from "./RegisterWorkflowForm.module.css";

const TEAM_MAX = 120;

type ErrorKey = "duplicate" | "forbidden" | "invalid" | "network" | "generic";

function errorKey(error: unknown): ErrorKey {
  if (!isApiError(error)) return "generic";
  if (error.kind === "network") return "network";
  if (error.status === 409) return "duplicate";
  if (error.status === 403 || error.status === 404) return "forbidden";
  if (error.status === 400 || error.status === 422) return "invalid";
  return "generic";
}

/**
 * `onboard-monitored-workflow`: choose an existing GitHub Actions workflow
 * from the repositories the user can read through the Pipesor GitHub App, set
 * its operational policy and register it. Registration changes nothing in
 * GitHub; Pipeline re-verifies repository administration before committing.
 */
export function RegisterWorkflowForm({ onRegistered, cancel }: { onRegistered: (pipeline: PipelineRecord) => void; cancel: ReactNode }) {
  const { t } = useTranslation("pipelines");
  const ids = { repository: useId(), workflow: useId(), criticality: useId(), environment: useId(), team: useId(), error: useId() };
  const repositories = useApiQuery("github-repositories", (signal) => fetchRepositories(signal));
  const [repositoryId, setRepositoryId] = useState("");
  const workflows = useApiQuery(repositoryId ? `github-workflows:${repositoryId}` : null, (signal) => fetchWorkflows(repositoryId, signal));
  const [workflowId, setWorkflowId] = useState("");
  const [criticality, setCriticality] = useState<PipelineCriticality | "">("");
  const [environment, setEnvironment] = useState("");
  const [monitoring, setMonitoring] = useState<PipelineMonitoringStatus>("ACTIVE");
  const [team, setTeam] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<ErrorKey | null>(null);

  const repositoryList = repositories.state.status === "success" ? repositories.state.data : [];
  const repository = repositoryList.find((item) => item.repositoryId === repositoryId) ?? null;
  const workflowList = repositoryId && workflows.state.status === "success" ? workflows.state.data : [];
  const workflow = workflowList.find((item) => item.workflowId === workflowId) ?? null;
  const missing = { repository: !repository, workflow: !workflow, criticality: !criticality };
  const invalid = missing.repository || missing.workflow || missing.criticality || team.trim().length > TEAM_MAX;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (invalid || !repository || !workflow || !criticality) return;
    setSaving(true);
    setFailure(null);
    try {
      const pipeline = await registerPipeline({
        githubRepositoryId: repository.repositoryId,
        githubWorkflowId: workflow.workflowId,
        criticality,
        monitoringStatus: monitoring,
        environment: environment || undefined,
        responsibleTeamNameSnapshot: team.trim() || undefined,
      });
      onRegistered(pipeline);
    } catch (error) {
      setFailure(errorKey(error));
    } finally {
      setSaving(false);
    }
  }

  const required = <span aria-hidden="true"> *</span>;
  const fieldError = (show: boolean, id: string) =>
    show && submitted ? <p className={styles.error} id={id}>{t("onboarding.requiredError")}</p> : null;

  return (
    <form className={styles.surface} onSubmit={(event) => void submit(event)} noValidate>
      <section aria-labelledby={`${ids.repository}-title`}>
        <h2 id={`${ids.repository}-title`}>{t("onboarding.workflowTitle")}</h2>
        <p className={styles.note}>{t("onboarding.workflowDescription")}</p>

        {repositories.state.status === "loading" && <p className={styles.note} role="status">{t("onboarding.loadingRepositories")}</p>}
        {repositories.state.status === "error" && (
          <div className={styles.inline}>
            <p role="alert">{t("onboarding.repositoriesError")}</p>
            <Button onClick={repositories.reload}>{t("retry")}</Button>
          </div>
        )}
        {repositories.state.status === "success" && repositoryList.length === 0 && (
          <p className={styles.notice}>{t("onboarding.noRepositories")}</p>
        )}

        {repositoryList.length > 0 && (
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor={ids.repository}>{t("onboarding.repository")}{required}</label>
              <div className={styles.control}>
                <select
                  id={ids.repository}
                  value={repositoryId}
                  required
                  aria-invalid={submitted && missing.repository}
                  aria-describedby={submitted && missing.repository ? `${ids.repository}-error` : undefined}
                  onChange={(event) => { setRepositoryId(event.target.value); setWorkflowId(""); }}
                >
                  <option value="">{t("onboarding.selectRepository")}</option>
                  {repositoryList.map((item) => <option key={item.repositoryId} value={item.repositoryId}>{item.fullName}</option>)}
                </select>
                {fieldError(missing.repository, `${ids.repository}-error`)}
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor={ids.workflow}>{t("onboarding.workflow")}{required}</label>
              <div className={styles.control}>
                <select
                  id={ids.workflow}
                  value={workflowId}
                  required
                  disabled={!repositoryId || workflows.state.status !== "success"}
                  aria-invalid={submitted && missing.workflow}
                  aria-describedby={`${ids.workflow}-hint${submitted && missing.workflow ? ` ${ids.workflow}-error` : ""}`}
                  onChange={(event) => setWorkflowId(event.target.value)}
                >
                  <option value="">{t("onboarding.selectWorkflow")}</option>
                  {workflowList.map((item) => <option key={item.workflowId} value={item.workflowId}>{item.name}</option>)}
                </select>
                <p className={styles.note} id={`${ids.workflow}-hint`}>
                  {!repositoryId
                    ? t("onboarding.selectRepositoryFirst")
                    : workflows.state.status === "loading"
                      ? t("onboarding.loadingWorkflows")
                      : workflows.state.status === "error"
                        ? t("onboarding.workflowsError")
                        : workflowList.length === 0
                          ? t("onboarding.noWorkflows")
                          : ""}
                </p>
                {fieldError(missing.workflow, `${ids.workflow}-error`)}
              </div>
            </div>

            <dl className={styles.facts}>
              <div><dt>{t("identity.file")}</dt><dd className={styles.mono}>{workflow?.file ?? "—"}</dd></div>
              <div><dt>{t("identity.branch")}</dt><dd className={styles.mono}>{repository?.defaultBranch ?? "—"}</dd></div>
              <div><dt>{t("identity.provider")}</dt><dd>GitHub Actions</dd></div>
            </dl>
          </div>
        )}
        <p className={styles.note}>{t("onboarding.readOnly")}</p>
        {githubAppInstallUrl && (
          <a className={styles.link} href={githubAppInstallUrl} target="_blank" rel="noreferrer noopener">
            {t("onboarding.manageAccess")} ↗<span className={styles.srOnly}> {t("opensInNewTab")}</span>
          </a>
        )}
      </section>

      <section aria-labelledby={`${ids.criticality}-title`}>
        <h2 id={`${ids.criticality}-title`}>{t("policy.title")}</h2>
        <p className={styles.note}>{t("onboarding.policyDescription")}</p>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor={ids.criticality}>{t("policy.criticality")}{required}</label>
            <div className={styles.control}>
              <select
                id={ids.criticality}
                value={criticality}
                required
                aria-invalid={submitted && missing.criticality}
                aria-describedby={`${ids.criticality}-hint${submitted && missing.criticality ? ` ${ids.criticality}-error` : ""}`}
                onChange={(event) => setCriticality(event.target.value as PipelineCriticality | "")}
              >
                <option value="">{t("onboarding.selectCriticality")}</option>
                {PIPELINE_CRITICALITIES.map((value) => <option key={value} value={value}>{t(`criticality.${value}`)}</option>)}
              </select>
              <p className={styles.note} id={`${ids.criticality}-hint`}>{t("onboarding.criticalityHelp")}</p>
              {fieldError(missing.criticality, `${ids.criticality}-error`)}
            </div>
          </div>
          <div className={styles.field}>
            <label htmlFor={ids.environment}>{t("policy.environment")}</label>
            <div className={styles.control}>
              <select id={ids.environment} value={environment} aria-describedby={`${ids.environment}-hint`} onChange={(event) => setEnvironment(event.target.value)}>
                <option value="">{t("policy.unspecified")}</option>
                {OPERATIONAL_ENVIRONMENTS.map((value) => <option key={value} value={value}>{t(`environment.${value}`)}</option>)}
              </select>
              <p className={styles.note} id={`${ids.environment}-hint`}>{t("onboarding.environmentHelp")}</p>
            </div>
          </div>
          <fieldset className={styles.field}>
            <legend>{t("policy.monitoring")}{required}</legend>
            <div className={styles.control}>
              <div className={styles.segment}>
                {PIPELINE_MONITORING_STATUSES.map((value) => (
                  <label key={value}>
                    <input type="radio" name="monitoring" value={value} checked={monitoring === value} onChange={() => setMonitoring(value)} />
                    <span>{t(`monitoring.${value}`)}</span>
                  </label>
                ))}
              </div>
              <p className={styles.note}>{t("onboarding.monitoringHelp")}</p>
            </div>
          </fieldset>
        </div>
      </section>

      <section aria-labelledby={`${ids.team}-title`}>
        <h2 id={`${ids.team}-title`}>{t("ownership.title")}</h2>
        <div className={styles.fields}>
          <div className={styles.field}>
            <label htmlFor={ids.team}>{t("ownership.team")}</label>
            <div className={styles.control}>
              <input
                id={ids.team}
                type="text"
                value={team}
                maxLength={TEAM_MAX}
                autoComplete="off"
                aria-describedby={`${ids.team}-hint`}
                onChange={(event) => setTeam(event.target.value)}
              />
              <p className={styles.note} id={`${ids.team}-hint`}>{t("ownership.note")}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby={`${ids.error}-title`}>
        <h2 id={`${ids.error}-title`}>{t("onboarding.review")}</h2>
        <dl className={styles.review}>
          <div><dt>{t("onboarding.repository")}</dt><dd className={styles.mono}>{repository?.fullName ?? t("onboarding.notSelected")}</dd></div>
          <div><dt>{t("onboarding.workflow")}</dt><dd>{workflow?.name ?? t("onboarding.notSelected")}</dd></div>
          <div><dt>{t("policy.criticality")}</dt><dd>{criticality ? t(`criticality.${criticality}`) : t("onboarding.notSelected")}</dd></div>
          <div><dt>{t("policy.environment")}</dt><dd>{environment ? t(`environment.${environment as OperationalEnvironment}`) : t("policy.unspecified")}</dd></div>
          <div><dt>{t("policy.monitoring")}</dt><dd>{t(`monitoring.${monitoring}`)}</dd></div>
          <div><dt>{t("ownership.team")}</dt><dd>{team.trim() || t("ownership.unspecified")}</dd></div>
        </dl>
        {failure && <p className={styles.error} id={ids.error} role="alert">{t(`onboarding.errors.${failure}`)}</p>}
        <div className={styles.actions}>
          <p className={styles.note}>{t("onboarding.registersOnly")}</p>
          <div className={styles.buttons}>
            {cancel}
            <Button type="submit" variant="primary" disabled={saving}>{saving ? t("onboarding.saving") : t("inventory.add")}</Button>
          </div>
        </div>
      </section>
    </form>
  );
}
