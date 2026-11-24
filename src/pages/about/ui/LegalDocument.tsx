import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import { aboutPath } from "../../../shared/config";
import { useFormatters } from "../../../shared/i18n";
import { dataTable } from "../../../shared/ui/data-table";
import {
  CONTROLLER,
  LEGAL_DOCUMENTS,
  LEGAL_UPDATED_AT,
  legalSectionId,
  type LegalBlock,
  type LegalDocumentId,
} from "../model/legal";

import styles from "./Legal.module.css";

const INTRO: Record<LegalDocumentId, readonly string[]> = {
  privacy: ["prototype", "scope"],
  terms: ["acceptance"],
};

/** The thesis authors with their addresses, as the controller and contact. */
function Contact() {
  const { t } = useTranslation("about");
  return (
    <div className={styles.contact}>
      <p className={styles.team}>{t("legal.team")}</p>
      <ul>
        {CONTROLLER.map((person) => (
          <li key={person.email}>
            <span>{person.name}</span>
            <a href={`mailto:${person.email}`}>{person.email}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Block({ block, base, caption }: { block: LegalBlock; base: string; caption: string }) {
  const { t } = useTranslation("about");
  const text = (key: string) => t(`${base}.${key}` as never) as string;

  switch (block.kind) {
    case "text":
      return <p>{text(block.key)}</p>;
    case "note":
      return <p className={styles.note}>{text(block.key)}</p>;
    case "list":
      return (
        <ul className={styles.list}>
          {block.items.map((item) => <li key={item}>{text(`${block.key}.${item}`)}</li>)}
        </ul>
      );
    case "table":
      return (
        <div className={dataTable.frame}>
          <table className={`${dataTable.table} ${styles.table}`} data-columns={block.columns.length}>
            <caption className={styles.srOnly}>{caption}</caption>
            <thead>
              <tr>
                {block.columns.map((column) => <th key={column} scope="col">{text(`${block.key}.columns.${column}`)}</th>)}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row}>
                  {block.columns.map((column, index) => {
                    const value = text(`${block.key}.rows.${row}.${column}`);
                    return index === 0 ? (
                      <th key={column} scope="row">{value}</th>
                    ) : (
                      <td key={column} data-label={text(`${block.key}.columns.${column}`)}>{value}</td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "contact":
      return <Contact />;
    case "link":
      return "href" in block ? (
        <p className={styles.link}>
          <a href={block.href} target="_blank" rel="noreferrer">
            {text(block.key)} ↗<span className={styles.srOnly}> ({t("legal.external")})</span>
          </a>
        </p>
      ) : (
        <p className={styles.link}><Link to={aboutPath(block.view)}>{text(block.key)} →</Link></p>
      );
  }
}

/**
 * A legal document of the About area (Privacy policy, Terms of use): title,
 * date of the current version, a table of contents and its sections. Section
 * ids double as URL fragments (`/about/privacy#privacy-retention`).
 */
export function LegalDocument({ document }: { document: LegalDocumentId }) {
  const { t } = useTranslation("about");
  const { formatLongDate } = useFormatters();
  const { hash } = useLocation();
  const sections = LEGAL_DOCUMENTS[document];
  const title = (section: string) => t(`${document}.sections.${section}.title` as never) as string;
  const titleId = `${document}-title`;

  const contents = (
    <ol>
      {sections.map((section) => {
        const id = legalSectionId(document, section.id);
        return (
          <li key={section.id}>
            <a href={`#${id}`} aria-current={hash === `#${id}` ? "location" : undefined}>{title(section.id)}</a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <div className={styles.layout}>
      {/* Wide screens: a sticky column. Narrow screens: a collapsed list above the text. Only one is displayed. */}
      <nav className={styles.toc} aria-label={t("legal.contents")}>
        <p className={styles.tocTitle}>{t("legal.contents")}</p>
        {contents}
      </nav>
      <details className={styles.tocCompact}>
        <summary>{t("legal.contents")}</summary>
        <nav aria-label={t("legal.contents")}>{contents}</nav>
      </details>

      <article className={styles.document} aria-labelledby={titleId}>
        <header className={styles.head}>
          <h2 id={titleId}>{t(`${document}.title`)}</h2>
          <p className={styles.updated}>{t("legal.updated", { date: formatLongDate(LEGAL_UPDATED_AT) })}</p>
          {INTRO[document].map((item) => <p key={item}>{t(`${document}.intro.${item}` as never) as string}</p>)}
        </header>

        {sections.map((section) => {
          const id = legalSectionId(document, section.id);
          return (
            <section key={section.id} id={id} className={styles.section} aria-labelledby={`${id}-title`}>
              <h3 id={`${id}-title`}>{title(section.id)}</h3>
              {section.blocks.map((block, index) => (
                <Block key={index} block={block} base={`${document}.sections.${section.id}`} caption={title(section.id)} />
              ))}
            </section>
          );
        })}
      </article>
    </div>
  );
}
