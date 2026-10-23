import { useEffect, useRef, useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { DEMO_OPERATIONAL_ENVIRONMENTS, PIPELINE_CRITICALITIES, PIPELINE_MONITORING_STATUSES } from "../../../entities/monitored-pipeline";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Badge } from "../../../shared/ui/badge";
import { AppSidebar } from "../../../widgets/app-sidebar";

import { availableWorkflows, changeRepository, createEmptyDraft, demoOwners, demoRepositories, demoTeams, selectedWorkflow, validateDraft, type DraftField } from "../model/draft";
import styles from "./AddMonitoredWorkflowPage.module.css";

type SelectFieldProps = ComponentProps<"select"> & {
  id: string; label: string; placeholder: string; choices: readonly (readonly [string, string])[];
  error?: string; hint?: string; compact?: boolean;
};

function SelectField({ label, placeholder, choices, error, hint, compact, ...props }: SelectFieldProps) {
  const describedBy = [hint && `${props.id}-hint`, error && `${props.id}-error`].filter(Boolean).join(" ");
  return <div className={styles.field}>
    <label htmlFor={props.id}>{label}{props.required && <span aria-hidden="true"> *</span>}</label>
    <div className={compact ? styles.compact : styles.control}>
      <select {...props} aria-invalid={Boolean(error)} aria-describedby={describedBy || undefined}>
        <option value="">{placeholder}</option>
        {choices.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
      {hint && <p className={styles.note} id={`${props.id}-hint`}>{hint}</p>}
      {error && <p className={styles.error} id={`${props.id}-error`}>{error}</p>}
    </div>
  </div>;
}

export function AddMonitoredWorkflowPage({ backTo }: { backTo: string }) {
  const { t } = useTranslation("pipelines");
  const [draft, setDraft] = useState(createEmptyDraft);
  const [touched, setTouched] = useState<Partial<Record<DraftField, boolean>>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const ownerRef = useRef<HTMLSelectElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  const workflow = selectedWorkflow(draft);
  const errors = validateDraft(draft);
  const criticality = PIPELINE_CRITICALITIES.find((value) => value === draft.criticality);
  const monitoring = PIPELINE_MONITORING_STATUSES.find((value) => value === draft.monitoringStatus);
  const environment = DEMO_OPERATIONAL_ENVIRONMENTS.find((value) => value === draft.operationalEnvironment);

  function fieldProps(field: DraftField) {
    return {
      id: `add-${field}`, value: draft[field],
      onBlur: () => setTouched((previous) => ({ ...previous, [field]: true })),
      error: touched[field] && errors[field]
        ? t(errors[field] === "required" ? "onboarding.requiredError" : "onboarding.invalidError") : undefined,
    };
  }
  function setValue(field: Exclude<DraftField, "pipelineOwners">, value: string) {
    setDraft((previous) => ({ ...previous, [field]: value }));
  }
  const notSelected = t("onboarding.notSelected");
  const review = [
    [t("identity.repository"), draft.repository || notSelected],
    [t("identity.workflow"), workflow?.workflowName || notSelected],
    [t("policy.criticality"), criticality ? t(`criticality.${criticality}`) : notSelected],
    [t("policy.environment"), environment ? t(`environment.${environment}`) : t("policy.unspecified")],
    [t("policy.monitoring"), monitoring ? t(`monitoring.${monitoring}`) : notSelected],
    [t("ownership.team"), draft.responsibleTeam || notSelected],
  ];

  return <AppLayout sidebar={<AppSidebar />}>
    <div className={styles.context}>
      <Link className={styles.backLink} to={backTo}>{t("backToPipelines")}</Link>
      <Badge variant="outline">{t("demoBadge")}</Badge>
    </div>
    <header className={styles.header}>
      <h1 ref={headingRef} tabIndex={-1}>{t("onboarding.title")}</h1>
      <p>{t("onboarding.subtitle")}</p>
    </header>
    <form className={styles.surface} noValidate onSubmit={(event) => event.preventDefault()}>
      <section aria-labelledby="add-github">
        <div className={styles.sectionHeading}><h2 id="add-github">{t("onboarding.workflowTitle")}</h2>
          <span className={styles.note}>{t("onboarding.synthetic")}</span></div>
        <p className={styles.note}>{t("onboarding.workflowDescription")}</p>
        <p className={styles.note}>{t("onboarding.readOnly")}</p>
        <SelectField {...fieldProps("repository")} label={t("identity.repository")} required
          placeholder={t("onboarding.selectRepository")} choices={demoRepositories.map((value) => [value, value])}
          onChange={(event) => {
            const repository = event.target.value;
            setDraft((previous) => changeRepository(previous, repository));
            setTouched((previous) => ({ ...previous, workflowPath: false }));
          }} />
        <SelectField {...fieldProps("workflowPath")} label={t("identity.workflow")} required disabled={!draft.repository}
          placeholder={t("onboarding.selectWorkflow")} choices={availableWorkflows(draft.repository).map((value) => [value.workflowPath, value.workflowName])}
          hint={!draft.repository ? t("onboarding.selectRepositoryFirst") : undefined}
          onChange={(event) => setValue("workflowPath", event.target.value)} />
        <div className={styles.field}><label htmlFor="add-workflow-file">{t("identity.file")}</label>
          <output id="add-workflow-file" className={styles.technical}>{workflow?.workflowPath || t("onboarding.selectWorkflowFirst")}</output></div>
        <div className={styles.field}><label htmlFor="add-default-branch">{t("identity.branch")}</label>
          <output id="add-default-branch" className={styles.technical}>{workflow?.defaultBranch || t("onboarding.selectWorkflowFirst")}</output></div>
        <div className={styles.field}><span className={styles.label}>{t("identity.provider")}</span><span>GitHub Actions</span></div>
        <p className={styles.note}>{t("onboarding.requiredFields")}</p>
      </section>
      <section aria-labelledby="add-policy">
        <h2 id="add-policy">{t("policy.title")}</h2>
        <p className={styles.note}>{t("onboarding.policyDescription")}</p>
        <SelectField {...fieldProps("criticality")} label={t("policy.criticality")} required compact
          placeholder={t("onboarding.selectCriticality")} choices={PIPELINE_CRITICALITIES.map((value) => [value, t(`criticality.${value}`)])}
          hint={t("onboarding.criticalityHelp")} onChange={(event) => setValue("criticality", event.target.value)} />
        <SelectField {...fieldProps("operationalEnvironment")} label={t("policy.environment")} compact
          placeholder={t("policy.unspecified")} choices={DEMO_OPERATIONAL_ENVIRONMENTS.map((value) => [value, t(`environment.${value}`)])}
          hint={t("onboarding.environmentHelp")} onChange={(event) => setValue("operationalEnvironment", event.target.value)} />
        <div className={styles.field}>
          <span className={styles.label} id="add-monitoring-label">{t("policy.monitoring")}<span aria-hidden="true"> *</span></span>
          <div className={styles.compact}>
            <div className={styles.segmented} role="radiogroup" aria-labelledby="add-monitoring-label" aria-required="true"
              aria-invalid={Boolean(fieldProps("monitoringStatus").error)} aria-describedby="add-monitoring-hint">
              {PIPELINE_MONITORING_STATUSES.map((value) => <label className={styles.segment} key={value}>
                <input type="radio" name="monitoringStatus" value={value} required checked={draft.monitoringStatus === value}
                  onChange={() => setValue("monitoringStatus", value)} onBlur={fieldProps("monitoringStatus").onBlur}
                  aria-invalid={Boolean(fieldProps("monitoringStatus").error)}
                  aria-describedby={`add-monitoring-hint${fieldProps("monitoringStatus").error ? " add-monitoring-error" : ""}`} />
                <span>{t(`monitoring.${value}`)}</span>
              </label>)}
            </div>
            <p className={styles.note} id="add-monitoring-hint">{t("onboarding.monitoringHelp")}</p>
            {fieldProps("monitoringStatus").error && <p className={styles.error} id="add-monitoring-error">{fieldProps("monitoringStatus").error}</p>}
          </div>
        </div>
      </section>
      <section aria-labelledby="add-ownership">
        <h2 id="add-ownership">{t("ownership.title")}</h2>
        <p className={styles.note}>{t("onboarding.ownershipDescription")}</p>
        <SelectField {...fieldProps("responsibleTeam")} label={t("ownership.team")} required
          placeholder={t("onboarding.selectTeam")} choices={demoTeams.map((value) => [value, value])}
          onChange={(event) => setValue("responsibleTeam", event.target.value)} />
        <div className={styles.field}>
          <label htmlFor="add-owners">{t("ownership.owners")}</label>
          <div className={styles.control}>
            <select ref={ownerRef} id="add-owners" value="" aria-describedby="add-owners-hint"
              onChange={(event) => {
                const owner = event.target.value;
                if (demoOwners.includes(owner)) {
                  setDraft((previous) => previous.pipelineOwners.includes(owner) ? previous
                    : { ...previous, pipelineOwners: [...previous.pipelineOwners, owner] });
                }
              }}>
              <option value="">{t("onboarding.addOwner")}</option>
              {demoOwners.filter((owner) => !draft.pipelineOwners.includes(owner)).map((owner) => <option key={owner} value={owner}>{owner}</option>)}
            </select>
            {draft.pipelineOwners.length > 0 && <ul className={styles.owners}>{draft.pipelineOwners.map((owner) => (
              <li key={owner}><span>{owner}</span><button type="button" aria-label={t("onboarding.removeOwner", { owner })}
                onClick={() => {
                  ownerRef.current?.focus();
                  setDraft((previous) => ({ ...previous, pipelineOwners: previous.pipelineOwners.filter((value) => value !== owner) }));
                }}>×</button></li>
            ))}</ul>}
            <p className={styles.note} id="add-owners-hint">{t("onboarding.demoOwnership")}</p>
          </div>
        </div>
        <p className={styles.note}>{t("ownership.note")}</p>
      </section>
      <section aria-labelledby="add-review">
        <h2 id="add-review">{t("onboarding.review")}</h2>
        <dl className={styles.review}>
          {review.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          <div className={styles.reviewOwners}><dt>{t("ownership.owners")}</dt><dd>{draft.pipelineOwners.join(" · ") || t("ownership.unspecified")}</dd></div>
        </dl>
        <p className={styles.note} role="status">{t(Object.keys(errors).length ? "onboarding.incomplete" : "onboarding.complete")}</p>
        <footer className={styles.footer}>
          <p className={styles.note} id="registration-api-unavailable">{t("onboarding.apiUnavailable")}</p>
          <div className={styles.actions}>
            <Link className={styles.cancel} to={backTo}>{t("onboarding.cancel")}</Link>
            <button type="submit" disabled aria-describedby="registration-api-unavailable">{t("inventory.add")}</button>
          </div>
        </footer>
      </section>
    </form>
  </AppLayout>;
}
