import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { fetchWorkflows, type GitHubRepository, type GitHubWorkflow } from "../../../entities/github-access";
import { useApiQuery } from "../../../shared/api";
import { pipelineDetailPath } from "../../../shared/config";
import { useFormatters } from "../../../shared/i18n";
import { TextInput } from "../../../shared/ui/field";
import { ChevronRightIcon, SearchIcon } from "../../../shared/ui/icons";
import { StatusBadge } from "../../../shared/ui/status-badge";

import { groupRepositories, type MonitoredRef, type RepositoryEntry } from "../model/repositoryGroups";
import styles from "./RepositoryBrowser.module.css";

/** Repositories listed per account before "Show all"; a search shows every match. */
const REPOSITORY_LIMIT = 20;

export interface WorkflowSelection {
  repository: GitHubRepository;
  workflow: GitHubWorkflow;
}

interface RepositoryBrowserProps {
  repositories: readonly GitHubRepository[];
  /** Monitored workflows the caller can see, marked instead of selectable. */
  monitored: readonly MonitoredRef[];
  selection: WorkflowSelection | null;
  onSelect: (selection: WorkflowSelection) => void;
  /** Shown when the form was submitted without a workflow. */
  error?: { id: string; text: string } | null;
}

/**
 * The repositories Pipesor can see, grouped by GitHub account (organization
 * or user) in collapsible blocks with one search across them. Opening a
 * repository lists its workflows; the one to monitor is chosen there, and
 * workflows already monitored (that the caller can see) link to their
 * pipeline instead of being offered again.
 */
