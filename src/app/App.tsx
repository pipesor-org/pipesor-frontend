import { Navigate, Route, Routes } from "react-router-dom";

import { NotFoundPage } from "../pages/not-found";
import { OperationsPage } from "../pages/operations";
import { operationsQueuePath, routes } from "../shared/config";

/**
 * Route table for the app.
 *
 * The Operations workspace is a single route: both queues are read projections
 * of the same domain and are selected with the `queue` query parameter
 * (`/operations?queue=active|validation`). The former per-queue URLs are kept as
 * redirects so existing links and bookmarks keep working, and an unknown path
 * renders NotFound instead of silently redirecting.
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
