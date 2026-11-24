import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchCollaborators, type GitHubCollaborator } from "../../../entities/github-access";
import { invalidatePipeline, type PipelineCapability, type PipelineGrant } from "../../../entities/monitored-pipeline";
import { isApiError, useApiQuery } from "../../../shared/api";
import { Button } from "../../../shared/ui/button";
import { dataTable } from "../../../shared/ui/data-table";
import { Select, TextInput } from "../../../shared/ui/field";
import { SearchIcon } from "../../../shared/ui/icons";

import { applyAccessChanges } from "../api/grant";
import {
  accessChanges,
  candidates,
  offeredLevels,
  peopleWithAccess,
  type AccessLevel,
  type PersonWithAccess,
} from "../model/access";
import styles from "./PipelinePeople.module.css";

const AVATAR_ORIGIN = "https://avatars.githubusercontent.com/";

type ChangeError = "reconnectRecipient" | "lastConfigurer" | "forbidden" | "network" | "generic";

function changeError(error: unknown): ChangeError {
  if (!isApiError(error)) return "generic";
  if (error.kind === "network") return "network";
  if (error.status === 403 && error.code === "GITHUB_CONNECTION_REQUIRED") return "reconnectRecipient";
  if (error.status === 409 && error.code === "LAST_CONFIGURE_GRANT") return "lastConfigurer";
  if (error.status === 403 || error.status === 404) return "forbidden";
  return "generic";
}

type ListError = "denied" | "reconnect" | "unavailable" | "generic";

function listError(error: unknown): ListError {
  if (!isApiError(error)) return "generic";
  if (error.status === 403) return "denied";
  if (error.status === 409) return "reconnect";
  if (error.status === 503 || error.kind === "network") return "unavailable";
  return "generic";
}

function Avatar({ collaborator }: { collaborator: GitHubCollaborator | null }) {
  const url = collaborator?.avatarUrl?.startsWith(AVATAR_ORIGIN) ? collaborator.avatarUrl : null;
  return url ? (
    <img className={styles.avatar} src={url} alt="" width={24} height={24} loading="lazy" referrerPolicy="no-referrer" />
  ) : (
    <span className={styles.avatar} aria-hidden="true">{collaborator?.login.charAt(0).toUpperCase() ?? "?"}</span>
  );
}

function shortRef(ref: string): string {
  const [tenant, object] = ref.split(":");
  return object ? `${tenant.slice(0, 8)}…:${object.slice(0, 8)}…` : `${ref.slice(0, 12)}…`;
}

interface PipelinePeopleProps {
  pipelineId: string;
  repositoryId: string;
  /** `null` when the grants could not be read (they require CONFIGURE). */
  grants: readonly PipelineGrant[] | null;
  canConfigure: boolean;
  selfRef: string | null;
  /** Reloads the pipeline and its grants after a change. */
  onChanged: () => void;
}

/**
 * `grant-pipeline-access`: who can see, operate and configure this pipeline.
 *
 * People come from GitHub (the repository's collaborators, read with the
 * caller's own authorization); what each may do in Pipesor is an explicit
 * grant (ADR-020/ADR-028). CONFIGURE holders change a person's access level,
 * add collaborators who have signed in to Pipesor, and remove access; the last
 * person who can configure keeps CONFIGURE.
 */
