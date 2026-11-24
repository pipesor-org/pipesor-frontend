import { describe, expect, test } from "bun:test";

import en from "../../../shared/i18n/locales/en/about";
import es from "../../../shared/i18n/locales/es/about";

import { LEGAL_DOCUMENTS, type LegalBlock } from "./legal";
import { KNOWN_GAPS, PRACTICES } from "./standards";

/** The text at a dotted path of a catalog, or undefined when the path does not end on a string. */
function lookup(catalog: unknown, path: string): string | undefined {
  const value = path.split(".").reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], catalog);
  return typeof value === "string" ? value : undefined;
}

/** Every key a block renders, relative to its section. */
function blockKeys(block: LegalBlock): string[] {
  switch (block.kind) {
    case "text":
    case "note":
    case "link":
      return [block.key];
    case "list":
      return block.items.map((item) => `${block.key}.${item}`);
    case "table":
      return [
        ...block.columns.map((column) => `${block.key}.columns.${column}`),
        ...block.rows.flatMap((row) => block.columns.map((column) => `${block.key}.rows.${row}.${column}`)),
      ];
    case "contact":
      return [];
  }
}

const catalogs = { en, es };

describe("legal documents", () => {
  for (const [language, catalog] of Object.entries(catalogs)) {
    test(`every section and block has its ${language} text`, () => {
      const missing = Object.entries(LEGAL_DOCUMENTS).flatMap(([document, sections]) =>
        sections.flatMap((section) => {
          const base = `${document}.sections.${section.id}`;
          return [`${base}.title`, ...section.blocks.flatMap(blockKeys).map((key) => `${base}.${key}`)];
        }),
      ).filter((path) => lookup(catalog, path) === undefined);
      expect(missing).toEqual([]);
    });
  }

  test("section ids are unique within each document", () => {
    for (const sections of Object.values(LEGAL_DOCUMENTS)) {
      const ids = sections.map((section) => section.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});

describe("standards alignment", () => {
  for (const [language, catalog] of Object.entries(catalogs)) {
    test(`every practice, principle, framework and reference has its ${language} text`, () => {
      const paths = PRACTICES.flatMap((practice) => [
        `standards.practices.${practice.id}.text`,
        ...practice.alignments.flatMap((alignment) => [
          `standards.practices.${practice.id}.principles.${alignment.id}`,
          `standards.frameworks.${alignment.framework}`,
          ...(alignment.reference.kind === "article"
            ? [`standards.articles.${alignment.reference.id}`]
            : alignment.reference.kind === "literal"
              ? []
              : [`standards.references.${alignment.reference.kind}`]),
        ]),
      ]);
      const gaps = KNOWN_GAPS.map((gap) => `standards.gaps.items.${gap}`);
      expect([...paths, ...gaps].filter((path) => lookup(catalog, path) === undefined)).toEqual([]);
    });
  }

  test("alignments are unique within each practice", () => {
    for (const practice of PRACTICES) {
      const ids = practice.alignments.map((alignment) => alignment.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
