import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import { AddMonitoredWorkflowPage } from "../pages/add-monitored-workflow";
import { HistoryPage } from "../pages/history";
import { IncidentWorkspaceRoute } from "../pages/incident-workspace";
import { NotFoundPage } from "../pages/not-found";
import { OperationsPage } from "../pages/operations";
import { PipelineDetailPage } from "../pages/pipeline-detail";
import { PipelinesPage, pipelineInventoryReturnPath } from "../pages/pipelines";
import { AuthCompletePage, SignInPage } from "../pages/sign-in";
import { authRoutes, operationsQueuePath, routes } from "../shared/config";
import { RequireSession } from "./RequireSession";

/** Pipelines sub-routes return to the inventory with its recognized criteria only. */
function PipelineDetailRoute() {
  const { state } = useLocation();
  return <PipelineDetailPage backTo={pipelineInventoryReturnPath(state)} />;
}

function AddMonitoredWorkflowRoute() {
  const { state } = useLocation();
  return <AddMonitoredWorkflowPage backTo={pipelineInventoryReturnPath(state)} />;
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
 *
 * `/login` and `/auth/complete` are the only public routes; every product
 * screen sits under `RequireSession`, which redirects to sign-in and returns
 * to the requested path afterwards.
 */
export function App() {
  return (
    <Routes>
      <Route path={authRoutes.signIn} element={<SignInPage />} />
      <Route path={authRoutes.complete} element={<AuthCompletePage />} />
      <Route element={<RequireSession />}>
        <Route path="/" element={<Navigate to={operationsQueuePath("active")} replace />} />
        <Route path={routes.operations} element={<OperationsPage />} />
        <Route path={routes.operationsActiveIncidentsLegacy} element={<Navigate to={operationsQueuePath("active")} replace />} />
        <Route path={routes.operationsNeedsValidationLegacy} element={<Navigate to={operationsQueuePath("validation")} replace />} />
        <Route path={routes.incidentWorkspace} element={<IncidentWorkspaceRoute />} />
        <Route path={routes.history} element={<HistoryPage />} />
        <Route path={routes.pipelines} element={<PipelinesPage />} />
        <Route path={routes.addMonitoredWorkflow} element={<AddMonitoredWorkflowRoute />} />
        <Route path={routes.pipelineDetail} element={<PipelineDetailRoute />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
