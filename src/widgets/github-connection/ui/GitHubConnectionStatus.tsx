import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { fetchGitHubConnection } from "../../../entities/github-access";
import { startGitHubSignIn } from "../../../entities/session";
import { useApiQuery } from "../../../shared/api";
import { LEGAL_DOCUMENTS_VERSION } from "../../../shared/config";
import { Button } from "../../../shared/ui/button";
import { StatusBadge } from "../../../shared/ui/status-badge";

import styles from "./GitHubConnectionStatus.module.css";

/**
 * "GitHub Actions · Connected" from `GET /api/v1/github/connection`, with a
 * Reconnect action that repeats the GitHub sign-in and returns to this view
 * (signing in is connecting GitHub, ADR-022).
 */
export function GitHubConnectionStatus() {
  const { t } = useTranslation("pipelines");
  const { pathname } = useLocation();
  const { state } = useApiQuery("github-connection", (signal) => fetchGitHubConnection(signal));
  const connected = state.status === "success" && state.data.locallyLinked;
  const label =
    state.status === "loading"
      ? t("connection.checking")
      : state.status === "error"
        ? t("connection.unavailable")
        : connected
          ? t("connection.connected")
          : t("connection.disconnected");

  return (
    <span className={styles.root}>
      <span role="status">
        <StatusBadge tone={connected ? "success" : "neutral"} variant="dot" live={state.status === "loading"}>
          GitHub Actions · {label}
        </StatusBadge>
      </span>
      {/* Only shown with a session, whose sign-in already accepted the documents in force. */}
      <Button variant="link" onClick={() => startGitHubSignIn(pathname, LEGAL_DOCUMENTS_VERSION)}>
        {t("connection.reconnect")}
      </Button>
    </span>
  );
}
