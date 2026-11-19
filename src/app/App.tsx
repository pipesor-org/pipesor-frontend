import { Navigate, Route, Routes, useLocation, useParams, useSearchParams } from "react-router-dom";

import { selectMonitoredPipelineById } from "../entities/monitored-pipeline";
import { AddMonitoredWorkflowPage } from "../pages/add-monitored-workflow";
import { DiagnosticDemoPage, DiagnosticPanel } from "../pages/diagnostic-demo";
import { HistoryPage } from "../pages/history";
import { NotFoundPage } from "../pages/not-found";
import { OperationsPage } from "../pages/operations";
import { PipelineDetailPage } from "../pages/pipeline-detail";
import { PipelinesPage, pipelineInventoryReturnPath } from "../pages/pipelines";
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

function OperationsRoute() {
  const [search] = useSearchParams();
  const review = search.get("review");
  const replay = import.meta.env.DEV && search.get("queue") === "validation" && review !== null;

  return (
    <OperationsPage>
      {replay && <DiagnosticPanel key={review} requestedId={review} replay />}
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
      <Route path={routes.history} element={<HistoryPage />} />
      <Route path={routes.pipelines} element={<PipelinesPage />} />
      <Route path={routes.addMonitoredWorkflow} element={<AddMonitoredWorkflowRoute />} />
      <Route path={routes.pipelineDetail} element={<PipelineDetailRoute />} />
      {import.meta.env.DEV && <Route path="/diagnostic-demo" element={<DiagnosticDemoPage />} />}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
