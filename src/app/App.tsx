import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, Route, Routes, useLocation, useParams, useSearchParams } from "react-router-dom";

import { readPilotCatalog, registrationPilot, selectMonitoredPipelineById, usePilotPipelineRead } from "../entities/monitored-pipeline";
import { AddMonitoredWorkflowPage } from "../pages/add-monitored-workflow";
import { DiagnosticDemoPage, DiagnosticPanel } from "../pages/diagnostic-demo";
import { HistoryPage } from "../pages/history";
import { IncidentWorkspaceRoute } from "../pages/incident-workspace";
import { NotFoundPage } from "../pages/not-found";
import { OperationsPage } from "../pages/operations";
import { PipelineDetailPage } from "../pages/pipeline-detail";
import { PipelinesPage, pipelineInventoryReturnPath } from "../pages/pipelines";
import { AppLayout } from "../shared/ui/app-layout";
import { Badge } from "../shared/ui/badge";
import { AppSidebar } from "../widgets/app-sidebar";
import { OperationalPilot } from "../widgets/operational-pilot";
import { operationsQueuePath, routes } from "../shared/config";

function PipelineDetailRoute() {
  const { pipelineId } = useParams<"pipelineId">();
  const { state } = useLocation();
  const pipeline = selectMonitoredPipelineById(pipelineId);
  return pipeline ? <PipelineDetailPage pipeline={pipeline} backTo={pipelineInventoryReturnPath(state)} /> : <NotFoundPage />;
}

function AddMonitoredWorkflowRoute() {
  const { state } = useLocation();
  return <AddMonitoredWorkflowPage backTo={pipelineInventoryReturnPath(state)} />;
}

const registrationCatalog = registrationPilot ? readPilotCatalog() : undefined;

function PilotShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation("pipelines");
  return <AppLayout sidebar={<AppSidebar />}>
    <header><h1>{t("inventory.title")}</h1><Badge variant="outline">{t("pilot.badge")}</Badge></header>
    {children}
  </AppLayout>;
}

function PilotReadRoute({ token, detail = false }: { token: string; detail?: boolean }) {
  const { pipelineId } = useParams();
  const { t } = useTranslation("pipelines");
  const { state } = useLocation();
  const result = usePilotPipelineRead(token, detail ? pipelineId : undefined);
  if (!result?.records) {
    return <PilotShell>{result?.error
      ? <p role="alert">{t(`pilot.${result.error}`)}</p>
      : <p role="status">{t("pilot.loading")}</p>}</PilotShell>;
  }
  if (detail) {
    return <PipelineDetailPage key={result.records[0].id} pipeline={result.records[0]}
      token={token} backTo={pipelineInventoryReturnPath(state)} />;
  }
  return <PipelinesPage records={result.records} />;
}

function PilotAddRoute({ token }: { token: string }) {
  const { state } = useLocation();
  return <AddMonitoredWorkflowPage backTo={pipelineInventoryReturnPath(state)} pilot={{ catalog: registrationCatalog, token }} />;
}

function OperationsRoute() {
  const [search] = useSearchParams();
  const pilot = import.meta.env.DEV && search.get("pilot") === "1";
  const review = search.get("review");
  const replay = import.meta.env.DEV && search.get("queue") === "validation" && review !== null;

  return (
    <OperationsPage pilot={pilot}>
      {pilot ? <OperationalPilot /> : replay && <DiagnosticPanel key={review} requestedId={review} replay />}
    </OperationsPage>
  );
}

/**
 * Route table for the app.
 *
 * `/operations` is a single route: both queues are read projections of the same
 * domain and are selected with the `queue` query parameter
 * (`/operations?queue=active|validation`). The former per-queue URLs are kept as
 * redirects so existing links and bookmarks keep working. `/history` follows the
 * same pattern with `?view=incidents|insights`. An unknown path renders NotFound
 * instead of silently redirecting.
 */
export function App() {
  const { t } = useTranslation("pipelines");
  const [token, setToken] = useState("");
  function pilot(element: ReactNode, fallback: ReactNode) {
    if (!registrationPilot) return fallback;
    if (token) return element;
    return <PilotShell>
      <form onSubmit={(event) => {
        event.preventDefault();
        setToken(String(new FormData(event.currentTarget).get("token") ?? "").trim());
      }}>
        <label>{t("pilot.token")} <input name="token" type="password" autoComplete="off" maxLength={4096} required /></label>
        <button type="submit">{t("pilot.connect")}</button>
      </form>
    </PilotShell>;
  }
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={operationsQueuePath("active")} replace />}
      />
      <Route path={routes.operations} element={<OperationsRoute />} />
      <Route
        path={routes.operationsActiveIncidentsLegacy}
        element={<Navigate to={operationsQueuePath("active")} replace />}
      />
      <Route
        path={routes.operationsNeedsValidationLegacy}
        element={<Navigate to={operationsQueuePath("validation")} replace />}
      />
      <Route path={routes.incidentWorkspace} element={<IncidentWorkspaceRoute />} />
      <Route path={routes.history} element={<HistoryPage />} />
      <Route path={routes.pipelines} element={pilot(<PilotReadRoute token={token} />, <PipelinesPage />)} />
      <Route path={routes.addMonitoredWorkflow} element={pilot(<PilotAddRoute token={token} />, <AddMonitoredWorkflowRoute />)} />
      <Route path={routes.pipelineDetail} element={pilot(<PilotReadRoute token={token} detail />, <PipelineDetailRoute />)} />
      {import.meta.env.DEV && <Route path="/diagnostic-demo" element={<DiagnosticDemoPage />} />}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
