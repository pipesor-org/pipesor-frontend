import { useTranslation } from "react-i18next";

import { dataTable } from "../../../shared/ui/data-table";
import { KNOWN_GAPS, PRACTICES, type Reference } from "../model/standards";

import aboutStyles from "./About.module.css";
import styles from "./StandardsMap.module.css";

/**
 * Standards alignment: each Pipesor practice with the principles it pursues in
 * the Peruvian AI regulation, ISO/IEC 42001 and 23894, the NIST AI RMF and the
 * OWASP Top 10 for LLM. One row group per practice; gaps follow the table.
 */
export function StandardsMap() {
  const { t } = useTranslation("about");

  const reference = (value: Reference): string => {
    switch (value.kind) {
      case "article":
        return t(`standards.articles.${value.id}`);
      case "literal":
        return value.text;
      default:
        return t(`standards.references.${value.kind}`, { id: value.id });
    }
  };

  return (
    <section className={styles.standards} aria-labelledby="ai-standards">
      <div className={aboutStyles.sectionHead}>
        <h2 id="ai-standards">{t("standards.title")}</h2>
        <p>{t("standards.intro")}</p>
      </div>
      <p className={styles.risk}>{t("standards.risk")}</p>

      <div className={dataTable.frame}>
        <table className={`${dataTable.table} ${styles.table}`}>
          <caption className={styles.srOnly}>{t("standards.caption")}</caption>
          <thead>
            <tr>
              <th scope="col">{t("standards.columns.practice")}</th>
              <th scope="col">{t("standards.columns.principle")}</th>
              <th scope="col">{t("standards.columns.framework")}</th>
              <th scope="col">{t("standards.columns.reference")}</th>
            </tr>
          </thead>
          {PRACTICES.map((practice) => (
            <tbody key={practice.id} className={styles.group}>
              {practice.alignments.map((alignment, index) => (
                <tr key={alignment.id}>
                  {index === 0 ? (
                    <th scope="rowgroup" rowSpan={practice.alignments.length} className={styles.practice}>
                      {t(`standards.practices.${practice.id}.text` as never) as string}
                    </th>
                  ) : null}
                  <td>{t(`standards.practices.${practice.id}.principles.${alignment.id}` as never) as string}</td>
                  <td className={styles.framework}>{t(`standards.frameworks.${alignment.framework}`)}</td>
                  <td className={styles.reference}>{reference(alignment.reference)}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
      <p className={styles.editions}>{t("standards.editions")}</p>

      <section className={`${aboutStyles.card} ${aboutStyles.limits}`} aria-labelledby="ai-standards-gaps">
        <h3 id="ai-standards-gaps">{t("standards.gaps.title")}</h3>
        <ul className={aboutStyles.list}>{KNOWN_GAPS.map((gap) => <li key={gap}>{t(`standards.gaps.items.${gap}`)}</li>)}</ul>
      </section>
    </section>
  );
}
