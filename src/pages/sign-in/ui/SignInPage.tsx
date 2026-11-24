import { useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, Navigate, useSearchParams } from "react-router-dom";

import { readInstallReturn, rememberInstallReturn, startGitHubSignIn, useSession } from "../../../entities/session";
import { safeErrorCode } from "../../../shared/api";
import {
  DEFAULT_OPERATIONS_QUEUE,
  RETURN_TO_PARAM,
  aboutPath,
  githubAppInstallUrl,
  operationsQueuePath,
  routes,
  safeReturnPath,
} from "../../../shared/config";
import { LanguageSelector } from "../../../shared/i18n";
import { Button } from "../../../shared/ui/button";
import { CheckIcon } from "../../../shared/ui/icons";
import { Notice } from "../../../shared/ui/notice";
import { StandalonePage } from "../../../shared/ui/standalone-page";
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
 *
 * Signing in is also where consent is given: an unchecked box accepting the
 * Privacy policy (with the transfer to the United States) and the Terms of use
 * must be checked before leaving for GitHub.
 *
 * Installing the GitHub App happens in this tab (the session is tab-scoped);
 * the onboarding path saved before leaving is where sign-in continues when no
 * other destination was requested.
 */
export function SignInPage() {
  const { t } = useTranslation("auth");
  const [params] = useSearchParams();
  const { session, endReason } = useSession();
  const [redirecting, setRedirecting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [consentMissing, setConsentMissing] = useState(false);
  const consentBox = useRef<HTMLInputElement>(null);
  const returnTo = safeReturnPath(params.get(RETURN_TO_PARAM));
  const errorCode = safeErrorCode(params.get("error"));

  if (session) return <Navigate to={returnTo ?? readInstallReturn() ?? operationsQueuePath(DEFAULT_OPERATIONS_QUEUE)} replace />;

  return (
    <StandalonePage>
      <Brand />
      <div className={styles.heading}>
        <h1 className={styles.title}>{t("signIn.title")}</h1>
        <p className={styles.lead}>{t("signIn.lead")}</p>
      </div>

      {errorCode ? (
        <Notice tone="critical" role="alert">
          {t("complete.failedText")} <span className={styles.code}>{t("complete.reference", { code: errorCode })}</span>
        </Notice>
      ) : endReason ? (
        <Notice tone="info" role="status">{t(`ended.${endReason}`)}</Notice>
      ) : null}

      <div className={styles.consent}>
        <input
          ref={consentBox}
          id="sign-in-consent"
          type="checkbox"
          checked={accepted}
          aria-invalid={consentMissing || undefined}
          aria-describedby={consentMissing ? "sign-in-consent-error" : undefined}
          onChange={(event) => {
            setAccepted(event.target.checked);
            if (event.target.checked) setConsentMissing(false);
          }}
        />
        <label htmlFor="sign-in-consent">
          <Trans
            t={t}
            i18nKey="signIn.consent"
            components={{ privacy: <Link to={aboutPath("privacy")} />, terms: <Link to={aboutPath("terms")} /> }}
          />
        </label>
      </div>
      {consentMissing ? (
        <p id="sign-in-consent-error" className={styles.consentError} role="alert">{t("signIn.consentRequired")}</p>
      ) : null}

      <Button
        variant="primary"
        size="lg"
        block
        disabled={redirecting}
        loading={redirecting}
        onClick={() => {
          if (!accepted) {
            setConsentMissing(true);
            consentBox.current?.focus();
            return;
          }
          setRedirecting(true);
          startGitHubSignIn(returnTo);
        }}
      >
        {redirecting ? t("signIn.redirecting") : t("signIn.continue")}
      </Button>

      <ul className={styles.points}>
        {(["readOnly", "repositories", "session"] as const).map((point) => (
          <li key={point}><CheckIcon />{t(`signIn.points.${point}`)}</li>
        ))}
      </ul>

      {githubAppInstallUrl ? (
        <a className={styles.link} href={githubAppInstallUrl} rel="noreferrer" onClick={() => rememberInstallReturn(routes.addMonitoredWorkflow)}>
          {t("signIn.manageAccess")} ↗
        </a>
      ) : null}

      <nav className={styles.about} aria-label={t("signIn.about.label")}>
        <Link to={aboutPath("how-it-works")}>{t("signIn.about.howItWorks")}</Link>
        <Link to={aboutPath("ai")}>{t("signIn.about.ai")}</Link>
        <Link to={aboutPath("security")}>{t("signIn.about.security")}</Link>
      </nav>

      <section className={styles.preferences} aria-label={t("signIn.preferences")}>
        <LanguageSelector />
        <ThemeToggle />
      </section>
    </StandalonePage>
  );
}
