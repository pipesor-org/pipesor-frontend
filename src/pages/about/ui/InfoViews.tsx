import { useTranslation } from "react-i18next";

import { CheckIcon } from "../../../shared/ui/icons";

import styles from "./About.module.css";

const GLANCE = ["proposes", "minimal", "noTraining", "noLearning", "noAction"] as const;
const RECEIVES = ["evidence", "knowledge", "instructions"] as const;
const NEVER = ["rawLogs", "identity", "secrets"] as const;
const HUMAN = ["probable", "review", "noAction"] as const;
const LIMITS = ["window", "masking", "variance", "expired", "scope"] as const;

/** AI transparency: what the model sees and returns, and where people stay in control. */
export function AiTransparency() {
  const { t } = useTranslation("about");
  return (
    <div className={styles.view}>
      <div className={styles.sectionHead}>
        <h2>{t("ai.title")}</h2>
        <p>{t("ai.lead")}</p>
      </div>

      <section className={styles.glance} aria-labelledby="ai-glance">
        <h3 id="ai-glance">{t("ai.glance.title")}</h3>
        <ul className={styles.checks}>
          {GLANCE.map((item) => <li key={item}><CheckIcon />{t(`ai.glance.items.${item}`)}</li>)}
        </ul>
      </section>

      <div className={styles.cards}>
        <section className={styles.card}>
          <h3>{t("ai.model.title")}</h3>
          <p>{t("ai.model.text")}</p>
        </section>
        <section className={styles.card}>
          <h3>{t("ai.outputs.title")}</h3>
          <p>{t("ai.outputs.text")}</p>
          <p className={styles.callout}>{t("ai.outputs.noConfidence")}</p>
        </section>
      </div>

      <section className={styles.card} aria-labelledby="ai-inputs">
        <h3 id="ai-inputs">{t("ai.inputs.title")}</h3>
        <div className={styles.compare}>
          <div>
            <h4>{t("ai.inputs.receives.title")}</h4>
            <ul className={styles.yes}>{RECEIVES.map((item) => <li key={item}>{t(`ai.inputs.receives.items.${item}`)}</li>)}</ul>
          </div>
          <div>
            <h4>{t("ai.inputs.never.title")}</h4>
            <ul className={styles.no}>{NEVER.map((item) => <li key={item}>{t(`ai.inputs.never.items.${item}`)}</li>)}</ul>
          </div>
        </div>
      </section>

      <div className={styles.cards}>
        <section className={styles.card}>
          <h3>{t("ai.human.title")}</h3>
          <ul className={styles.list}>{HUMAN.map((item) => <li key={item}>{t(`ai.human.items.${item}`)}</li>)}</ul>
        </section>
        <section className={styles.card}>
          <h3>{t("ai.learning.title")}</h3>
          <p>{t("ai.learning.text")}</p>
        </section>
        <section className={styles.card}>
          <h3>{t("ai.evaluation.title")}</h3>
          <p>{t("ai.evaluation.text")}</p>
        </section>
        <section className={styles.card}>
          <h3>{t("ai.limits.title")}</h3>
          <ul className={styles.list}>{LIMITS.map((item) => <li key={item}>{t(`ai.limits.items.${item}`)}</li>)}</ul>
        </section>
      </div>
    </div>
  );
}

const SECURITY = {
  signIn: ["github", "session", "tokens"],
  access: ["explicit", "github", "nothing"],
  github: ["permissions", "noChanges"],
  data: ["minimal", "masking", "logs"],
  infrastructure: ["https", "database", "secrets", "services"],
  browser: ["headers", "storage"],
  audit: ["audit", "reviews"],
} as const;

const LIMIT_ITEMS = ["mfa", "revocation", "gateway", "environment"] as const;

/** Security: the controls in place and the limits accepted for the prototype. */
export function Security() {
  const { t } = useTranslation("about");
  return (
    <div className={styles.view}>
      <div className={styles.sectionHead}>
        <h2>{t("security.title")}</h2>
        <p>{t("security.lead")}</p>
      </div>
      <div className={styles.cards}>
        {(Object.keys(SECURITY) as (keyof typeof SECURITY)[]).map((section) => (
          <section key={section} className={styles.card}>
            <h3>{t(`security.sections.${section}.title`)}</h3>
            <ul className={styles.checks}>
              {SECURITY[section].map((item) => (
                <li key={item}><CheckIcon />{t(`security.sections.${section}.items.${item}` as never)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <section className={`${styles.card} ${styles.limits}`}>
        <h3>{t("security.sections.limits.title")}</h3>
        <ul className={styles.list}>{LIMIT_ITEMS.map((item) => <li key={item}>{t(`security.sections.limits.items.${item}`)}</li>)}</ul>
      </section>
    </div>
  );
}
