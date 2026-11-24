import { describe, expect, test } from "bun:test";

import {
  FILTER_SCOPES,
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

const filters = (patch: Partial<IncidentFilters>): IncidentFilters => ({ ...NO_INCIDENT_FILTERS, ...patch });

const incident = {
  displayNumber: 1060,
  severity: "Critical" as const,
  stage: "Build" as const,
  status: "In remediation" as const,
  resolvedAt: null as string | null,
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
    expect(readIncidentFilters(url, FILTER_SCOPES.active)).toEqual(criteria);
  });

  test("unknown or malformed values are dropped, never break the view", () => {
    const url = new URLSearchParams("severity=urgent&severity=HIGH&stage=lint&repo=abc&repo=-1&repo=42&status=resolved");
    expect(readIncidentFilters(url, FILTER_SCOPES.active)).toEqual(filters({ repositories: ["42"], severities: ["High"] }));
  });

  test("a shared link's search is cut to what Pipeline accepts", () => {
    expect(readIncidentFilters(new URLSearchParams({ q: "a".repeat(150) })).q).toHaveLength(MAX_QUERY_LENGTH);
  });

  test("Validation criteria travel as readable tokens where the view offers them", () => {
    const criteria = filters({ diagnoses: ["CORRECTED", "ABSENT"] });
    const url = writeIncidentFilters(new URLSearchParams("view=incidents"), criteria);
    expect(url.toString()).toBe("view=incidents&validation=corrected&validation=none");
    expect(readIncidentFilters(url, FILTER_SCOPES.history)).toEqual(criteria);
    // Operations offers no Validation facet: the criterion is dropped there.
    expect(readIncidentFilters(url, FILTER_SCOPES.active).diagnoses).toEqual([]);
  });

  test("a queue without statuses ignores status criteria", () => {
    expect(readIncidentFilters(new URLSearchParams("status=open"), FILTER_SCOPES.validation).statuses).toEqual([]);
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
    expect(matchesIncidentFilters(incident, NO_INCIDENT_FILTERS, { repository: null })).toBe(true);
  });

  test("OR within a facet, AND between facets", () => {
    expect(matchesIncidentFilters(incident, filters({ severities: ["High", "Critical"] }), { repository })).toBe(true);
    expect(matchesIncidentFilters(incident, filters({ severities: ["Critical"], stages: ["Testing"] }), { repository })).toBe(false);
  });

  test("an unclassified incident matches the Unclassified severity", () => {
    expect(matchesIncidentFilters({ ...incident, severity: null }, filters({ severities: ["Unclassified"] }), { repository: null })).toBe(true);
    expect(matchesIncidentFilters({ ...incident, severity: null }, filters({ severities: ["Critical"] }), { repository: null })).toBe(false);
  });

  test.each([["INC-1060"], ["inc 1060"], ["1060"]])("%p finds the incident by its number", (q) => {
    expect(matchesIncidentFilters(incident, filters({ q }), { repository: null })).toBe(true);
    expect(matchesIncidentFilters({ ...incident, displayNumber: 1061 }, filters({ q }), { repository: null })).toBe(false);
  });

  test("text matches the repository or the workflow, ignoring case", () => {
    expect(matchesIncidentFilters(incident, filters({ q: "VALIDATION" }), { repository })).toBe(true);
    expect(matchesIncidentFilters(incident, filters({ q: "scenarios" }), { repository })).toBe(true);
    expect(matchesIncidentFilters(incident, filters({ q: "ingestion" }), { repository })).toBe(false);
  });

  test("every word must match, in the repository or the workflow (D04 tokens)", () => {
    expect(matchesIncidentFilters(incident, filters({ q: "validation  scenarios" }), { repository })).toBe(true);
    expect(matchesIncidentFilters(incident, filters({ q: "pipesor scenarios" }), { repository })).toBe(true);
    expect(matchesIncidentFilters(incident, filters({ q: "validation ingestion" }), { repository })).toBe(false);
  });

  test("text is compared in normalized form (NFKC, case)", () => {
    expect(matchesIncidentFilters(incident, filters({ q: "ＳＣＥＮＡＲＩＯＳ" }), { repository })).toBe(true);
  });

  test("repository criteria use the GitHub repository id", () => {
    expect(matchesIncidentFilters(incident, filters({ repositories: ["1001"] }), { repository })).toBe(true);
    expect(matchesIncidentFilters(incident, filters({ repositories: ["2002"] }), { repository })).toBe(false);
  });

  test("undecided until the repository is known", () => {
    expect(matchesIncidentFilters(incident, filters({ repositories: ["1001"] }), { repository: null })).toBeNull();
    expect(matchesIncidentFilters(incident, filters({ q: "scenarios" }), { repository: null })).toBeNull();
    // Criteria that rule it out already decide.
    expect(matchesIncidentFilters(incident, filters({ q: "scenarios", stages: ["Testing"] }), { repository: null })).toBe(false);
  });
});

