import type { JourneyStep } from "./journey";

export const GLOSSARY_CATEGORIES = ["flow", "incident", "validation", "access", "ai", "metrics"] as const;
export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number];

export interface GlossaryEntry {
  /** Copy key: `about:glossary.terms.<id>`. */
  id: string;
  category: GlossaryCategory;
  /** The journey step where the term happens, when it has one. */
  step?: JourneyStep;
}

/** Glossary terms in reading order; definitions follow the architecture docs. */
export const GLOSSARY = [
  { id: "monitoredWorkflow", category: "flow", step: "run" },
  { id: "run", category: "flow", step: "run" },
  { id: "sanitization", category: "flow", step: "protect" },
  { id: "evidence", category: "flow", step: "protect" },
  { id: "locator", category: "flow", step: "publish" },
  { id: "correlation", category: "flow", step: "process" },
  { id: "incident", category: "incident", step: "incident" },
  { id: "displayNumber", category: "incident", step: "incident" },
  { id: "severity", category: "incident", step: "incident" },
  { id: "criticality", category: "incident" },
  { id: "stage", category: "incident", step: "incident" },
  { id: "remediation", category: "incident" },
  { id: "verificationRun", category: "incident" },
  { id: "diagnosis", category: "validation", step: "diagnose" },
  { id: "probableCause", category: "validation", step: "diagnose" },
  { id: "recommendation", category: "validation", step: "diagnose" },
  { id: "limitations", category: "validation", step: "diagnose" },
  { id: "validation", category: "validation", step: "validate" },
  { id: "humanInTheLoop", category: "validation", step: "validate" },
  { id: "capabilities", category: "access" },
  { id: "grant", category: "access" },
  { id: "githubApp", category: "access", step: "run" },
  { id: "admission", category: "access" },
  { id: "rag", category: "ai", step: "retrieve" },
  { id: "corpus", category: "ai", step: "retrieve" },
  { id: "embedding", category: "ai", step: "retrieve" },
  { id: "mttr", category: "metrics" },
  { id: "meanDiagnosisTime", category: "metrics" },
  { id: "confirmationRate", category: "metrics" },
  { id: "recurring", category: "metrics" },
] as const satisfies readonly GlossaryEntry[];

export type GlossaryTermId = (typeof GLOSSARY)[number]["id"];

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/**
 * Entries of a category (or all) whose translated term or definition contains
 * every word of the query, ignoring case and accents.
 */
export function filterGlossary<T extends GlossaryEntry>(
  entries: readonly T[],
  { query, category, text }: { query: string; category: GlossaryCategory | "all"; text: (entry: T) => string },
): T[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  return entries.filter(
    (entry) => (category === "all" || entry.category === category) && words.every((word) => normalize(text(entry)).includes(word)),
  );
}
