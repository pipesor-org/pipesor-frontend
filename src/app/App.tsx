import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { selectMonitoredPipelineById } from "../entities/monitored-pipeline";
import { HistoryPage } from "../pages/history";
import { NotFoundPage } from "../pages/not-found";
import { OperationsPage } from "../pages/operations";
import { PipelineDetailPage } from "../pages/pipeline-detail";
import { operationsQueuePath, routes } from "../shared/config";

function PipelineDetailRoute() {
  const { pipelineId } = useParams<"pipelineId">();
  const pipeline = selectMonitoredPipelineById(pipelineId);
  return pipeline ? <PipelineDetailPage pipeline={pipeline} /> : <NotFoundPage />;
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
      <Route path={routes.operations} element={<OperationsPage />} />
      <Route
        path={routes.operationsActiveIncidentsLegacy}
        element={<Navigate to={operationsQueuePath("active")} replace />}
      />
      <Route
        path={routes.operationsNeedsValidationLegacy}
        element={<Navigate to={operationsQueuePath("validation")} replace />}
      />
      <Route path={routes.history} element={<HistoryPage />} />
      <Route path={routes.pipelineDetail} element={<PipelineDetailRoute />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
