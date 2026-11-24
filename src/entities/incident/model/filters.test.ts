import { describe, expect, test } from "bun:test";

import {
  DIAGNOSIS_CRITERIA,
  MAX_QUERY_LENGTH,
  NO_INCIDENT_FILTERS,
  activeQuery,
  hasIncidentFilters,
  matchesIncidentFilters,
  readIncidentFilters,
  returnFiltersState,
  withReturnFilters,
  writeIncidentFilters,
  type IncidentFilters,
} from "./filters";
import type { IncidentStatus } from "./types";

const ACTIVE: readonly IncidentStatus[] = ["Open", "In remediation", "Verification"];

const filters = (patch: Partial<IncidentFilters>): IncidentFilters => ({ ...NO_INCIDENT_FILTERS, ...patch });

const incident = {
  displayNumber: 1060,
  severity: "Critical" as const,
  stage: "Build" as const,
  status: "In remediation" as const,
};
const repository = { repositoryId: "1001", fullName: "pipesor-org/pipesor-validation-scenarios", workflow: "Scenarios" };

describe("criteria in the URL", () => {
  test("round-trip keeps every criterion and the other parameters", () => {
    const criteria = filters({
      q: "scenarios",
      repositories: ["1001", "1002"],
      severities: ["Critical", "Unclassified"],
      stages: ["Quality Gate"],
      statuses: ["In remediation"],
    });
    const url = writeIncidentFilters(new URLSearchParams("queue=active"), criteria);
    expect(url.toString()).toBe(
      "queue=active&q=scenarios&repo=1001&repo=1002&severity=critical&severity=unclassified&stage=quality-gate&status=in-remediation",
    );
    expect(readIncidentFilters(url, ACTIVE)).toEqual(criteria);
  });

  test("unknown or malformed values are dropped, never break the view", () => {
    const url = new URLSearchParams("severity=urgent&severity=HIGH&stage=lint&repo=abc&repo=-1&repo=42&status=resolved");
    expect(readIncidentFilters(url, ACTIVE)).toEqual(filters({ repositories: ["42"], severities: ["High"] }));
  });

  test("a shared link's search is cut to what Pipeline accepts", () => {
    expect(readIncidentFilters(new URLSearchParams({ q: "a".repeat(150) })).q).toHaveLength(MAX_QUERY_LENGTH);
  });

  test("Validation criteria travel as readable tokens where the view offers them", () => {
    const criteria = filters({ diagnoses: ["CORRECTED", "ABSENT"] });
    const url = writeIncidentFilters(new URLSearchParams("view=incidents"), criteria);
    expect(url.toString()).toBe("view=incidents&validation=corrected&validation=none");
    expect(readIncidentFilters(url, [], DIAGNOSIS_CRITERIA)).toEqual(criteria);
    // Operations offers no Validation facet: the criterion is dropped there.
    expect(readIncidentFilters(url, ACTIVE).diagnoses).toEqual([]);
  });

  test("a queue without statuses ignores status criteria", () => {
    expect(readIncidentFilters(new URLSearchParams("status=open"), []).statuses).toEqual([]);
  });

  test("clearing removes the criteria and keeps the queue", () => {
    const url = writeIncidentFilters(new URLSearchParams("queue=validation&severity=high&q=x"), NO_INCIDENT_FILTERS);
    expect(url.toString()).toBe("queue=validation");
  });
});

describe("when criteria are active", () => {
  test("a single letter does not filter; a number does (INC-5)", () => {
    expect(activeQuery(" a ")).toBe("");
    expect(activeQuery("5")).toBe("5");
    expect(hasIncidentFilters(filters({ q: "a" }))).toBe(false);
    expect(hasIncidentFilters(filters({ q: "5" }))).toBe(true);
    expect(hasIncidentFilters(NO_INCIDENT_FILTERS)).toBe(false);
  });
});

