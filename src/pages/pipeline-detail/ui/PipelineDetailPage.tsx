import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import type { MonitoredPipeline } from "../../../entities/monitored-pipeline";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Badge } from "../../../shared/ui/badge";
import { AppSidebar } from "../../../widgets/app-sidebar";

import styles from "./PipelineDetailPage.module.css";

function DetailFields({ fields }: { fields: readonly (readonly [string, ReactNode])[] }) {
  return <dl className={styles.fields}>{fields.map(([label, value]) => (
    <div className={styles.row} key={label}><dt>{label}</dt><dd>{value}</dd></div>
  ))}</dl>;
}

export function PipelineDetailPage({ pipeline }: { pipeline: MonitoredPipeline }) {
  const { t } = useTranslation("pipelines");
  const { github, policy, ownership } = pipeline;
  const capabilityExamples = [
    ["Platform Engineering", t("access.operate"), t("access.operateDescription")],
    ["QA Team", t("access.view"), t("access.viewDescription")],
    [t("access.lead"), t("access.view"), t("access.viewDescription")],
    [t("access.administrators"), t("access.configure"), t("access.configureDescription")],
  ];

  return (
    <AppLayout sidebar={<AppSidebar />}>
      <div className={styles.context}>
        <p className={styles.unavailable}>{t("backUnavailable")}</p>
        <Badge variant="outline">{t("demoBadge")}</Badge>
      </div>
      <header className={styles.header}>
        <h1>{pipeline.slug}</h1>
        <p className={styles.metadata}><span>{github.repository}</span><span>GitHub Actions</span></p>
        <p className={styles.note}>{t("demoContext")}</p>
      </header>
      <div className={styles.surface}>
        <section className={styles.identity} aria-labelledby="pipeline-identity">
          <h2 id="pipeline-identity">{t("identity.title")}</h2>
          <p className={styles.note}>{t("identity.description")}</p>
          <DetailFields fields={[
            [t("identity.repository"), github.repository],
            [t("identity.workflow"), github.workflowName],
            [t("identity.file"), github.workflowPath],
            [t("identity.branch"), github.defaultBranch],
            [t("identity.provider"), "GitHub Actions"],
          ]} />
          <p className={styles.note}>{t("identity.linksUnavailable")}</p>
        </section>
        <section aria-labelledby="pipeline-policy">
          <h2 id="pipeline-policy">{t("policy.title")}</h2>
          <DetailFields fields={[
            [t("policy.criticality"), t(`criticality.${policy.criticality}`)],
            [t("policy.monitoring"), t(`monitoring.${policy.monitoringStatus}`)],
            [t("policy.environment"), policy.operationalEnvironment
              ? t(`environment.${policy.operationalEnvironment}`) : t("policy.unspecified")],
          ]} />
          <p className={styles.note}>{t("policy.description")}</p>
          <p className={styles.note}>{t("policy.monitoringNote")}</p>
        </section>
        <section aria-labelledby="pipeline-ownership">
          <h2 id="pipeline-ownership">{t("ownership.title")}</h2>
          <DetailFields fields={[
            [t("ownership.team"), ownership.responsibleTeam],
            [t("ownership.owners"), ownership.pipelineOwners?.length
              ? ownership.pipelineOwners.join(" · ") : t("ownership.unspecified")],
          ]} />
          <p className={styles.note}>{t("ownership.note")}</p>
        </section>
        <section aria-labelledby="pipeline-access">
          <h2 id="pipeline-access">{t("access.title")}</h2>
          <p className={styles.note} id="pipeline-access-note">{t("access.note")}</p>
          <div className={styles.tableScroll} role="region" tabIndex={0}
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
          </div>
        </section>
        <section className={styles.update} aria-labelledby="pipeline-update">
          <h2 id="pipeline-update">{t("update.title")}</h2>
          <p className={styles.empty}>{t("update.empty")}</p>
          <p className={styles.note}>{t("update.note")}</p>
        </section>
      </div>
    </AppLayout>
  );
}
