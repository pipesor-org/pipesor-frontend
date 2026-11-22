import { useSyncExternalStore } from "react";

import { getSessionState, subscribeSession, type SessionState } from "./session";

/** Reactive view of the current session and the reason the last one ended. */
export function useSession(): SessionState {
  return useSyncExternalStore(subscribeSession, getSessionState);
}
