import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { githubAvatarUrl, rememberInstallReturn, signOut, useSession } from "../../../entities/session";
import { listPipelines, pipelineWorkflowLabel } from "../../../entities/monitored-pipeline";
import { levelOf } from "../../../features/grant-pipeline-access";
import { useApiQuery } from "../../../shared/api";
import { aboutSectionPath, githubAppInstallUrl, githubAuthorizedAppsUrl, pipelineDetailPath, routes } from "../../../shared/config";
import { LanguageSelector, useFormatters } from "../../../shared/i18n";
import { getThemePreference, useTheme, type ThemePreference } from "../../../shared/lib";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Button, buttonClassName } from "../../../shared/ui/button";
import { dataTable } from "../../../shared/ui/data-table";
import { PageHeader } from "../../../shared/ui/page-header";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { GitHubConnectionStatus } from "../../../widgets/github-connection";

import styles from "./SettingsPage.module.css";

const THEMES = ["system", "light", "dark"] as const satisfies readonly ThemePreference[];

/** System, light or dark, as one segmented choice (the profile menu only toggles). */
function ThemeChoice() {
  const { t } = useTranslation("common");
  const { setTheme } = useTheme();
  const [preference, setPreference] = useState<ThemePreference>(getThemePreference);
  return (
    <div className={styles.segment} role="radiogroup" aria-label={t("settings.preferences.theme")}>
      {THEMES.map((value) => (
        <label key={value}>
          <input
            type="radio"
            name="theme"
            value={value}
            checked={preference === value}
            onChange={() => {
              setPreference(value);
              setTheme(value);
            }}
          />
          <span>{t(`settings.preferences.themes.${value}`)}</span>
        </label>
      ))}
    </div>
  );
}

/** Pipelines the caller can see, with their own access level on each. */
function YourAccess() {
  const { t } = useTranslation("common");
  const { t: tp } = useTranslation("pipelines");
  const pipelines = useApiQuery("settings-pipelines", (signal) => listPipelines(signal));

  if (pipelines.state.status === "loading") return <p className={styles.note} role="status">{t("settings.access.loading")}</p>;
  if (pipelines.state.status === "error") {
    return (
      <div className={styles.inline}>
        <p className={styles.note} role="alert">{t("settings.access.error")}</p>
        <Button size="sm" onClick={pipelines.reload}>{tp("retry")}</Button>
      </div>
    );
  }
  const items = pipelines.state.data;
  if (items.length === 0) return <p className={styles.note}>{t("settings.access.empty")}</p>;

  return (
    <div className={dataTable.frame} role="region" tabIndex={0} aria-labelledby="settings-access">
      <table className={`${dataTable.table} ${styles.table}`}>
        <thead><tr>
          <th scope="col">{t("settings.access.workflow")}</th>
          <th scope="col">{t("settings.access.repository")}</th>
          <th scope="col">{t("settings.access.level")}</th>
        </tr></thead>
        <tbody>
          {items.map((pipeline) => (
            <tr key={pipeline.id} className={dataTable.interactiveRow}>
              <th scope="row"><Link className={dataTable.rowLink} to={pipelineDetailPath(pipeline.id)}>{pipelineWorkflowLabel(pipeline) ?? pipeline.githubWorkflowId}</Link></th>
              <td><span className={dataTable.mono}>{pipeline.fullName}</span></td>
              <td>{tp(`people.level.${levelOf(new Set(pipeline.effectiveCapabilities))}`)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Settings (`/settings`): the signed-in account and its session, display
 * preferences, the GitHub connection and the pipelines the person can act on.
 * Everything shown comes from the session, this browser or Pipeline.
 */
export function SettingsPage() {
  const { t } = useTranslation("common");
  const { formatTimestamp } = useFormatters();
  const { session } = useSession();
  const [leaving, setLeaving] = useState(false);
  if (!session) return null;
  const avatar = githubAvatarUrl(session.user.githubUserId, 96);

  return (
    <AppLayout sidebar={<AppSidebar section="settings" />}>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <div className={styles.surface}>
        <section aria-labelledby="settings-profile">
          <h2 id="settings-profile">{t("settings.profile.title")}</h2>
          <div className={styles.profile}>
            {avatar ? <img className={styles.avatar} src={avatar} alt="" width={48} height={48} referrerPolicy="no-referrer" /> : null}
            <div className={styles.who}>
              <p>{t("settings.profile.signedIn", { login: `@${session.user.login}` })}</p>
              <p className={styles.note}>{t("settings.profile.session", { time: formatTimestamp(session.expiresAt) })}</p>
            </div>
            <Button
              loading={leaving}
              disabled={leaving}
              onClick={() => {
                setLeaving(true);
                void signOut();
              }}
            >
              {t("settings.profile.signOut")}
            </Button>
          </div>
          <p className={styles.note}>
            {t("settings.profile.signOutNote")}{" "}
            <a className={styles.link} href={githubAuthorizedAppsUrl} target="_blank" rel="noreferrer">
              {t("settings.profile.revoke")} ↗<span className={styles.srOnly}> ({t("settings.profile.newTab")})</span>
            </a>
          </p>
        </section>

        <section aria-labelledby="settings-preferences">
          <h2 id="settings-preferences">{t("settings.preferences.title")}</h2>
          <div className={styles.fields}>
            <div className={styles.field}><span className={styles.label} aria-hidden="true">{t("settings.preferences.language")}</span><LanguageSelector labelHidden /></div>
            <div className={styles.field}><span className={styles.label} aria-hidden="true">{t("settings.preferences.theme")}</span><ThemeChoice /></div>
          </div>
          <p className={styles.note}>{t("settings.preferences.note")}</p>
        </section>

        <section aria-labelledby="settings-github">
          <h2 id="settings-github">{t("settings.github.title")}</h2>
          <GitHubConnectionStatus />
          <p className={styles.note}>{t("settings.github.text")}</p>
          {githubAppInstallUrl ? (
            <div>
              <a className={buttonClassName({ size: "sm" })} href={githubAppInstallUrl} rel="noreferrer" onClick={() => rememberInstallReturn(routes.settings)}>
                {t("settings.github.manage")} ↗
              </a>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="settings-access">
          <h2 id="settings-access">{t("settings.access.title")}</h2>
          <p className={styles.note}>{t("settings.access.text")}</p>
          <YourAccess />
        </section>

        <section aria-labelledby="settings-browser">
          <h2 id="settings-browser">{t("settings.browser.title")}</h2>
          <ul className={styles.list}>
            {(["session", "preferences", "nothing"] as const).map((item) => <li key={item}>{t(`settings.browser.items.${item}`)}</li>)}
          </ul>
          <Link className={styles.link} to={aboutSectionPath("privacy", "browser")}>{t("settings.browser.more")} →</Link>
        </section>
      </div>
    </AppLayout>
  );
}
