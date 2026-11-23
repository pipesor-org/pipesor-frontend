import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { RegisterWorkflowForm } from "../../../features/onboard-monitored-workflow";
import { pipelineDetailPath } from "../../../shared/config";
import { AppLayout } from "../../../shared/ui/app-layout";
import { buttonClassName } from "../../../shared/ui/button";
import { ChevronLeftIcon } from "../../../shared/ui/icons";
import { PageHeader } from "../../../shared/ui/page-header";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { GitHubConnectionStatus } from "../../../widgets/github-connection";

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
      <PageHeader
        divider
        headingRef={headingRef}
        back={<Link to={backTo}><ChevronLeftIcon />{t("backToPipelines")}</Link>}
        title={t("onboarding.title")}
        subtitle={t("onboarding.subtitle")}
        meta={<GitHubConnectionStatus />}
      />
      <RegisterWorkflowForm
        cancel={<Link className={buttonClassName()} to={backTo}>{t("onboarding.cancel")}</Link>}
        onRegistered={(pipeline) => navigate(pipelineDetailPath(pipeline.id), { replace: true, state })}
      />
    </AppLayout>
  );
}
