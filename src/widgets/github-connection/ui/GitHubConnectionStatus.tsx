import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { fetchGitHubConnection } from "../../../entities/github-access";
import { startGitHubSignIn } from "../../../entities/session";
import { useApiQuery } from "../../../shared/api";

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
      <span className={`${styles.status} ${connected ? styles.connected : styles.other}`} role="status">
        <span className={styles.dot} aria-hidden="true" />
        GitHub Actions · {label}
      </span>
      <button type="button" className={styles.reconnect} onClick={() => startGitHubSignIn(pathname)}>
        {t("connection.reconnect")}
      </button>
    </span>
  );
}
