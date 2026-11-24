/**
 * Standards alignment shown in AI transparency: each Pipesor practice and the
 * principles of recognized frameworks it pursues. An alignment is not a claim
 * of compliance or certification. Words live in `about` under `standards.*`;
 * references that read the same in every language stay here.
 */

export type Framework = "peru31814" | "iso42001" | "iso23894" | "nist" | "owasp";

/**
 * Where the principle is written:
 * - `article`: the Peruvian regulation, worded per language (`standards.articles.<id>`);
 * - `control` / `annex` / `clause`: ISO numbering inside a translated frame;
 * - `literal`: NIST and OWASP identifiers, the same in every language.
 */
export type Reference =
  | { kind: "article"; id: "oversight" | "transparency" | "accountability" | "security" | "privacy" }
  | { kind: "control" | "annex" | "clause"; id: string }
  | { kind: "literal"; text: string };

export interface Alignment {
  /** Key of the principle under `standards.practices.<practice>.principles`. */
  id: string;
  framework: Framework;
  reference: Reference;
}

export interface Practice {
  id: string;
  alignments: readonly Alignment[];
}

const control = (id: string): Reference => ({ kind: "control", id });
const literal = (text: string): Reference => ({ kind: "literal", text });

export const PRACTICES: readonly Practice[] = [
  {
    id: "humanValidation",
    alignments: [
      { id: "oversight", framework: "peru31814", reference: { kind: "article", id: "oversight" } },
      { id: "responsibleUse", framework: "iso42001", reference: control("A.9.2") },
      { id: "oversightProcesses", framework: "nist", reference: literal("MAP 3.5") },
    ],
  },
  {
    id: "noAutomation",
    alignments: [
      { id: "excessiveAgency", framework: "owasp", reference: literal("LLM06:2025 Excessive Agency") },
      { id: "intendedUse", framework: "iso42001", reference: control("A.9.4") },
    ],
  },
  {
    id: "explained",
    alignments: [
      { id: "transparency", framework: "peru31814", reference: { kind: "article", id: "transparency" } },
      { id: "documentation", framework: "iso42001", reference: control("A.8.2") },
      { id: "explainability", framework: "iso23894", reference: { kind: "annex", id: "A.12" } },
      { id: "interpreted", framework: "nist", reference: literal("MEASURE 2.9") },
    ],
  },
  {
    id: "versions",
    alignments: [
      { id: "eventLogs", framework: "iso42001", reference: control("A.6.2.8") },
      { id: "accountability", framework: "nist", reference: literal("MEASURE 2.8") },
      { id: "peruAccountability", framework: "peru31814", reference: { kind: "article", id: "accountability" } },
    ],
  },
  {
    id: "noConfidence",
    alignments: [
      { id: "knowledgeLimits", framework: "nist", reference: literal("MAP 2.2") },
      { id: "misinformation", framework: "owasp", reference: literal("LLM09:2025 Misinformation") },
    ],
  },
  {
    id: "evidenceOnly",
    alignments: [
      { id: "injection", framework: "owasp", reference: literal("LLM01:2025 Prompt Injection") },
      { id: "security", framework: "peru31814", reference: { kind: "article", id: "security" } },
    ],
  },
  {
    id: "strictOutput",
    alignments: [
      { id: "outputHandling", framework: "owasp", reference: literal("LLM05:2025 Improper Output Handling") },
      { id: "verification", framework: "iso42001", reference: control("A.6.2.4") },
    ],
  },
  {
    id: "sanitized",
    alignments: [
      { id: "privacy", framework: "peru31814", reference: { kind: "article", id: "privacy" } },
      { id: "preparation", framework: "iso42001", reference: control("A.7.6") },
      { id: "privacyRisk", framework: "iso23894", reference: { kind: "annex", id: "A.8" } },
      { id: "privacyExamined", framework: "nist", reference: literal("MEASURE 2.10") },
      { id: "disclosure", framework: "owasp", reference: literal("LLM02:2025 Sensitive Information Disclosure") },
    ],
  },
  {
    id: "noTraining",
    alignments: [
      { id: "poisoning", framework: "owasp", reference: literal("LLM04:2025 Data and Model Poisoning") },
      { id: "dataManagement", framework: "iso42001", reference: control("A.7.2") },
    ],
  },
  {
    id: "corpus",
    alignments: [
      { id: "provenance", framework: "iso42001", reference: control("A.7.5") },
      { id: "testData", framework: "iso23894", reference: { kind: "annex", id: "A.4" } },
      { id: "vectors", framework: "owasp", reference: literal("LLM08:2025 Vector and Embedding Weaknesses") },
    ],
  },
  {
    id: "evaluation",
    alignments: [
      { id: "validity", framework: "nist", reference: literal("MEASURE 2.5") },
      { id: "verification", framework: "iso42001", reference: control("A.6.2.4") },
      { id: "reporting", framework: "iso23894", reference: { kind: "clause", id: "6.7" } },
    ],
  },
  {
    id: "limitations",
    alignments: [
      { id: "identification", framework: "iso23894", reference: { kind: "clause", id: "6.4.2" } },
      { id: "knowledgeLimits", framework: "nist", reference: literal("MAP 2.2") },
    ],
  },
  {
    id: "suppliers",
    alignments: [
      { id: "supplierManagement", framework: "iso42001", reference: control("A.10.3") },
      { id: "thirdParty", framework: "nist", reference: literal("MANAGE 3.1") },
      { id: "supplyChain", framework: "owasp", reference: literal("LLM03:2025 Supply Chain") },
    ],
  },
];

/** Gaps the page states openly, after the table. */
export const KNOWN_GAPS = ["rateLimit", "retention", "reviewers"] as const;
