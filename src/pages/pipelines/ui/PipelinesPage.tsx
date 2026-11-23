import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import {
  CriticalityBadge,
  MonitoringBadge,
  PIPELINE_CRITICALITIES,
  PIPELINE_MONITORING_STATUSES,
  environmentLabel,
  listPipelines,
  pipelineWorkflowLabel,
} from "../../../entities/monitored-pipeline";
import { useApiQuery } from "../../../shared/api";
import { pipelineDetailPath, routes } from "../../../shared/config";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Button, buttonClassName } from "../../../shared/ui/button";
import { Select, TextInput } from "../../../shared/ui/field";
import { ChevronRightIcon, PlusIcon, SearchIcon } from "../../../shared/ui/icons";
import { PageHeader } from "../../../shared/ui/page-header";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { GitHubConnectionStatus } from "../../../widgets/github-connection";

import { readInventoryQuery, selectInventoryPipelines } from "../model/inventory";
import styles from "./PipelinesPage.module.css";

/**
 * Pipelines inventory (`/pipelines`): every registered workflow the caller may
 * VIEW, read from Pipeline. Search and filters run in the browser over that
 * complete list and are kept in the URL (REPLACE) so Back from Detail restores
 * them.
 */
export function PipelinesPage() {
  const { t } = useTranslation("pipelines");
  const [params, setParams] = useSearchParams();
  const inventory = useApiQuery("pipelines", (signal) => listPipelines(signal));
  const all = inventory.state.status === "success" ? inventory.state.data : [];
  const teams = [...new Set(all.map((pipeline) => pipeline.responsibleTeamNameSnapshot).filter((team): team is string => Boolean(team)))].sort();
  const query = readInventoryQuery(params, teams);
  const pipelines = selectInventoryPipelines(query, all);
  const filtered = Object.values(query).some(Boolean);
  const returnState = { pipelineSearch: params.toString() };
  const headingRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);

  function setCriterion(key: keyof typeof query, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true });
  }

  return (
    <AppLayout sidebar={<AppSidebar />} hint={t("inventory.hint")}>
      <PageHeader
        headingRef={headingRef}
        title={t("inventory.title")}
        subtitle={t("inventory.subtitle")}
        meta={<GitHubConnectionStatus />}
        actions={
          <Link className={buttonClassName({ variant: "primary" })} to={routes.addMonitoredWorkflow} state={returnState}>
            <PlusIcon />{t("inventory.add")}
          </Link>
        }
      />
      <div className={styles.filters}>
        <label className={styles.search}>
          <span className={styles.srOnly}>{t("inventory.search")}</span>
          <TextInput ref={searchRef} type="search" name="q" value={query.q} placeholder={t("inventory.search")} icon={<SearchIcon />}
            onChange={(event) => setCriterion("q", event.target.value)} />
        </label>
        <label className={styles.filter}>
          <span className={styles.srOnly}>{t("inventory.criticality")}</span>
          <Select name="criticality" value={query.criticality} onChange={(event) => setCriterion("criticality", event.target.value)}>
            <option value="">{t("inventory.criticality")}</option>
            {PIPELINE_CRITICALITIES.map((value) => <option key={value} value={value}>{t(`criticality.${value}`)}</option>)}
          </Select>
        </label>
        <label className={styles.filter}>
          <span className={styles.srOnly}>{t("inventory.team")}</span>
          <Select name="team" value={query.team} onChange={(event) => setCriterion("team", event.target.value)}>
            <option value="">{t("inventory.team")}</option>
            {teams.map((team) => <option key={team} value={team}>{team}</option>)}
          </Select>
        </label>
        <label className={styles.filter}>
          <span className={styles.srOnly}>{t("inventory.monitoring")}</span>
          <Select name="monitoring" value={query.monitoring} onChange={(event) => setCriterion("monitoring", event.target.value)}>
            <option value="">{t("inventory.monitoring")}</option>
            {PIPELINE_MONITORING_STATUSES.map((value) => <option key={value} value={value}>{t(`monitoring.${value}`)}</option>)}
          </Select>
        </label>
      </div>
      <div className={styles.heading}>
        <h2 id="monitored-workflows">{t("inventory.heading")}</h2>
        {filtered && <Button variant="link" className={styles.reset}
          onClick={() => { setParams({}, { replace: true }); searchRef.current?.focus(); }}>{t("inventory.reset")}</Button>}
      </div>

      {inventory.state.status === "loading" && <p className={styles.state} role="status">{t("inventory.loading")}</p>}
      {inventory.state.status === "error" && (
        <div className={styles.state}>
          <p role="alert">{t("inventory.error")}</p>
          <Button onClick={inventory.reload}>{t("retry")}</Button>
        </div>
      )}
      {inventory.state.status === "success" && (
        <>
          <p className={styles.srOnly} role="status">{t("inventory.results", { count: pipelines.length })}</p>
          <div className={styles.tableScroll} role="region" aria-labelledby="monitored-workflows" tabIndex={0}>
            <table className={styles.table}>
              <colgroup><col /><col /><col /><col /><col /><col /></colgroup>
              <thead><tr>
                <th scope="col">{t("inventory.workflow")}</th><th scope="col">{t("inventory.repository")}</th>
                <th scope="col">{t("inventory.environment")}</th><th scope="col">{t("inventory.criticality")}</th>
                <th scope="col">{t("inventory.team")}</th><th scope="col">{t("inventory.monitoring")}</th>
              </tr></thead>
              <tbody>{pipelines.length ? pipelines.map((pipeline) => (
                <tr key={pipeline.id}>
                  <th scope="row"><Link className={styles.pipelineLink} to={pipelineDetailPath(pipeline.id)} state={returnState}>
                    <span className={styles.slug}>{pipelineWorkflowLabel(pipeline) ?? pipeline.githubWorkflowId}</span>
                    {pipeline.workflowFile && <span className={styles.workflow}>{pipeline.workflowFile.split("/").pop()}</span>}
                  </Link></th>
                  <td className={styles.repository}>{pipeline.fullName}</td>
                  <td>{environmentLabel(t, pipeline.environment)}</td>
                  <td><CriticalityBadge criticality={pipeline.criticality} /></td>
                  <td>{pipeline.responsibleTeamNameSnapshot || t("ownership.unspecified")}</td>
                  <td><div className={styles.monitoringCell}>
                    <MonitoringBadge status={pipeline.monitoringStatus} />
                    <ChevronRightIcon width={12} height={12} aria-hidden="true" />
                  </div></td>
                </tr>
              )) : <tr><td colSpan={6} className={styles.empty}>{t(all.length ? "inventory.empty" : "inventory.none")}</td></tr>}</tbody>
            </table>
          </div>
        </>
      )}
    </AppLayout>
  );
}
