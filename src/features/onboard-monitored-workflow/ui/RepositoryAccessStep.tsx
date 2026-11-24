import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import type { GitHubRepository } from "../../../entities/github-access";
import { clearInstallReturn, rememberInstallReturn } from "../../../entities/session";
import { githubAppInstallUrl } from "../../../shared/config";
import { Button, buttonClassName } from "../../../shared/ui/button";
import { Notice } from "../../../shared/ui/notice";

import styles from "./RegisterWorkflowForm.module.css";

type SetupReturn = "install" | "update" | null;

/**
 * Step before choosing a workflow: which repositories Pipesor can see, and the
 * way to widen that. Repository and organization selection happens on
 * GitHub's own installation page for the Pipesor GitHub App; the dashboard
 * only links there and refreshes discovery afterwards.
 *
 * The installation opens in this tab: the session lives in this tab's
 * `sessionStorage`, which a new tab would not have (GitHub's redirect would
 * then land signed out). The onboarding path is saved before leaving so a
 * sign-in on return still continues here.
 *
 * When the App's Setup URL points back here, GitHub appends
 * `installation_id` and `setup_action`; they are acknowledged once and
 * removed from the address bar (they grant nothing on their own).
 */
export function RepositoryAccessStep({
  repositories,
  loading,
  onRefresh,
}: {
  repositories: readonly GitHubRepository[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const { t } = useTranslation("pipelines");
  const navigate = useNavigate();
  const { pathname, search, state } = useLocation();
  const [setupReturn, setSetupReturn] = useState<SetupReturn>(null);

  // Back in the onboarding flow: the saved return path has done its job.
  useEffect(() => clearInstallReturn(), []);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const action = params.get("setup_action");
    if (!params.has("installation_id") && !action) return;
    setSetupReturn(action === "install" || action === "update" ? action : "update");
    params.delete("installation_id");
    params.delete("setup_action");
    navigate({ pathname, search: params.size ? `?${params}` : "" }, { replace: true, state });
  }, [navigate, pathname, search, state]);

  return (
    <section aria-labelledby="repository-access-title">
      <h2 id="repository-access-title">{t("onboarding.access.title")}</h2>
      <p className={styles.note}>{t("onboarding.access.description")}</p>

      {setupReturn && (
        <Notice tone="success" role="status">{t(`onboarding.access.returned.${setupReturn}`)}</Notice>
      )}

      {/* What is available is browsed below, grouped by account; here only its absence needs saying. */}
      {!loading && repositories.length === 0 && <p>{t("onboarding.access.none")}</p>}

      <div className={styles.inline}>
        {githubAppInstallUrl ? (
          <a className={buttonClassName({ variant: "secondary" })} href={githubAppInstallUrl} rel="noreferrer" onClick={() => rememberInstallReturn(pathname)}>
            {t("onboarding.access.choose")} ↗
          </a>
        ) : (
          <p className={styles.note}>{t("onboarding.access.installUnavailable")}</p>
        )}
        <Button onClick={onRefresh} disabled={loading}>{t("onboarding.access.refresh")}</Button>
      </div>

      <p className={styles.note}>{t("onboarding.access.admission")}</p>
    </section>
  );
}
