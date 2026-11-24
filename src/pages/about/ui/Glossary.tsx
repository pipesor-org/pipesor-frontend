import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { TextInput } from "../../../shared/ui/field";
import { SearchIcon } from "../../../shared/ui/icons";

import { GLOSSARY, GLOSSARY_CATEGORIES, filterGlossary, type GlossaryCategory } from "../model/glossary";
import type { JourneyStep } from "../model/journey";
import styles from "./Glossary.module.css";

/**
 * Interactive glossary: one search over terms and definitions, topic filters,
 * and, for terms that happen in the data journey, a link to their step.
 */
export function Glossary({ onShowStep }: { onShowStep: (step: JourneyStep) => void }) {
  const { t } = useTranslation("about");
  const titleId = useId();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<GlossaryCategory | "all">("all");

  const visible = useMemo(
    () =>
      filterGlossary(GLOSSARY, {
        query,
        category,
        text: (entry) => `${t(`glossary.terms.${entry.id}.term`)} ${t(`glossary.terms.${entry.id}.definition`)}`,
      }),
    [query, category, t],
  );

  return (
    <section className={styles.glossary} aria-labelledby={titleId}>
      <div className={styles.head}>
        <h2 id={titleId}>{t("glossary.title")}</h2>
        <p>{t("glossary.lead")}</p>
      </div>

      <div className={styles.toolbar}>
        <label className={styles.search} htmlFor={searchId}>
          <span className={styles.srOnly}>{t("glossary.search")}</span>
          <TextInput id={searchId} type="search" value={query} placeholder={t("glossary.search")} icon={<SearchIcon />} autoComplete="off" onChange={(event) => setQuery(event.target.value)} />
        </label>
        <div className={styles.chips} role="group" aria-label={t("glossary.categoriesLabel")}>
          {(["all", ...GLOSSARY_CATEGORIES] as const).map((value) => (
            <button key={value} type="button" className={styles.chip} aria-pressed={category === value} onClick={() => setCategory(value)}>
              {t(`glossary.categories.${value}`)}
            </button>
          ))}
        </div>
        <p className={styles.count} role="status">{t("glossary.count", { count: visible.length })}</p>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>{t("glossary.empty")}</p>
      ) : (
        <dl className={styles.terms}>
          {visible.map((entry) => (
            <div key={entry.id} className={styles.term}>
              <dt>
                <span>{t(`glossary.terms.${entry.id}.term`)}</span>
                <span className={styles.tag}>{t(`glossary.categories.${entry.category}`)}</span>
              </dt>
              <dd>
                {t(`glossary.terms.${entry.id}.definition`)}
                {"step" in entry && (
                  <button type="button" className={styles.link} onClick={() => onShowStep(entry.step)}>
                    {t("glossary.seeInJourney")} <span aria-hidden="true">↑</span>
                  </button>
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
