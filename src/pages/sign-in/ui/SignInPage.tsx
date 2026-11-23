import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useSearchParams } from "react-router-dom";

import { startGitHubSignIn, useSession } from "../../../entities/session";
import { safeErrorCode } from "../../../shared/api";
import {
  DEFAULT_OPERATIONS_QUEUE,
  RETURN_TO_PARAM,
  githubAppInstallUrl,
  operationsQueuePath,
  safeReturnPath,
} from "../../../shared/config";
import { LanguageSelector } from "../../../shared/i18n";
import { Button } from "../../../shared/ui/button";
import { ThemeToggle } from "../../../shared/ui/theme-toggle";

import { Brand } from "./Brand";
import styles from "./SignIn.module.css";

/**
 * Entry screen: signing in to Pipesor *is* connecting GitHub (ADR-022).
 *
 * "Continue with GitHub" performs a full-page navigation to Ingestion's
 * `auth/github/start`, forwarding only a sanitized in-app `return_to`. A
 * callback failure arrives as `?error=<code>`; the code is shown only when it
 * is a short identifier. Language and theme stay adjustable before sign-in.
 */
export function SignInPage() {
  const { t } = useTranslation("auth");
  const [params] = useSearchParams();
  const { session, endReason } = useSession();
  const [redirecting, setRedirecting] = useState(false);
  const returnTo = safeReturnPath(params.get(RETURN_TO_PARAM));
  const errorCode = safeErrorCode(params.get("error"));

  if (session) return <Navigate to={returnTo ?? operationsQueuePath(DEFAULT_OPERATIONS_QUEUE)} replace />;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Brand />
        <div className={styles.heading}>
          <h1 className={styles.title}>{t("signIn.title")}</h1>
          <p className={styles.lead}>{t("signIn.lead")}</p>
        </div>

        {errorCode ? (
          <p className={`${styles.notice} ${styles.noticeError}`} role="alert">
            {t("complete.failedText")} <span className={styles.code}>{t("complete.reference", { code: errorCode })}</span>
          </p>
        ) : endReason ? (
          <p className={styles.notice} role="status">{t(`ended.${endReason}`)}</p>
        ) : null}

        <Button
          variant="primary"
          size="lg"
          block
          disabled={redirecting}
          onClick={() => {
            setRedirecting(true);
            startGitHubSignIn(returnTo);
          }}
        >
          {redirecting ? t("signIn.redirecting") : t("signIn.continue")}
        </Button>

        <ul className={styles.points}>
          <li>{t("signIn.points.readOnly")}</li>
          <li>{t("signIn.points.repositories")}</li>
          <li>{t("signIn.points.session")}</li>
        </ul>

        {githubAppInstallUrl ? (
          <a className={styles.link} href={githubAppInstallUrl} target="_blank" rel="noreferrer noopener">
            {t("signIn.manageAccess")} ↗<span className={styles.srOnly}> {t("signIn.opensInNewTab")}</span>
          </a>
        ) : null}

        <section className={styles.preferences} aria-label={t("signIn.preferences")}>
          <LanguageSelector />
          <ThemeToggle />
        </section>
      </div>
    </main>
  );
}
