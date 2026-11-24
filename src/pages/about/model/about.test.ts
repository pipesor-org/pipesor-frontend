import { describe, expect, test } from "bun:test";

import en from "../../../shared/i18n/locales/en/about";
import es from "../../../shared/i18n/locales/es/about";

import { GLOSSARY, filterGlossary } from "./glossary";
import { JOURNEY_STEPS, nextStep, previousStep, stepProgress } from "./journey";

describe("the data journey", () => {
  test("loops forwards and backwards", () => {
    expect(nextStep("validate")).toBe("run");
    expect(previousStep("run")).toBe("validate");
    expect(nextStep("protect")).toBe("publish");
  });

  test("places steps evenly from start to end", () => {
    expect(stepProgress("run")).toBe(0);
    expect(stepProgress("validate")).toBe(1);
  });

  test("every step has copy in both languages", () => {
    for (const step of JOURNEY_STEPS) {
      expect(en.journey.steps[step].title.length).toBeGreaterThan(0);
      expect(es.journey.steps[step].title.length).toBeGreaterThan(0);
    }
  });
});

describe("the glossary", () => {
  const text = (entry: (typeof GLOSSARY)[number]) => `${es.glossary.terms[entry.id].term} ${es.glossary.terms[entry.id].definition}`;

  test("every term has copy in both languages and no term repeats", () => {
    expect(new Set(GLOSSARY.map((entry) => entry.id)).size).toBe(GLOSSARY.length);
    for (const entry of GLOSSARY) {
      expect(en.glossary.terms[entry.id].definition.length).toBeGreaterThan(0);
      expect(es.glossary.terms[entry.id].definition.length).toBeGreaterThan(0);
    }
  });

  test("search ignores case and accents and needs every word", () => {
    expect(filterGlossary(GLOSSARY, { query: "CAUSA probable", category: "all", text }).map((entry) => entry.id)).toContain("probableCause");
    expect(filterGlossary(GLOSSARY, { query: "verificacion", category: "all", text }).map((entry) => entry.id)).toContain("verificationRun");
    expect(filterGlossary(GLOSSARY, { query: "zzz", category: "all", text })).toEqual([]);
  });

  test("a category keeps only its terms", () => {
    const metrics = filterGlossary(GLOSSARY, { query: "", category: "metrics", text });
    expect(metrics.map((entry) => entry.id)).toEqual(["mttr", "meanDiagnosisTime", "confirmationRate", "recurring"]);
  });
});
