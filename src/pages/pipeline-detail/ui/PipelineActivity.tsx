import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { fetchCollaborators } from "../../../entities/github-access";
import {
  environmentLabel,
  fetchPipelineActivities,
  type PipelineActivityEntry,
} from "../../../entities/monitored-pipeline";
import { useApiQuery } from "../../../shared/api";
import { useFormatters } from "../../../shared/i18n";
import { Button } from "../../../shared/ui/button";

import { describeActivity, type AuditedField, type FieldChange } from "../model/activity";
import styles from "./PipelineActivity.module.css";

const FIELD_LABEL = {
  criticality: "policy.criticality",
  monitoringStatus: "policy.monitoring",
  environment: "policy.environment",
  responsibleTeamNameSnapshot: "ownership.team",
} as const satisfies Record<AuditedField, string>;

function shortRef(ref: string): string {
  const [tenant, object] = ref.split(":");
  return object ? `${tenant.slice(0, 8)}…:${object.slice(0, 8)}…` : `${ref.slice(0, 12)}…`;
}

interface PipelineActivityProps {
  pipelineId: string;
  repositoryId: string;
  canConfigure: boolean;
  selfRef: string | null;
}

/**
 * The pipeline's configuration history (registration, policy, ownership,
 * access), newest first, with who did each change. People are named with
 * their GitHub login when the repository's collaborators can be read; the
 * history requires CONFIGURE, like the people who see it.
 */
export function PipelineActivity({ pipelineId, repositoryId, canConfigure, selfRef }: PipelineActivityProps) {
  const { t } = useTranslation("pipelines");
  const { formatTimestamp } = useFormatters();
  const first = useApiQuery(canConfigure ? `activities:${pipelineId}` : null, (signal) => fetchPipelineActivities(pipelineId, 0, signal));
  const people = useApiQuery(canConfigure ? `activity-people:${repositoryId}` : null, (signal) => fetchCollaborators(repositoryId, signal));
  const [older, setOlder] = useState<{ items: PipelineActivityEntry[]; hasMore: boolean; loading: boolean; failed: boolean } | null>(null);

  const logins = useMemo(
    () => new Map(people.state.status === "success" ? people.state.data.collaborators.map((person) => [person.principalRef, `@${person.login}`]) : []),
    [people.state],
  );

  if (!canConfigure) return <p className={styles.note}>{t("activity.restricted")}</p>;
  if (first.state.status === "loading") return <p className={styles.note} role="status">{t("activity.loading")}</p>;
  if (first.state.status === "error") {
    return (
      <div className={styles.inline}>
        <p className={styles.note} role="alert">{t("activity.error")}</p>
        <Button size="sm" onClick={first.reload}>{t("retry")}</Button>
      </div>
    );
  }

  const items = [...first.state.data.items, ...(older?.items ?? [])];
  const hasMore = older ? older.hasMore : first.state.data.hasMore;
  const name = (ref: string | null | undefined) =>
    !ref ? t("activity.someone") : ref === selfRef ? t("activity.you") : logins.get(ref) ?? shortRef(ref);

  const value = (change: FieldChange, side: "before" | "after") => {
    const raw = change[side];
    if (!raw) return t("activity.none");
    if (change.field === "criticality") return t(`criticality.${raw}` as "criticality.HIGH", { defaultValue: raw });
    if (change.field === "monitoringStatus") return t(`monitoring.${raw}` as "monitoring.ACTIVE", { defaultValue: raw });
    if (change.field === "environment") return environmentLabel(t, raw);
    return raw;
  };

  async function loadOlder() {
    const loaded = older?.items ?? [];
    setOlder({ items: loaded, hasMore: true, loading: true, failed: false });
    try {
      const page = await fetchPipelineActivities(pipelineId, (first.state.status === "success" ? first.state.data.items.length : 0) + loaded.length);
      setOlder({ items: [...loaded, ...page.items], hasMore: page.hasMore, loading: false, failed: false });
    } catch {
      setOlder({ items: loaded, hasMore: true, loading: false, failed: true });
    }
  }

  if (items.length === 0) return <p className={styles.note}>{t("activity.empty")}</p>;

  return (
    <>
      <ol className={styles.timeline}>
        {items.map((entry) => {
          const description = describeActivity(entry);
          let title: string;
          switch (description.kind) {
            case "grant":
            case "revoke":
              title = t(`activity.event.${description.kind}`, {
                capability: description.capability ? t(`access.capability.${description.capability}`) : t("activity.unknownCapability"),
                person: name(description.principalRef),
              });
              break;
            case "other":
              title = t("activity.event.other", { action: description.action });
              break;
            default:
              title = t(`activity.event.${description.kind}`);
          }
          return (
            <li key={entry.id} className={styles.entry}>
              <span className={styles.event}>{title}</span>
              {"changes" in description && description.changes.length > 0 && (
                <ul className={styles.changes}>
                  {description.changes.map((change) => (
                    <li key={change.field}>
                      <span className={styles.field}>{t(FIELD_LABEL[change.field])}</span> {value(change, "before")} <span aria-hidden="true">→</span> {value(change, "after")}
                    </li>
                  ))}
                </ul>
              )}
              <span className={styles.meta}>
                {t("activity.by", { actor: name(entry.actorRef) })} · <time dateTime={entry.occurredAt}>{formatTimestamp(entry.occurredAt)}</time>
              </span>
            </li>
          );
        })}
      </ol>
      {hasMore && (
        <div className={styles.more}>
          {older?.failed && <p className={styles.note} role="alert">{t("activity.error")}</p>}
          <Button size="sm" loading={older?.loading} disabled={older?.loading} onClick={() => void loadOlder()}>
            {older?.loading ? t("activity.loading") : t("activity.loadMore")}
          </Button>
        </div>
      )}
    </>
  );
}
