import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  INCIDENT_STAGES,
  NO_INCIDENT_FILTERS,
  SEVERITY_FILTERS,
  SEVERITY_LABEL_KEY,
  STAGE_LABEL_KEY,
  STATUS_LABEL_KEY,
  UNCLASSIFIED_SEVERITY,
  hasIncidentFilters,
  type IncidentFilters,
  type IncidentStage,
  type IncidentStatus,
  type SeverityFilter,
} from "../../../entities/incident";
import { listPipelines } from "../../../entities/monitored-pipeline";
import { useApiQuery } from "../../../shared/api";
import { useFormatters } from "../../../shared/i18n";
import { FacetMenu } from "../../../shared/ui/facet-menu";
import { TextInput } from "../../../shared/ui/field";
import { SearchIcon } from "../../../shared/ui/icons";

import { BROWSER_FILTER_CAP, type QueueScope } from "../model/useIncidentQueue";
import styles from "./IncidentFilterBar.module.css";

/** Typing settles for this long before the criteria (and the URL) change. */
const SEARCH_DEBOUNCE_MS = 300;

interface IncidentFilterBarProps {
  filters: IncidentFilters;
  onChange: (filters: IncidentFilters) => void;
  /** How the shown rows relate to the queue (drives the result line). */
  scope: QueueScope;
  /** Facets this queue offers; `statuses` lists the status values it can hold. */
  facets: { repository?: boolean; severity?: boolean; stage?: boolean; statuses?: readonly IncidentStatus[] };
  /**
   * Result line when the shown rows are a further selection of the matching
   * incidents (Needs Validation shows only pending ones); replaces the default.
   */
  result?: string | null;
}

/**
 * One quiet row of criteria above an incident table: search (number,
 * repository or workflow), multi-select facets, the result line and Clear.
 * `/` focuses the search from anywhere outside a text field.
 */
export function IncidentFilterBar({ filters, onChange, scope, facets, result }: IncidentFilterBarProps) {
  const { t } = useTranslation("operations");
  const { formatNumber } = useFormatters();
  const [text, setText] = useState(filters.q);
  const search = useRef<HTMLInputElement>(null);
  const latest = useRef(filters);
  latest.current = filters;

  // Follow outside changes (Clear, Back) without fighting the user's typing.
  useEffect(() => {
    setText((current) => (current.trim() === filters.q.trim() ? current : filters.q));
  }, [filters.q]);

  useEffect(() => {
    if (text.trim() === latest.current.q.trim()) return;
    const timer = setTimeout(() => onChange({ ...latest.current, q: text }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, onChange]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      search.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const pipelines = useApiQuery(facets.repository ? "incident-filter-repositories" : null, (signal) => listPipelines(signal));
  const repositoryOptions = useMemo(() => {
    if (pipelines.state.status !== "success") return [];
    const byId = new Map(pipelines.state.data.map((pipeline) => [pipeline.githubRepositoryId, pipeline.fullName]));
    return [...byId].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [pipelines.state]);

  const severityLabel = (value: SeverityFilter) =>
    value === UNCLASSIFIED_SEVERITY ? t("severity.unclassified") : t(SEVERITY_LABEL_KEY[value]);

  const common = { selectedLabel: t("filters.selected"), clearLabel: t("filters.clearFacet") };
  const active = hasIncidentFilters(filters) || text.trim() !== "";

  let summary: string | null = null;
  if (result !== undefined) {
    summary = scope.kind === "browser" && scope.pending ? t("filters.filtering") : result;
  } else if (scope.kind === "browser") {
    summary = scope.pending
      ? t("filters.filtering")
      : t("filters.scope.browser", { matched: formatNumber(scope.matched), count: scope.loaded, loaded: formatNumber(scope.loaded) });
  } else if (scope.kind === "service" && scope.total !== null) {
    summary = t("filters.scope.service", { count: scope.total, total: formatNumber(scope.total) });
  }

  return (
    <div className={styles.bar}>
      <label className={styles.search}>
        <span className={styles.srOnly}>{t("filters.search")}</span>
        <TextInput
          ref={search}
          type="search"
          value={text}
          placeholder={t("filters.search")}
          icon={<SearchIcon />}
          autoComplete="off"
          className={styles.searchInput}
          onChange={(event) => setText(event.target.value)}
        />
        {!text ? <kbd className={styles.shortcut} aria-hidden="true">/</kbd> : null}
      </label>

      <div className={styles.facets}>
        {facets.repository ? (
          <FacetMenu
            {...common}
            label={t("filters.repository")}
            options={repositoryOptions}
            selected={filters.repositories}
            emptyLabel={pipelines.state.status === "error" ? t("filters.repositoriesUnavailable") : t("filters.noRepositories")}
            onChange={(repositories) => onChange({ ...filters, repositories })}
          />
        ) : null}
        {facets.severity ? (
          <FacetMenu
            {...common}
            label={t("filters.severity")}
            options={SEVERITY_FILTERS.map((value) => ({ value, label: severityLabel(value) }))}
            selected={filters.severities}
            onChange={(severities) => onChange({ ...filters, severities: severities as SeverityFilter[] })}
          />
        ) : null}
        {facets.stage ? (
          <FacetMenu
            {...common}
            label={t("filters.stage")}
            options={INCIDENT_STAGES.map((value) => ({ value, label: t(STAGE_LABEL_KEY[value]) }))}
            selected={filters.stages}
            onChange={(stages) => onChange({ ...filters, stages: stages as IncidentStage[] })}
          />
        ) : null}
        {facets.statuses?.length ? (
          <FacetMenu
            {...common}
            label={t("filters.status")}
            options={facets.statuses.map((value) => ({ value, label: t(STATUS_LABEL_KEY[value]) }))}
            selected={filters.statuses}
            onChange={(statuses) => onChange({ ...filters, statuses: statuses as IncidentStatus[] })}
          />
        ) : null}
      </div>

      <div className={styles.summary}>
        <span className={styles.result} role="status">
          {summary}
          {scope.kind === "browser" && scope.truncated ? ` ${t("filters.scope.truncated", { count: BROWSER_FILTER_CAP })}` : null}
        </span>
        {active ? (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              setText("");
              onChange(NO_INCIDENT_FILTERS);
              search.current?.focus();
            }}
          >
            {t("filters.clear")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
