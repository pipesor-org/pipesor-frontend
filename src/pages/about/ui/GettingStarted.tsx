import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { rememberInstallReturn } from "../../../entities/session";
import { githubAppInstallUrl, operationsQueuePath, routes } from "../../../shared/config";
import { buttonClassName } from "../../../shared/ui/button";

import styles from "./About.module.css";

type Role = "admin" | "operator" | "configurer";

const STEPS = [
  { id: "install", role: "admin", to: null },
  { id: "register", role: "admin", to: routes.addMonitoredWorkflow },
  { id: "analyze", role: "operator", to: routes.pipelines },
  { id: "validate", role: "operator", to: operationsQueuePath("active") },
  { id: "share", role: "configurer", to: routes.pipelines },
] as const satisfies readonly { id: string; role: Role; to: string | null }[];

/**
 * Getting started: five steps on the same numbered rail as the data journey,
 * each with who does it and a way to do it now. Product links lead through
 * sign-in when there is no session.
 */
export function GettingStarted() {
  const { t } = useTranslation("about");
  return (
    <section className={styles.view} aria-labelledby="about-start">
      <div className={styles.sectionHead}>
        <h2 id="about-start">{t("start.title")}</h2>
        <p>{t("start.lead")}</p>
      </div>
      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.id} className={styles.stepItem} style={{ animationDelay: `${index * 80}ms` }}>
            <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
            <div className={styles.stepCard}>
              <h3>{t(`start.steps.${step.id}.title`)}</h3>
              <p>{t(`start.steps.${step.id}.text`)}</p>
              <div className={styles.stepFoot}>
                <span className={styles.who}>{t("start.who")}: {t(`start.roles.${step.role}`)}</span>
                {step.to ? (
                  <Link className={buttonClassName({ size: "sm" })} to={step.to}>{t(`start.steps.${step.id}.action`)}</Link>
                ) : githubAppInstallUrl ? (
                  <a className={buttonClassName({ size: "sm" })} href={githubAppInstallUrl} rel="noreferrer" onClick={() => rememberInstallReturn(routes.addMonitoredWorkflow)}>
                    {t(`start.steps.${step.id}.action`)} ↗
                  </a>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
