import { useEffect, useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

import { fetchSelfPrincipalRef } from "../../../entities/github-access";
import {
  CriticalityBadge,
  MonitoringBadge,
  PIPELINE_CAPABILITIES,
  environmentLabel,
  fetchLatestActivity,
  fetchPipeline,
  fetchPipelineGrants,
  pipelineGithubLinks,
  pipelineWorkflowLabel,
  type PipelineCapability,
} from "../../../entities/monitored-pipeline";
import { GrantSelfOperate } from "../../../features/grant-pipeline-access";
import { FailedRuns } from "../../../features/request-run-analysis";
import { isApiError, useApiQuery } from "../../../shared/api";
import { useFormatters } from "../../../shared/i18n";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Button } from "../../../shared/ui/button";
import { dataTable } from "../../../shared/ui/data-table";
import { Skeleton } from "../../../shared/ui/skeleton";
import { ChevronLeftIcon } from "../../../shared/ui/icons";
import { PageHeader } from "../../../shared/ui/page-header";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { GitHubConnectionStatus } from "../../../widgets/github-connection";

import styles from "./PipelineDetailPage.module.css";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function DetailFields({ fields }: { fields: readonly (readonly [string, ReactNode])[] }) {
  return <dl className={styles.fields}>{fields.map(([label, value]) => (
    <div className={styles.row} key={label}><dt>{label}</dt><dd>{value}</dd></div>
  ))}</dl>;
}

/** `tid:oid` shortened for display; the full reference stays in the title. */
function shortRef(ref: string): string {
  const [tenant, object] = ref.split(":");
  return object ? `${tenant.slice(0, 8)}…:${object.slice(0, 8)}…` : `${ref.slice(0, 12)}…`;
}

async function loadDetail(id: string, signal: AbortSignal) {
  const [pipeline, grants, activity] = await Promise.all([
    fetchPipeline(id, signal),
    fetchPipelineGrants(id, signal).catch(() => null),
    fetchLatestActivity(id, signal).catch(() => null),
  ]);
  return { pipeline, grants, activity };
}

/**
 * Pipeline Detail (`/pipelines/:pipelineId`): the registered workflow, its
 * read-only policy and ownership, who holds which capability (grants per
 * person), recent failed runs to analyse and the latest configuration change.
 */
