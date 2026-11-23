import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { RegisterWorkflowForm } from "../../../features/onboard-monitored-workflow";
import { pipelineDetailPath } from "../../../shared/config";
import { AppLayout } from "../../../shared/ui/app-layout";
import { buttonClassName } from "../../../shared/ui/button";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { GitHubConnectionStatus } from "../../../widgets/github-connection";

import styles from "./AddMonitoredWorkflowPage.module.css";

/**
 * Add monitored workflow (`/pipelines/new`). Cancel and Back return to the
 * inventory with its recognized criteria; a successful registration opens
 * the new Pipeline Detail, keeping that same return context.
 */
export function AddMonitoredWorkflowPage({ backTo }: { backTo: string }) {
  const { t } = useTranslation("pipelines");
  const navigate = useNavigate();
  const { state } = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);

  return (
    <AppLayout sidebar={<AppSidebar />}>
      <div className={styles.context}>
        <Link className={styles.backLink} to={backTo}>{t("backToPipelines")}</Link>
      </div>
      <header className={styles.header}>
        <h1 ref={headingRef} tabIndex={-1}>{t("onboarding.title")}</h1>
        <p>{t("onboarding.subtitle")}</p>
        <GitHubConnectionStatus />
      </header>
      <RegisterWorkflowForm
        cancel={<Link className={buttonClassName()} to={backTo}>{t("onboarding.cancel")}</Link>}
        onRegistered={(pipeline) => navigate(pipelineDetailPath(pipeline.id), { replace: true, state })}
      />
    </AppLayout>
  );
}
