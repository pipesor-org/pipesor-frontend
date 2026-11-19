import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams, useSearchParams } from "react-router-dom";

import {
  IncidentSeverity,
  STAGE_LABEL_KEY,
  STATUS_LABEL_KEY,
  selectDemoIncident,
} from "../../../entities/incident";
import { historyViewPath, isOperationsQueue, operationsQueuePath } from "../../../shared/config";
import { AppLayout } from "../../../shared/ui/app-layout";
import { Badge } from "../../../shared/ui/badge";
import { AppSidebar } from "../../../widgets/app-sidebar";
import { FixtureIncident } from "./FixtureIncident";
import { ReplayDiagnosis } from "./ReplayDiagnosis";
import styles from "./IncidentWorkspace.module.css";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function IncidentWorkspaceRoute() {
  const { t } = useTranslation("operations");
  const { incidentId = "" } = useParams();
  const [search] = useSearchParams();
  const origin = search.get("from");
  const reviewId = search.get("replay");
  const replay = import.meta.env.DEV && reviewId !== null &&
    uuid.test(reviewId) && uuid.test(incidentId);
  const incident = reviewId === null ? selectDemoIncident(incidentId) : undefined;
  const backTo = origin === "history" ? historyViewPath("incidents")
    : operationsQueuePath(isOperationsQueue(origin) ? origin : "active");
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => { heading.current?.focus(); }, [incidentId, reviewId]);

  return (
    <AppLayout sidebar={<AppSidebar section={origin === "history" ? "history" : "operations"} />}>
      <div className={styles.context}>
        <Link to={backTo}>{t(origin === "history" ? "workspace.backHistory" : "workspace.backOperations")}</Link>
        {incident && <Badge variant="outline">{t("demoBadge")}</Badge>}
        {replay && <Badge variant="outline">{t("workspace.replay")}</Badge>}
      </div>
      <header className={styles.header}>
        <h1 ref={heading} tabIndex={-1}>
          {incident ? `${incident.id} · ${incident.repository}` : replay ? incidentId : t("workspace.notFound")}
        </h1>
        {incident && <>
          <p>{incident.workflow}</p>
          <div className={styles.metadata}>
            <IncidentSeverity severity={incident.severity} />
            <span>{t(STATUS_LABEL_KEY[incident.status])}</span>
            <span>{t(STAGE_LABEL_KEY[incident.stage])}</span>
            <span>{incident.assignee ?? t("table.unassigned")}</span>
          </div>
        </>}
        {replay && <p>{t("workspace.replayDescription")}</p>}
      </header>
      {incident && <FixtureIncident incident={incident} />}
      {replay && <ReplayDiagnosis key={`${incidentId}/${reviewId}`} incidentId={incidentId} reviewId={reviewId} />}
      {!incident && !replay && <p>{t("workspace.notFoundDescription")}</p>}
    </AppLayout>
  );
}
