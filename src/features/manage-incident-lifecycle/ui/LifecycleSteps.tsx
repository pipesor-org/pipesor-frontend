import { useTranslation } from "react-i18next";

import { STATUS_LABEL_KEY, type IncidentStatus } from "../../../entities/incident";
import { CheckIcon } from "../../../shared/ui/icons";

import styles from "./LifecycleSteps.module.css";

/** The operational lifecycle, in the order its commands move an incident. */
const STEPS = ["Open", "In remediation", "Verification", "Resolved"] as const satisfies readonly IncidentStatus[];

/**
 * Where the incident stands in its lifecycle. Presentation of the recorded
 * status only: steps before it are complete, the current one is marked with
 * `aria-current="step"`, and Resolved counts as complete.
 */
export function LifecycleSteps({ status }: { status: IncidentStatus }) {
  const { t } = useTranslation("operations");
  const current = STEPS.indexOf(status);

  return (
    <div className={styles.frame}>
      <ol className={styles.steps} aria-label={t("lifecycle.progress")}>
        {STEPS.map((step, index) => {
          const done = index < current || (index === current && step === "Resolved");
          const state = done ? ` ${styles.done}` : index === current ? ` ${styles.current}` : "";
          return (
            <li key={step} className={`${styles.step}${state}`} aria-current={index === current ? "step" : undefined}>
              <span className={styles.marker} aria-hidden="true">
                {done ? <CheckIcon /> : index + 1}
              </span>
              <span className={styles.label}>
                {t(STATUS_LABEL_KEY[step])}
                {done && <span className={styles.srOnly}> ({t("lifecycle.stepDone")})</span>}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