export function RepositoryBrowser({ repositories, monitored, selection, onSelect, error }: RepositoryBrowserProps) {
  const { t } = useTranslation("pipelines");
  const { formatNumber } = useFormatters();
  const searchId = useId();
  const [query, setQuery] = useState("");
  // Explicit open/closed choices per account, for the current search only; otherwise an account is
  // open while searching, when it is the only one, or when it holds the chosen workflow.
  const [toggled, setToggled] = useState<{ query: string; open: ReadonlyMap<string, boolean> }>({ query: "", open: new Map() });
  const [showAll, setShowAll] = useState<ReadonlySet<string>>(new Set());
  const [openRepository, setOpenRepository] = useState<string | null>(selection?.repository.repositoryId ?? null);

  const groups = useMemo(() => groupRepositories(repositories, monitored, query), [repositories, monitored, query]);
  const accounts = useMemo(() => new Set(repositories.map((repository) => repository.fullName.split("/", 1)[0])).size, [repositories]);
  const searching = query.trim() !== "";
  const matches = groups.reduce((sum, group) => sum + group.repositories.length, 0);

  const choices = toggled.query === query ? toggled.open : new Map<string, boolean>();
  const isOpen = (account: string) =>
    choices.get(account) ?? (searching || groups.length === 1 || selection?.repository.fullName.startsWith(`${account}/`) === true);
  const toggle = (account: string) => setToggled({ query, open: new Map(choices).set(account, !isOpen(account)) });

  return (
    <div className={styles.browser}>
      <div className={styles.toolbar}>
        <label className={styles.search} htmlFor={searchId}>
          <span className={styles.srOnly}>{t("onboarding.browser.search")}</span>
          <TextInput
            id={searchId}
            type="search"
            value={query}
            placeholder={t("onboarding.browser.search")}
            icon={<SearchIcon />}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p className={styles.summary} role="status">
          {searching
            ? t("onboarding.browser.matches", { count: matches, countFormatted: formatNumber(matches) })
            : `${t("onboarding.browser.accounts", { count: accounts, countFormatted: formatNumber(accounts) })} · ${t("onboarding.browser.repositories", { count: repositories.length, countFormatted: formatNumber(repositories.length) })}`}
        </p>
      </div>

      {groups.length === 0 ? (
        <p className={styles.empty}>{t("onboarding.browser.noMatches", { query: query.trim() })}</p>
      ) : (
        <ul className={styles.accounts}>
          {groups.map((group) => {
            const open = isOpen(group.account);
            const panelId = `${searchId}-${group.account}`;
            const limited = !searching && !showAll.has(group.account) && group.repositories.length > REPOSITORY_LIMIT;
            const shown = limited ? group.repositories.slice(0, REPOSITORY_LIMIT) : group.repositories;
            return (
              <li key={group.account} className={styles.account}>
                <h3 className={styles.accountHeading}>
                  <button
                    type="button"
                    className={styles.accountButton}
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(group.account)}
                  >
                    <ChevronRightIcon className={styles.chevron} />
                    <span className={styles.accountName}>{group.account}</span>
                    <span className={styles.meta}>
                      {searching
                        ? t("onboarding.browser.ofRepositories", { count: group.total, shown: formatNumber(group.repositories.length), countFormatted: formatNumber(group.total) })
                        : t("onboarding.browser.repositories", { count: group.total, countFormatted: formatNumber(group.total) })}
                      {group.monitoredCount > 0 && <> · {t("onboarding.browser.monitored", { count: group.monitoredCount, countFormatted: formatNumber(group.monitoredCount) })}</>}
                    </span>
                  </button>
                </h3>
                {open && (
                  <div id={panelId}>
                    <ul className={styles.repositories}>
                      {shown.map((entry) => (
                        <RepositoryRow
                          key={entry.repository.repositoryId}
                          entry={entry}
                          open={openRepository === entry.repository.repositoryId}
                          onToggle={() => setOpenRepository((current) => (current === entry.repository.repositoryId ? null : entry.repository.repositoryId))}
                          selection={selection}
                          onSelect={onSelect}
                        />
                      ))}
                    </ul>
                    {limited && (
                      <button type="button" className={styles.showAll} onClick={() => setShowAll((previous) => new Set(previous).add(group.account))}>
                        {t("onboarding.browser.showAll", { count: group.repositories.length, countFormatted: formatNumber(group.repositories.length) })}
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {error && <p className={styles.error} id={error.id} role="alert">{error.text}</p>}
    </div>
  );
}

function RepositoryRow({
  entry: { repository, monitored },
  open,
  onToggle,
  selection,
  onSelect,
}: {
  entry: RepositoryEntry;
  open: boolean;
  onToggle: () => void;
  selection: WorkflowSelection | null;
  onSelect: (selection: WorkflowSelection) => void;
}) {
  const { t } = useTranslation("pipelines");
  const { formatNumber } = useFormatters();
  const panelId = useId();
  const name = repository.fullName.slice(repository.fullName.indexOf("/") + 1);
  const chosen = selection?.repository.repositoryId === repository.repositoryId ? selection.workflow : null;

  return (
    <li className={styles.repository}>
      <button type="button" className={styles.repositoryButton} aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <ChevronRightIcon className={styles.chevron} />
        <span className={styles.repositoryName}>{name}</span>
        <span className={styles.meta}>
          {chosen ? (
            <span className={styles.chosen}>{chosen.name}</span>
          ) : (
            <>
              {repository.defaultBranch && <span className={styles.mono}>{repository.defaultBranch}</span>}
              {monitored.size > 0 && <> · {t("onboarding.browser.monitored", { count: monitored.size, countFormatted: formatNumber(monitored.size) })}</>}
            </>
          )}
        </span>
      </button>
      {open && (
        <div id={panelId} className={styles.workflows}>
          <RepositoryWorkflows repository={repository} monitored={monitored} chosen={chosen} onSelect={onSelect} />
        </div>
      )}
    </li>
  );
}

function RepositoryWorkflows({
  repository,
  monitored,
  chosen,
  onSelect,
}: {
  repository: GitHubRepository;
  monitored: ReadonlyMap<string, string>;
  chosen: GitHubWorkflow | null;
  onSelect: (selection: WorkflowSelection) => void;
}) {
  const { t } = useTranslation("pipelines");
  const workflows = useApiQuery(`github-workflows:${repository.repositoryId}`, (signal) => fetchWorkflows(repository.repositoryId, signal));

  if (workflows.state.status === "loading") return <p className={styles.note} role="status">{t("onboarding.loadingWorkflows")}</p>;
  if (workflows.state.status === "error") {
    return (
      <p className={styles.note} role="alert">
        {t("onboarding.workflowsError")}{" "}
        <button type="button" className={styles.inlineAction} onClick={workflows.reload}>{t("retry")}</button>
      </p>
    );
  }
  if (workflows.state.data.length === 0) return <p className={styles.note}>{t("onboarding.noWorkflows")}</p>;

  return (
    <fieldset className={styles.workflowList}>
      <legend className={styles.srOnly}>{t("onboarding.browser.workflowsOf", { repository: repository.fullName })}</legend>
      {workflows.state.data.map((workflow) => {
        const pipelineId = monitored.get(workflow.workflowId);
        return (
          <div key={workflow.workflowId} className={`${styles.workflow}${pipelineId ? ` ${styles.taken}` : ""}`}>
            <label className={styles.workflowLabel}>
              <input
                type="radio"
                name="workflow"
                value={`${repository.repositoryId}:${workflow.workflowId}`}
                checked={chosen?.workflowId === workflow.workflowId}
                disabled={Boolean(pipelineId)}
                onChange={() => onSelect({ repository, workflow })}
              />
              <span className={styles.workflowText}>
                <span className={styles.workflowName}>{workflow.name}</span>
                {workflow.file && <span className={styles.mono}>{workflow.file.split("/").pop()}</span>}
              </span>
            </label>
            {pipelineId && (
              <span className={styles.takenActions}>
                <StatusBadge tone="success">{t("onboarding.browser.alreadyMonitored")}</StatusBadge>
                <Link className={styles.link} to={pipelineDetailPath(pipelineId)}>{t("onboarding.browser.open")}</Link>
              </span>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