export function PipelinePeople({ pipelineId, repositoryId, grants, canConfigure, selfRef, onChanged }: PipelinePeopleProps) {
  const { t } = useTranslation("pipelines");
  const titleId = useId();
  const searchId = useId();
  const collaborators = useApiQuery(canConfigure ? `collaborators:${repositoryId}` : null, (signal) => fetchCollaborators(repositoryId, signal));
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ principalRef: string; error: ChangeError | null; login: string } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [newLevel, setNewLevel] = useState<Record<string, AccessLevel>>({});

  const list = collaborators.state.status === "success" ? collaborators.state.data : null;
  const people = useMemo(
    () => peopleWithAccess(grants ?? [], list ? { list: list.collaborators, complete: list.complete } : null, selfRef),
    [grants, list, selfRef],
  );
  const toAdd = useMemo(() => (list ? candidates(list.collaborators, grants ?? [], query) : []), [list, grants, query]);

  const nameOf = (person: Pick<PersonWithAccess, "collaborator" | "principalRef">) =>
    person.collaborator ? `@${person.collaborator.login}` : shortRef(person.principalRef);

  async function change(principalRef: string, login: string, current: ReadonlySet<PipelineCapability>, level: AccessLevel | null) {
    setBusy(principalRef);
    setFeedback(null);
    try {
      await applyAccessChanges(pipelineId, principalRef, accessChanges(current, level));
      invalidatePipeline(pipelineId);
      setFeedback({ principalRef, error: null, login });
      setConfirmRemove(null);
      onChanged();
    } catch (error) {
      setFeedback({ principalRef, error: changeError(error), login });
      onChanged();
    } finally {
      setBusy(null);
    }
  }

  const feedbackFor = (principalRef: string) =>
    feedback?.principalRef === principalRef ? (
      feedback.error ? (
        <p className={styles.error} role="alert">{t(`people.errors.${feedback.error}`, { login: feedback.login })}</p>
      ) : (
        <p className={styles.saved} role="status">{t("people.saved")}</p>
      )
    ) : null;

  if (grants === null) return <p className={styles.note}>{t("access.unavailable")}</p>;

  return (
    <div className={styles.root}>
      <div className={dataTable.frame} role="region" tabIndex={0} aria-labelledby={titleId}>
        <table className={`${dataTable.table} ${styles.table}`}>
          <caption id={titleId} className={styles.srOnly}>{t("people.title")}</caption>
          <colgroup><col className={styles.colPerson} /><col className={styles.colRole} /><col className={styles.colAccess} /><col /></colgroup>
          <thead><tr>
            <th scope="col">{t("people.person")}</th>
            <th scope="col">{t("people.githubRole")}</th>
            <th scope="col">{t("people.access")}</th>
            <th scope="col"><span className={styles.srOnly}>{t("people.actions")}</span></th>
          </tr></thead>
          <tbody>{people.map((person) => {
            const name = nameOf(person);
            const levels = offeredLevels(person.collaborator?.role ?? null, person.lastConfigurer);
            const options = levels.includes(person.level) ? levels : [person.level, ...levels];
            const saving = busy === person.principalRef;
            return (
              <tr key={person.principalRef}>
                <th scope="row">
                  <span className={styles.person}>
                    <Avatar collaborator={person.collaborator} />
                    <span className={styles.who}>
                      <span className={person.collaborator ? styles.login : styles.mono} title={person.principalRef}>{name}</span>
                      {person.principalRef === selfRef && <span className={styles.you}>{t("access.you")}</span>}
                      {person.noLongerOnGitHub && <span className={styles.warning}>{t("people.noLongerOnGitHub")}</span>}
                    </span>
                  </span>
                  {feedbackFor(person.principalRef)}
                </th>
                <td>{person.collaborator ? t(`people.role.${person.collaborator.role}`) : <span className={dataTable.muted}>—</span>}</td>
                <td>
                  {canConfigure ? (
                    <Select
                      aria-label={t("people.accessFor", { person: name })}
                      value={person.level}
                      disabled={saving}
                      onChange={(event) => void change(person.principalRef, name, person.capabilities, event.target.value as AccessLevel)}
                    >
                      {options.map((level) => <option key={level} value={level}>{t(`people.level.${level}`)}</option>)}
                    </Select>
                  ) : (
                    t(`people.level.${person.level}`)
                  )}
                </td>
                <td>
                  {canConfigure && !person.lastConfigurer && (
                    confirmRemove === person.principalRef ? (
                      <span className={styles.confirm}>
                        <Button size="sm" loading={saving} disabled={saving} onClick={() => void change(person.principalRef, name, person.capabilities, null)}>
                          {t("people.confirmRemove")}
                        </Button>
                        <Button size="sm" variant="ghost" disabled={saving} onClick={() => setConfirmRemove(null)}>{t("people.cancel")}</Button>
                      </span>
                    ) : (
                      <button type="button" className={styles.remove} disabled={saving} onClick={() => setConfirmRemove(person.principalRef)}>
                        {t("people.remove")}<span className={styles.srOnly}> {name}</span>
                      </button>
                    )
                  )}
                </td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>

      {canConfigure && (
        <div className={styles.add}>
          <Button aria-expanded={adding} onClick={() => setAdding((value) => !value)}>{adding ? t("people.closeAdd") : t("people.add")}</Button>
          {adding && (
            <div className={styles.panel}>
              <p className={styles.note}>{t("people.addDescription")}</p>
              {collaborators.state.status === "loading" && <p className={styles.note} role="status">{t("people.loading")}</p>}
              {collaborators.state.status === "error" && (
                <div className={styles.inline}>
                  <p className={styles.error} role="alert">{t(`people.listErrors.${listError(collaborators.state.error)}`)}</p>
                  <Button size="sm" onClick={collaborators.reload}>{t("retry")}</Button>
                </div>
              )}
              {list && (
                <>
                  <label className={styles.search} htmlFor={searchId}>
                    <span className={styles.srOnly}>{t("people.search")}</span>
                    <TextInput id={searchId} type="search" value={query} placeholder={t("people.search")} icon={<SearchIcon />} autoComplete="off" onChange={(event) => setQuery(event.target.value)} />
                  </label>
                  {toAdd.length === 0 ? (
                    <p className={styles.note}>{query.trim() ? t("people.noMatches") : t("people.everyoneHasAccess")}</p>
                  ) : (
                    <ul className={styles.candidates}>
                      {toAdd.map((collaborator) => {
                        const name = `@${collaborator.login}`;
                        const level = newLevel[collaborator.principalRef] ?? "OPERATE";
                        const saving = busy === collaborator.principalRef;
                        return (
                          <li key={collaborator.principalRef} className={styles.candidate}>
                            <span className={styles.person}>
                              <Avatar collaborator={collaborator} />
                              <span className={styles.who}>
                                <span className={styles.login}>{name}</span>
                                <span className={styles.muted}>{t(`people.role.${collaborator.role}`)}</span>
                              </span>
                            </span>
                            {collaborator.pipesorConnection === "NONE" ? (
                              <span className={styles.muted}>{t("people.notOnPipesor")}</span>
                            ) : (
                              <span className={styles.inline}>
                                <Select
                                  aria-label={t("people.accessFor", { person: name })}
                                  value={level}
                                  disabled={saving}
                                  onChange={(event) => setNewLevel((previous) => ({ ...previous, [collaborator.principalRef]: event.target.value as AccessLevel }))}
                                >
                                  {offeredLevels(collaborator.role, false).map((option) => <option key={option} value={option}>{t(`people.level.${option}`)}</option>)}
                                </Select>
                                <Button size="sm" variant="primary" loading={saving} disabled={saving} onClick={() => void change(collaborator.principalRef, name, new Set(), level)}>
                                  {t("people.addOne")}<span className={styles.srOnly}> {name}</span>
                                </Button>
                              </span>
                            )}
                            {feedbackFor(collaborator.principalRef)}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  {toAdd.some((collaborator) => collaborator.pipesorConnection === "NONE") && (
                    <p className={styles.note}>{t("people.notOnPipesorHint")}</p>
                  )}
                  {!list.complete && <p className={styles.note}>{t("people.truncated")}</p>}
                </>
              )}
            </div>
          )}
        </div>
      )}
      {canConfigure && collaborators.state.status === "error" && !adding && (
        <p className={styles.note}>{t(`people.listErrors.${listError(collaborators.state.error)}`)}</p>
      )}
    </div>
  );
}
