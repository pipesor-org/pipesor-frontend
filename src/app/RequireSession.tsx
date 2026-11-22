import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { endSession, getAccessToken, useSession } from "../entities/session";
import { configureApiAuth, resetRequestCaches } from "../shared/api";
import { signInPath } from "../shared/config";

/**
 * Connects the generic API client to the session: requests carry the current
 * bearer token, and a 401 from any service ends the session.
 */
configureApiAuth({
  getAccessToken,
  onUnauthorized: () => endSession("unauthorized"),
});

/**
 * Layout route for every product screen. Without a valid session it sends the
 * user to sign-in, preserving the current in-app path (including the query)
 * so they return to the same view afterwards.
 */
export function RequireSession() {
  const { session } = useSession();
  const location = useLocation();
  const subject = session?.user.githubUserId ?? null;
  // Cached reads belong to one signed-in person; drop them when that changes.
  useEffect(() => resetRequestCaches, [subject]);
  if (!session) return <Navigate to={signInPath(`${location.pathname}${location.search}`)} replace />;
  return <Outlet />;
}