describe("matching in the browser", () => {
  test("no criteria match everything", () => {
    expect(matchesIncidentFilters(incident, null, NO_INCIDENT_FILTERS)).toBe(true);
  });

  test("OR within a facet, AND between facets", () => {
    expect(matchesIncidentFilters(incident, repository, filters({ severities: ["High", "Critical"] }))).toBe(true);
    expect(matchesIncidentFilters(incident, repository, filters({ severities: ["Critical"], stages: ["Testing"] }))).toBe(false);
  });

  test("an unclassified incident matches the Unclassified severity", () => {
    expect(matchesIncidentFilters({ ...incident, severity: null }, null, filters({ severities: ["Unclassified"] }))).toBe(true);
    expect(matchesIncidentFilters({ ...incident, severity: null }, null, filters({ severities: ["Critical"] }))).toBe(false);
  });

  test.each([["INC-1060"], ["inc 1060"], ["1060"]])("%p finds the incident by its number", (q) => {
    expect(matchesIncidentFilters(incident, null, filters({ q }))).toBe(true);
    expect(matchesIncidentFilters({ ...incident, displayNumber: 1061 }, null, filters({ q }))).toBe(false);
  });

  test("text matches the repository or the workflow, ignoring case", () => {
    expect(matchesIncidentFilters(incident, repository, filters({ q: "VALIDATION" }))).toBe(true);
    expect(matchesIncidentFilters(incident, repository, filters({ q: "scenarios" }))).toBe(true);
    expect(matchesIncidentFilters(incident, repository, filters({ q: "ingestion" }))).toBe(false);
  });

  test("every word must match, in the repository or the workflow (D04 tokens)", () => {
    expect(matchesIncidentFilters(incident, repository, filters({ q: "validation  scenarios" }))).toBe(true);
    expect(matchesIncidentFilters(incident, repository, filters({ q: "pipesor scenarios" }))).toBe(true);
    expect(matchesIncidentFilters(incident, repository, filters({ q: "validation ingestion" }))).toBe(false);
  });

  test("text is compared in normalized form (NFKC, case)", () => {
    expect(matchesIncidentFilters(incident, repository, filters({ q: "ＳＣＥＮＡＲＩＯＳ" }))).toBe(true);
  });

  test("repository criteria use the GitHub repository id", () => {
    expect(matchesIncidentFilters(incident, repository, filters({ repositories: ["1001"] }))).toBe(true);
    expect(matchesIncidentFilters(incident, repository, filters({ repositories: ["2002"] }))).toBe(false);
  });

  test("undecided until the repository is known", () => {
    expect(matchesIncidentFilters(incident, null, filters({ repositories: ["1001"] }))).toBeNull();
    expect(matchesIncidentFilters(incident, null, filters({ q: "scenarios" }))).toBeNull();
    // Criteria that rule it out already decide.
    expect(matchesIncidentFilters(incident, null, filters({ q: "scenarios", stages: ["Testing"] }))).toBe(false);
  });
});

describe("matching by validation", () => {
  const validation = filters({ diagnoses: ["CONFIRMED", "ABSENT"] });

  test("OR within the facet, including incidents without a diagnosis", () => {
    expect(matchesIncidentFilters(incident, repository, validation, "CONFIRMED")).toBe(true);
    expect(matchesIncidentFilters(incident, repository, validation, "ABSENT")).toBe(true);
    expect(matchesIncidentFilters(incident, repository, validation, "PENDING")).toBe(false);
  });

  test("an unknown diagnosis leaves the match undecided unless another criterion rules it out", () => {
    expect(matchesIncidentFilters(incident, repository, validation)).toBeNull();
    expect(matchesIncidentFilters(incident, repository, filters({ diagnoses: ["CONFIRMED"], stages: ["Testing"] }))).toBe(false);
  });
});

describe("returning from the Workspace", () => {
  test("restores the criteria on the queue path", () => {
    const state = returnFiltersState(filters({ q: "CI", severities: ["High"], statuses: ["Open"] }));
    expect(withReturnFilters("/operations?queue=active", state, ACTIVE)).toBe("/operations?queue=active&q=CI&severity=high&status=open");
  });

  test("no criteria travel when none are set", () => {
    expect(returnFiltersState(NO_INCIDENT_FILTERS)).toBeUndefined();
    expect(withReturnFilters("/operations?queue=active", undefined, ACTIVE)).toBe("/operations?queue=active");
  });

  test("only recognized criteria reach the URL, never other parameters", () => {
    const state = { incidentFilters: "q=x1&next=https%3A%2F%2Fevil.example&severity=urgent&stage=build" };
    expect(withReturnFilters("/history?view=incidents", state, [])).toBe("/history?view=incidents&q=x1&stage=build");
  });

  test("History restores its Validation criteria", () => {
    const state = returnFiltersState(filters({ diagnoses: ["REJECTED"] }));
    expect(withReturnFilters("/history?view=incidents", state, [], DIAGNOSIS_CRITERIA)).toBe("/history?view=incidents&validation=rejected");
  });

  test("foreign state is ignored", () => {
    expect(withReturnFilters("/operations?queue=validation", { pipelineSearch: "q=x" }, [])).toBe("/operations?queue=validation");
    expect(withReturnFilters("/operations?queue=validation", "q=x", [])).toBe("/operations?queue=validation");
  });
});