describe("matching by validation", () => {
  const validation = filters({ diagnoses: ["CONFIRMED", "ABSENT"] });

  test("OR within the facet, including incidents without a diagnosis", () => {
    expect(matchesIncidentFilters(incident, validation, { repository, diagnosis: "CONFIRMED" })).toBe(true);
    expect(matchesIncidentFilters(incident, validation, { repository, diagnosis: "ABSENT" })).toBe(true);
    expect(matchesIncidentFilters(incident, validation, { repository, diagnosis: "PENDING" })).toBe(false);
  });

  test("an unknown diagnosis leaves the match undecided unless another criterion rules it out", () => {
    expect(matchesIncidentFilters(incident, validation, { repository })).toBeNull();
    expect(matchesIncidentFilters(incident, filters({ diagnoses: ["CONFIRMED"], stages: ["Testing"] }), { repository })).toBe(false);
  });
});

describe("the Resolved period", () => {
  const NOW = Date.parse("2026-11-24T12:00:00Z");
  const resolved = (at: string) => ({ ...incident, status: "Resolved" as const, resolvedAt: at });
  const lastWeek = filters({ resolvedWithin: "7d" });

  test("travels in the URL only where the view lists resolved incidents", () => {
    const url = writeIncidentFilters(new URLSearchParams("queue=validation"), lastWeek);
    expect(url.toString()).toBe("queue=validation&resolved=7d");
    expect(readIncidentFilters(url, FILTER_SCOPES.validation).resolvedWithin).toBe("7d");
    expect(readIncidentFilters(url, FILTER_SCOPES.active).resolvedWithin).toBeNull();
    expect(readIncidentFilters(new URLSearchParams("resolved=1y"), FILTER_SCOPES.history).resolvedWithin).toBeNull();
    expect(hasIncidentFilters(lastWeek)).toBe(true);
  });

  test("matches resolutions inside the rolling window, measured from the read", () => {
    expect(matchesIncidentFilters(resolved("2026-11-20T00:00:00Z"), lastWeek, { repository, nowMs: NOW })).toBe(true);
    expect(matchesIncidentFilters(resolved("2026-11-17T12:00:00Z"), lastWeek, { repository, nowMs: NOW })).toBe(true);
    expect(matchesIncidentFilters(resolved("2026-11-17T11:59:59Z"), lastWeek, { repository, nowMs: NOW })).toBe(false);
    expect(matchesIncidentFilters(incident, lastWeek, { repository, nowMs: NOW })).toBe(false);
  });
});

describe("returning from the Workspace", () => {
  test("restores the criteria on the queue path", () => {
    const state = returnFiltersState(filters({ q: "CI", severities: ["High"], statuses: ["Open"] }));
    expect(withReturnFilters("/operations?queue=active", state, FILTER_SCOPES.active)).toBe("/operations?queue=active&q=CI&severity=high&status=open");
  });

  test("no criteria travel when none are set", () => {
    expect(returnFiltersState(NO_INCIDENT_FILTERS)).toBeUndefined();
    expect(withReturnFilters("/operations?queue=active", undefined, FILTER_SCOPES.active)).toBe("/operations?queue=active");
  });

  test("only recognized criteria reach the URL, never other parameters", () => {
    const state = { incidentFilters: "q=x1&next=https%3A%2F%2Fevil.example&severity=urgent&stage=build" };
    expect(withReturnFilters("/history?view=incidents", state, FILTER_SCOPES.history)).toBe("/history?view=incidents&q=x1&stage=build");
  });

  test("History restores its Validation criteria", () => {
    const state = returnFiltersState(filters({ diagnoses: ["REJECTED"] }));
    expect(withReturnFilters("/history?view=incidents", state, FILTER_SCOPES.history)).toBe("/history?view=incidents&validation=rejected");
  });

  test("foreign state is ignored", () => {
    expect(withReturnFilters("/operations?queue=validation", { pipelineSearch: "q=x" }, FILTER_SCOPES.validation)).toBe("/operations?queue=validation");
    expect(withReturnFilters("/operations?queue=validation", "q=x", FILTER_SCOPES.validation)).toBe("/operations?queue=validation");
  });
});