export function PipelineDetailPage({ backTo }: { backTo: string }) {
  const { t } = useTranslation("pipelines");
  const { formatTimestamp } = useFormatters();
  const { pipelineId = "" } = useParams();
  const validId = UUID.test(pipelineId);
  const detail = useApiQuery(validId ? pipelineId : null, (signal) => loadDetail(pipelineId, signal));
  const self = useApiQuery("self-principal", () => fetchSelfPrincipalRef());
  const selfRef = self.state.status === "success" ? self.state.data : null;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const loaded = detail.state.status === "success" ? detail.state.data : null;
  const notFound = !validId || (detail.state.status === "error" && isApiError(detail.state.error) && detail.state.error.status === 404);
  const settled = loaded !== null || detail.state.status === "error" || !validId;
  useEffect(() => { if (settled) headingRef.current?.focus(); }, [pipelineId, settled]);

  const title = loaded
    ? pipelineWorkflowLabel(loaded.pipeline) ?? loaded.pipeline.githubWorkflowId
    : notFound ? t("detail.notFound") : detail.state.status === "error" ? t("detail.error") : t("detail.loading");

  return (
    <AppLayout sidebar={<AppSidebar />}>
      <PageHeader
        divider
        headingRef={headingRef}
        back={<Link to={backTo}><ChevronLeftIcon />{t("backToPipelines")}</Link>}
        title={title}
        meta={loaded && <><span className={styles.repository}>{loaded.pipeline.fullName}</span><GitHubConnectionStatus /></>}
      />

      {validId && detail.state.status === "loading" && (
        <div className={styles.surface} aria-hidden="true">
          {[["28%", "64%", "52%", "58%"], ["32%", "44%", "40%"], ["26%", "70%"]].map((widths, index) => (
            <section key={index}>
              {widths.map((width, line) => <Skeleton key={line} width={width} height={line === 0 ? "16px" : undefined} />)}
            </section>
          ))}
        </div>
      )}
      {notFound && <p>{t("detail.notFoundText")}</p>}
      {detail.state.status === "error" && !notFound && <Button onClick={detail.reload}>{t("retry")}</Button>}

      {loaded && (() => {
        const { pipeline, grants, activity } = loaded;
        const links = pipelineGithubLinks(pipeline);
        const external = (href: string | null, text: string) =>
          href ? <a href={href} target="_blank" rel="noreferrer noopener">{text} ↗<span className={styles.srOnly}> {t("opensInNewTab")}</span></a> : null;
        const people = new Map<string, Set<PipelineCapability>>();
        for (const grant of grants ?? []) {
          const set = people.get(grant.principalRef) ?? new Set<PipelineCapability>();
          set.add(grant.capability);
          people.set(grant.principalRef, set);
        }
        const caps = pipeline.effectiveCapabilities;

        return (
          <div className={styles.surface}>
            <section aria-labelledby="pipeline-identity">
              <h2 id="pipeline-identity">{t("identity.title")}</h2>
              <p className={styles.note}>{t("identity.description")}</p>
              <DetailFields fields={[
                [t("identity.repository"), <span className={styles.split}><span className={styles.mono}>{pipeline.fullName}</span>{external(links.repository, t("identity.openRepository"))}</span>],
                [t("identity.workflow"), <span className={styles.split}><span>{pipelineWorkflowLabel(pipeline) ?? "—"}</span>{external(links.workflow, t("identity.openWorkflow"))}</span>],
                [t("identity.file"), <span className={styles.mono}>{pipeline.workflowFile ?? "—"}</span>],
                [t("identity.branch"), <span className={styles.mono}>{pipeline.defaultBranch ?? "—"}</span>],
                [t("identity.provider"), "GitHub Actions"],
              ]} />
            </section>

            <section aria-labelledby="pipeline-policy">
              <h2 id="pipeline-policy">{t("policy.title")}</h2>
              <DetailFields fields={[
                [t("policy.criticality"), <CriticalityBadge criticality={pipeline.criticality} />],
                [t("policy.monitoring"), <MonitoringBadge status={pipeline.monitoringStatus} />],
                [t("policy.environment"), environmentLabel(t, pipeline.environment)],
              ]} />
              <p className={styles.note}>{t("policy.description")}</p>
            </section>

            <section aria-labelledby="pipeline-ownership">
              <h2 id="pipeline-ownership">{t("ownership.title")}</h2>
              <DetailFields fields={[[t("ownership.team"), pipeline.responsibleTeamNameSnapshot || t("ownership.unspecified")]]} />
              <p className={styles.note}>{t("ownership.note")}</p>
            </section>

            <section aria-labelledby="pipeline-access">
              <h2 id="pipeline-access">{t("access.title")}</h2>
              <p className={styles.note}>{t("access.yours", { capabilities: caps.map((cap) => t(`access.capability.${cap}`)).join(" · ") || "—" })}</p>
              {caps.includes("CONFIGURE") && !caps.includes("OPERATE") && <GrantSelfOperate pipelineId={pipeline.id} onGranted={detail.reload} />}
              {grants === null ? (
                <p className={styles.note}>{t("access.unavailable")}</p>
              ) : (
                <div className={dataTable.frame} role="region" tabIndex={0} aria-labelledby="pipeline-access">
                  <table className={`${dataTable.table} ${styles.accessTable}`}>
                    <colgroup><col className={styles.colPerson} /><col className={styles.colCapabilities} /><col /></colgroup>
                    <thead><tr>
                      <th scope="col">{t("access.person")}</th>
                      <th scope="col">{t("access.capabilities")}</th>
                      <th scope="col">{t("access.description")}</th>
                    </tr></thead>
                    <tbody>{[...people.entries()].map(([ref, set]) => {
                      const held = PIPELINE_CAPABILITIES.filter((cap) => set.has(cap));
                      return (
                        <tr key={ref}>
                          <th scope="row"><span className={styles.mono} title={ref}>{shortRef(ref)}</span>{ref === selfRef && <span className={styles.you}> {t("access.you")}</span>}</th>
                          <td>{held.map((cap) => t(`access.capability.${cap}`)).join(" · ")}</td>
                          <td><span className={dataTable.muted}>{held.map((cap) => t(`access.capabilityDescription.${cap}`)).join(" ")}</span></td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              )}
              <p className={styles.note}>{t("access.note")}</p>
            </section>

            <section aria-labelledby="pipeline-runs">
              <h2 id="pipeline-runs">{t("runs.title")}</h2>
              <p className={styles.note}>{t("runs.description")}</p>
              <FailedRuns workflow={{ repositoryId: pipeline.githubRepositoryId, workflowId: pipeline.githubWorkflowId }} />
            </section>

            <section className={styles.update} aria-labelledby="pipeline-update">
              <h2 id="pipeline-update">{t("update.title")}</h2>
              {activity ? (
                <p>
                  <span className={styles.mono}>{activity.action}</span> · <time dateTime={activity.occurredAt}>{formatTimestamp(activity.occurredAt)}</time>
                  {activity.actorRef && <> · {activity.actorRef === selfRef ? t("access.you") : <span className={styles.mono} title={activity.actorRef}>{shortRef(activity.actorRef)}</span>}</>}
                </p>
              ) : (
                <p className={styles.empty}>{t("update.empty")}</p>
              )}
            </section>
          </div>
        );
      })()}
    </AppLayout>
  );
}
