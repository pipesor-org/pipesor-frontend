import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PIPELINE_CRITICALITIES, PIPELINE_MONITORING_STATUSES, pilotError, savePilotPolicy, type MonitoredPipeline, type PersistedPipeline } from "../../../entities/monitored-pipeline";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Badge } from "../../../shared/ui/badge";
import { AppSidebar } from "../../../widgets/app-sidebar";

import styles from "./PipelineDetailPage.module.css";

function DetailFields({ fields }: { fields: readonly (readonly [string, ReactNode])[] }) {
  return <dl className={styles.fields}>{fields.map(([label, value]) => (
    <div className={styles.row} key={label}><dt>{label}</dt><dd>{value}</dd></div>
  ))}</dl>;
}

export function PipelineDetailPage({ pipeline: original, backTo, token }: {
  pipeline: MonitoredPipeline | PersistedPipeline; backTo: string; token?: string;
}) {
  const { t } = useTranslation("pipelines");
  const [saved, setSaved] = useState<PersistedPipeline>();
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState<ReturnType<typeof pilotError>>();
  const pipeline = saved ?? original;
  const { github, policy, ownership } = pipeline;
  const persisted = "capabilities" in pipeline ? pipeline : undefined;
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, [pipeline.id]);
  const capabilityExamples = [
    ["Platform Engineering", t("access.operate"), t("access.operateDescription")],
    ["QA Team", t("access.view"), t("access.viewDescription")],
    [t("access.lead"), t("access.view"), t("access.viewDescription")],
    [t("access.administrators"), t("access.configure"), t("access.configureDescription")],
  ];

  return (
    <AppLayout sidebar={<AppSidebar />}>
      <div className={styles.context}>
        <Link className={styles.backLink} to={backTo}>{t("backToPipelines")}</Link>
        <Badge variant="outline">{t(persisted ? "pilot.badge" : "demoBadge")}</Badge>
      </div>
      <header className={styles.header}>
        <h1 ref={headingRef} tabIndex={-1}>{failure ? t("inventory.title") : pipeline.slug}</h1>
        {!failure && <p className={styles.metadata}><span>{github.repository}</span><span>GitHub Actions</span></p>}
        <p className={styles.note}>{t(persisted ? "pilot.synthetic" : "demoContext")}</p>
      </header>
      {failure ? <p role="alert">{t(`pilot.${failure}`)}</p> : <div className={styles.surface}>
        <section className={styles.identity} aria-labelledby="pipeline-identity">
          <h2 id="pipeline-identity">{t("identity.title")}</h2>
          <p className={styles.note}>{t("identity.description")}</p>
          <DetailFields fields={[
            [t("identity.repository"), github.repository],
            [t("identity.workflow"), github.workflowName],
            [t("identity.file"), github.workflowPath],
            [t("identity.branch"), github.defaultBranch || t("policy.unspecified")],
            [t("identity.provider"), "GitHub Actions"],
          ]} />
          <p className={styles.note}>{t("identity.linksUnavailable")}</p>
        </section>
        <section aria-labelledby="pipeline-policy">
          <h2 id="pipeline-policy">{t("policy.title")}</h2>
          <DetailFields fields={[
            [t("policy.criticality"), t(`criticality.${policy.criticality}`)],
            [t("policy.monitoring"), t(`monitoring.${policy.monitoringStatus}`)],
            [t("policy.environment"), persisted ? persisted.environment ?? t("policy.unspecified")
              : "operationalEnvironment" in policy && policy.operationalEnvironment
                ? t(`environment.${policy.operationalEnvironment}`) : t("policy.unspecified")],
          ]} />
          {token && persisted?.capabilities.includes("CONFIGURE") && !failure && <form onSubmit={async (event) => {
            event.preventDefault();
            const fields = new FormData(event.currentTarget);
            setSaving(true);
            try {
              setSaved(await savePilotPolicy(token, persisted.id, {
                criticality: fields.get("criticality"),
                monitoringStatus: fields.get("monitoringStatus"),
                environment: persisted.environment,
              }));
            } catch (error) {
              setFailure(pilotError(error));
            } finally {
              setSaving(false);
            }
          }}>
            <fieldset className={styles.editPolicy} disabled={saving}>
              <legend>{t("pilot.editPolicy")}</legend>
              <label>{t("policy.criticality")} <select name="criticality" defaultValue={policy.criticality.toUpperCase()}>
                {PIPELINE_CRITICALITIES.map((value) => <option key={value} value={value.toUpperCase()}>{t(`criticality.${value}`)}</option>)}
              </select></label>
              <label>{t("policy.monitoring")} <select name="monitoringStatus" defaultValue={policy.monitoringStatus.toUpperCase()}>
                {PIPELINE_MONITORING_STATUSES.map((value) => <option key={value} value={value.toUpperCase()}>{t(`monitoring.${value}`)}</option>)}
              </select></label>
              <button type="submit">{t("pilot.save")}</button>
            </fieldset>
          </form>}
          <p className={styles.note}>{t("policy.description")}</p>
          <p className={styles.note}>{t("policy.monitoringNote")}</p>
        </section>
        <section aria-labelledby="pipeline-ownership">
          <h2 id="pipeline-ownership">{t("ownership.title")}</h2>
          <DetailFields fields={[
            [t("ownership.team"), ownership.responsibleTeam || t("ownership.unspecified")],
            [t("ownership.owners"), ownership.pipelineOwners?.length
              ? ownership.pipelineOwners.join(" · ") : t("ownership.unspecified")],
          ]} />
          <p className={styles.note}>{t("ownership.note")}</p>
        </section>
        <section aria-labelledby="pipeline-access">
          <h2 id="pipeline-access">{t("access.title")}</h2>
          <p className={styles.note} id="pipeline-access-note">{t(persisted ? "pilot.effectiveAccess" : "access.note")}</p>
          {persisted ? <p>{persisted.capabilities.join(" · ")}</p> : <div className={styles.tableScroll} role="region" tabIndex={0}
            aria-labelledby="pipeline-access" aria-describedby="pipeline-access-note">
            <table className={styles.accessTable}>
              <thead><tr>
                <th scope="col">{t("access.role")}</th>
                <th scope="col">{t("access.capability")}</th>
                <th scope="col">{t("access.description")}</th>
              </tr></thead>
              <tbody>{capabilityExamples.map(([role, capability, description]) => (
                <tr key={role}><th scope="row">{role}</th><td>{capability}</td><td>{description}</td></tr>
              ))}</tbody>
            </table>
          </div>}
        </section>
        {!persisted && <section className={styles.update} aria-labelledby="pipeline-update">
          <h2 id="pipeline-update">{t("update.title")}</h2>
          <p className={styles.empty}>{t("update.empty")}</p>
          <p className={styles.note}>{t("update.note")}</p>
        </section>}
      </div>}
    </AppLayout>
  );
}
