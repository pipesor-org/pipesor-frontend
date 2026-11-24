import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import {
  INCIDENT_STAGES,
  NO_INCIDENT_FILTERS,
  RESOLVED_WITHIN,
  SEVERITY_FILTERS,
  SEVERITY_LABEL_KEY,
  STAGE_LABEL_KEY,
  STATUS_LABEL_KEY,
  MAX_QUERY_LENGTH,
  UNCLASSIFIED_SEVERITY,
  hasIncidentFilters,
  type DiagnosisCriterion,
  type IncidentFilters,
  type IncidentStage,
  type IncidentStatus,
  type ResolvedWithin,
  type SeverityFilter,
} from "../../../entities/incident";
import { listPipelines } from "../../../entities/monitored-pipeline";
import { useApiQuery } from "../../../shared/api";
import { useFormatters } from "../../../shared/i18n";
import { FacetMenu } from "../../../shared/ui/facet-menu";
import { FilterBar } from "../../../shared/ui/filter-bar";

import { BROWSER_FILTER_CAP, type QueueScope } from "../model/useIncidentQueue";

/** Validation facet labels: the review statuses, then "No diagnosis". */
const DIAGNOSIS_LABEL_KEY = {
  PENDING: "diagnosis.status.pending",
  CONFIRMED: "diagnosis.status.confirmed",
  CORRECTED: "diagnosis.status.corrected",
  REJECTED: "diagnosis.status.rejected",
  ABSENT: "filters.noDiagnosis",
} as const satisfies Record<DiagnosisCriterion, string>;

interface IncidentFilterBarProps {
  filters: IncidentFilters;
  onChange: (filters: IncidentFilters) => void;
  /** How the shown rows relate to the queue (drives the result line). */
  scope: QueueScope;
  /**
   * Facets this queue offers; `statuses` and `diagnoses` list the values it can
   * hold (Status on Active, Validation in History).
   */
  facets: {
    repository?: boolean;
    severity?: boolean;
    stage?: boolean;
    statuses?: readonly IncidentStatus[];
    diagnoses?: readonly DiagnosisCriterion[];
    /** Resolved within a period (views of resolved incidents). */
    resolved?: boolean;
  };
  /**
   * Result line when the shown rows are a further selection of the matching
   * incidents (Needs Validation shows only pending ones); replaces the default.
   */
  result?: string | null;
}

/**
 * The incident criteria on the shared `FilterBar`: search (number, repository
 * or workflow) and multi-select facets, with the result line for the queue's
 * scope.
 */
export function IncidentFilterBar({ filters, onChange, scope, facets, result }: IncidentFilterBarProps) {
  const { t } = useTranslation("operations");
  const { formatNumber } = useFormatters();
  const latest = useRef(filters);
  latest.current = filters;

  const pipelines = useApiQuery(facets.repository ? "incident-filter-repositories" : null, (signal) => listPipelines(signal));
  const repositoryOptions = useMemo(() => {
    if (pipelines.state.status !== "success") return [];
    const byId = new Map(pipelines.state.data.map((pipeline) => [pipeline.githubRepositoryId, pipeline.fullName]));
    return [...byId].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
  }, [pipelines.state]);

  const severityLabel = (value: SeverityFilter) =>
    value === UNCLASSIFIED_SEVERITY ? t("severity.unclassified") : t(SEVERITY_LABEL_KEY[value]);

  const common = { selectedLabel: t("filters.selected"), clearLabel: t("filters.clearFacet") };

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
    <FilterBar
      query={filters.q}
      onQueryChange={(q) => onChange({ ...latest.current, q })}
      searchLabel={t("filters.search")}
      maxLength={MAX_QUERY_LENGTH}
      active={hasIncidentFilters(filters)}
      clearLabel={t("filters.clear")}
      onClear={() => onChange(NO_INCIDENT_FILTERS)}
      result={
        <>
          {summary}
          {scope.kind === "browser" && scope.truncated ? ` ${t("filters.scope.truncated", { count: BROWSER_FILTER_CAP })}` : null}
        </>
      }
      facets={
        <>
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
          {facets.diagnoses?.length ? (
            <FacetMenu
              {...common}
              label={t("filters.validation")}
              options={facets.diagnoses.map((value) => ({ value, label: t(DIAGNOSIS_LABEL_KEY[value]) }))}
              selected={filters.diagnoses}
              onChange={(diagnoses) => onChange({ ...filters, diagnoses: diagnoses as DiagnosisCriterion[] })}
            />
          ) : null}
          {facets.resolved ? (
            <FacetMenu
              {...common}
              single
              label={t("filters.resolved")}
              options={RESOLVED_WITHIN.map((value) => ({ value, label: t(`filters.resolvedWithin.${value}`) }))}
              selected={filters.resolvedWithin ? [filters.resolvedWithin] : []}
              onChange={([value]) => onChange({ ...filters, resolvedWithin: (value as ResolvedWithin | undefined) ?? null })}
            />
          ) : null}
        </>
      }
    />
  );
}
