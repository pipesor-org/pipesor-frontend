import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

import { completeSignIn, startGitHubSignIn } from "../../../entities/session";
import { isApiError, safeErrorCode } from "../../../shared/api";
import { DEFAULT_OPERATIONS_QUEUE, authRoutes, operationsQueuePath } from "../../../shared/config";

import { Brand } from "./Brand";
import styles from "./SignIn.module.css";

type Failure = { kind: "missing" } | { kind: "network" } | { kind: "rejected"; code: string | null };

/**
 * Target of Ingestion's callback redirect (`/auth/complete?handoff=…`).
 *
 * The one-time handoff is captured once, removed from the address bar and
 * browser history immediately, and exchanged for a session. On success the
 * user continues to the server-confirmed, re-sanitized `returnTo`. A callback
 * failure (`?error=`) is forwarded to the sign-in screen.
 */
export function AuthCompletePage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [handoff] = useState(() => params.get("handoff"));
  const [callbackError] = useState(() => params.get("error"));
  const [failure, setFailure] = useState<Failure | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (callbackError !== null) {
      const code = safeErrorCode(callbackError);
      navigate(code ? `${authRoutes.signIn}?error=${encodeURIComponent(code)}` : authRoutes.signIn, { replace: true });
      return;
    }
    if (!handoff) {
      setFailure({ kind: "missing" });
      return;
    }
    // Drop the single-use value from the URL before anything else can read it.
    navigate(authRoutes.complete, { replace: true });
    let active = true;
    completeSignIn(handoff).then(
      (returnTo) => {
        if (active) navigate(returnTo ?? operationsQueuePath(DEFAULT_OPERATIONS_QUEUE), { replace: true });
      },
      (error: unknown) => {
        if (!active) return;
        if (isApiError(error) && error.kind === "network") setFailure({ kind: "network" });
        else setFailure({ kind: "rejected", code: isApiError(error) ? error.code : null });
      },
    );
    return () => {
      active = false;
    };
  }, [callbackError, handoff, navigate]);

  useEffect(() => {
    if (failure) heading.current?.focus();
  }, [failure]);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Brand />
        {failure ? (
          <>
            <div className={styles.heading}>
              <h1 className={styles.title} ref={heading} tabIndex={-1}>{t("complete.failedTitle")}</h1>
              <p className={styles.text} role="alert">
                {failure.kind === "missing" ? t("complete.missing") : failure.kind === "network" ? t("complete.network") : t("complete.failedText")}
                {failure.kind === "rejected" && failure.code ? (
                  <> <span className={styles.code}>{t("complete.reference", { code: failure.code })}</span></>
                ) : null}
              </p>
            </div>
            <button type="button" className={styles.primary} onClick={() => startGitHubSignIn(null)}>
              {t("complete.tryAgain")}
            </button>
          </>
        ) : (
          <p className={styles.text} role="status">{t("complete.working")}</p>
        )}
      </div>
    </main>
  );
}

