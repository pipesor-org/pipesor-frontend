import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigationType, useSearchParams } from "react-router-dom";

import { PIPELINE_CRITICALITIES, PIPELINE_MONITORING_STATUSES } from "../../../entities/monitored-pipeline";
import { pipelineDetailPath } from "../../../shared/config";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Badge } from "../../../shared/ui/badge";
import { ChevronRightIcon, SearchIcon } from "../../../shared/ui/icons";
import { AppSidebar } from "../../../widgets/app-sidebar";

import { isPendingSearchEcho, readInventoryQuery, responsibleTeams, selectInventoryPipelines } from "../model/inventory";
import styles from "./PipelinesPage.module.css";

export function PipelinesPage() {
  const { t } = useTranslation("pipelines");
  const [params, setParams] = useSearchParams();
  const query = readInventoryQuery(params);
  const [search, setSearch] = useState(query.q);
  const pendingSearch = useRef<{ latest: string; values: Set<string> } | undefined>(undefined);
  const { key: locationKey } = useLocation();
  const navigationType = useNavigationType();
  const pipelines = selectInventoryPipelines({ ...query, q: search });
  const headingRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  useEffect(() => {
    const pending = pendingSearch.current;
    // Older URL commits must not replace a newer, immediately rendered keystroke.
    if (pending && isPendingSearchEcho(navigationType, query.q, pending.values)) {
      if (pending.latest === query.q) pendingSearch.current = undefined;
      return;
    }
    pendingSearch.current = undefined;
    setSearch(query.q);
  }, [query.q, locationKey, navigationType]);

  function setCriterion(key: keyof typeof query, value: string) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (key !== "q") {
        if (search) next.set("q", search); else next.delete("q");
      }
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true });
  }

  function setSearchDraft(value: string) {
    const pending = pendingSearch.current ?? { latest: value, values: new Set([query.q]) };
    pending.latest = value;
    pending.values.add(value);
    pendingSearch.current = pending;
    setSearch(value);
  }

  return (
    <AppLayout sidebar={<AppSidebar />} hint={t("inventory.hint")}>
      <header className={styles.header}>
        <div>
          <h1 ref={headingRef} tabIndex={-1}>{t("inventory.title")}</h1>
          <p className={styles.subtitle}>{t("inventory.subtitle")}</p>
        </div>
        <div className={styles.actions}>
          <Badge variant="outline">{t("demoBadge")}</Badge>
          <button type="button" className={styles.add} disabled aria-describedby="pipeline-add-unavailable">
            <span aria-hidden="true">+</span>{t("inventory.add")}
          </button>
          <p id="pipeline-add-unavailable" className={styles.unavailable}>{t("inventory.addUnavailable")}</p>
        </div>
      </header>
      <div className={styles.filters}>
        <label className={styles.search}>
          <span className={styles.srOnly}>{t("inventory.search")}</span><SearchIcon />
          <input ref={searchRef} type="search" value={search} placeholder={t("inventory.search")}
            onChange={(event) => { setSearchDraft(event.target.value); setCriterion("q", event.target.value); }} />
        </label>
        <label className={styles.filter}>
          <span className={styles.srOnly}>{t("inventory.criticality")}</span>
          <select value={query.criticality} onChange={(event) => setCriterion("criticality", event.target.value)}>
            <option value="">{t("inventory.criticality")}</option>
            {PIPELINE_CRITICALITIES.map((value) => <option key={value} value={value}>{t(`criticality.${value}`)}</option>)}
          </select>
        </label>
        <label className={styles.filter}>
          <span className={styles.srOnly}>{t("inventory.team")}</span>
          <select value={query.team} onChange={(event) => setCriterion("team", event.target.value)}>
            <option value="">{t("inventory.team")}</option>
            {responsibleTeams.map((team) => <option key={team} value={team}>{team}</option>)}
          </select>
        </label>
        <label className={styles.filter}>
          <span className={styles.srOnly}>{t("inventory.monitoring")}</span>
          <select value={query.monitoring} onChange={(event) => setCriterion("monitoring", event.target.value)}>
            <option value="">{t("inventory.monitoring")}</option>
            {PIPELINE_MONITORING_STATUSES.map((value) => <option key={value} value={value}>{t(`monitoring.${value}`)}</option>)}
          </select>
        </label>
      </div>
      <div className={styles.heading}>
        <h2 id="monitored-workflows">{t("inventory.heading")}</h2>
        {[search, query.criticality, query.team, query.monitoring].some(Boolean) && <button type="button" className={styles.reset}
          onClick={() => { setSearchDraft(""); setParams({}, { replace: true }); searchRef.current?.focus(); }}>{t("inventory.reset")}</button>}
      </div>
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
              <th scope="row"><Link className={styles.pipelineLink} to={pipelineDetailPath(pipeline.id)}
                state={{ pipelineSearch: new URLSearchParams({ ...query, q: search }).toString() }}>
                <span className={styles.slug}>{pipeline.slug}</span>
                <span className={styles.workflow}>{pipeline.github.workflowName}</span>
              </Link></th>
              <td className={styles.repository}>{pipeline.github.repository}</td>
              <td>{pipeline.policy.operationalEnvironment ? t(`environment.${pipeline.policy.operationalEnvironment}`) : t("policy.unspecified")}</td>
              <td><span className={`${styles.status} ${styles[pipeline.policy.criticality]}`}>{t(`criticality.${pipeline.policy.criticality}`)}</span></td>
              <td>{pipeline.ownership.responsibleTeam}</td>
              <td><div className={styles.monitoringCell}>
                <span className={`${styles.status} ${styles[pipeline.policy.monitoringStatus]}`}>{t(`monitoring.${pipeline.policy.monitoringStatus}`)}</span>
                <ChevronRightIcon width={12} height={12} aria-hidden="true" />
              </div></td>
            </tr>
          )) : <tr><td colSpan={6} className={styles.empty}>{t("inventory.empty")}</td></tr>}</tbody>
        </table>
      </div>
    </AppLayout>
  );
}
