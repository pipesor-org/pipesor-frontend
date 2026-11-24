import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { configureApiAuth } from "../../../shared/api";
import { fakeFetch, json, problem } from "../../../test/fakeFetch";

import { fetchIncidentQueue, fetchIncidentSummary, incidentFilterQuery } from "./api";
import { NO_INCIDENT_FILTERS } from "./filters";

const incident = {
  id: "00000000-0000-4000-8000-000000000001",
  pipelineId: "00000000-0000-4000-8000-000000000002",
  displayNumber: 7,
  status: "OPEN",
  severity: "CRITICAL",
  stage: "BUILD",
  detectedAt: "2026-11-23T10:00:00Z",
};

let service: ReturnType<typeof fakeFetch> | null = null;

beforeEach(() => configureApiAuth({ getAccessToken: () => "test-token", onUnauthorized: () => undefined }));
afterEach(() => service?.restore());

describe("filter parameters for Pipeline", () => {
  test("use the service vocabulary and repeat list values", () => {
    expect(
      incidentFilterQuery({
        q: " INC-7 ",
        repositories: ["1001"],
        severities: ["Critical", "Unclassified"],
        stages: ["Quality Gate"],
        statuses: ["In remediation"],
      }),
    ).toEqual({ q: "INC-7", repositoryId: ["1001"], severity: ["CRITICAL", "UNCLASSIFIED"], stage: ["QUALITY_GATE"], status: ["IN_REMEDIATION"] });
  });

  test("are sent as repeated query parameters", async () => {
    service = fakeFetch(() => json({ items: [], nextPageToken: null, appliedFilters: { severity: ["CRITICAL", "HIGH"] } }));
    await fetchIncidentQueue("OPEN", null, { filters: { ...NO_INCIDENT_FILTERS, severities: ["Critical", "High"] } });
    const url = service.requests[0].url;
    expect(url.searchParams.get("state")).toBe("OPEN");
    expect(url.searchParams.getAll("severity")).toEqual(["CRITICAL", "HIGH"]);
  });

  test("are not sent without criteria", async () => {
    service = fakeFetch(() => json({ items: [incident], nextPageToken: null }));
    const page = await fetchIncidentQueue("OPEN", null, { filters: NO_INCIDENT_FILTERS });
    expect([...service.requests[0].url.searchParams.keys()].sort()).toEqual(["pageSize", "state"]);
    expect(page.filteredByService).toBe(false);
  });
});

describe("knowing whether Pipeline filtered", () => {
  test("an echo of the applied filters means the service filtered", async () => {
    service = fakeFetch(() => json({ items: [incident], nextPageToken: null, total: 1, appliedFilters: { severity: ["CRITICAL"] } }));
    const page = await fetchIncidentQueue("OPEN", null, { filters: { ...NO_INCIDENT_FILTERS, severities: ["Critical"] } });
    expect(page.filteredByService).toBe(true);
    expect(page.total).toBe(1);
  });

  test("without the echo the criteria were ignored (today's service)", async () => {
    service = fakeFetch(() => json({ items: [incident], nextPageToken: "next" }));
    const page = await fetchIncidentQueue("OPEN", null, { filters: { ...NO_INCIDENT_FILTERS, severities: ["Critical"] } });
    expect(page.filteredByService).toBe(false);
    expect(page.total).toBeNull();
  });

  test("an unexpected total or echo shape never fails the queue", async () => {
    service = fakeFetch(() => json({ items: [incident], nextPageToken: null, total: "many", appliedFilters: "yes" }));
    const page = await fetchIncidentQueue("OPEN", null, { filters: { ...NO_INCIDENT_FILTERS, severities: ["Critical"] } });
    expect(page.items).toHaveLength(1);
    expect(page.total).toBeNull();
    expect(page.filteredByService).toBe(false);
  });
});

describe("row facts Pipeline adds to incidents", () => {
  const enriched = {
    ...incident,
    repository: { repositoryId: "1001", fullName: "acme/api" },
    workflow: { workflowId: "2001", name: "CI" },
    diagnosis: { status: "PENDING", probableCause: " Missing secret ", createdAt: "2026-11-23T10:05:00Z" },
  };

  test("repository, workflow and diagnosis come with the row", async () => {
    service = fakeFetch(() => json({ items: [enriched], nextPageToken: null }));
    const [row] = (await fetchIncidentQueue("OPEN", null)).items;
    expect(row.repository).toEqual({ repositoryId: "1001", fullName: "acme/api", workflow: "CI" });
    expect(row.diagnosis).toEqual({ status: "PENDING", probableCause: "Missing secret", createdAt: "2026-11-23T10:05:00Z" });
  });

  test("null diagnosis means none yet; a missing key means not provided", async () => {
    service = fakeFetch(() => json({ items: [{ ...enriched, diagnosis: null }, incident], nextPageToken: null }));
    const [withNull, older] = (await fetchIncidentQueue("OPEN", null)).items;
    expect(withNull.diagnosis).toBeNull();
    expect(older.diagnosis).toBeUndefined();
    expect(older.repository).toBeNull();
  });

  test("an unexpected shape is treated as not provided, never a failed queue", async () => {
    service = fakeFetch(() => json({ items: [{ ...incident, repository: "acme/api", diagnosis: { status: "MAYBE" } }], nextPageToken: null }));
    const [row] = (await fetchIncidentQueue("OPEN", null)).items;
    expect(row.repository).toBeNull();
    expect(row.diagnosis).toBeUndefined();
  });
});

describe("the queue's defining diagnosis (Needs Validation)", () => {
  test("is sent as a criterion even without user filters", async () => {
    service = fakeFetch(() => json({ items: [], nextPageToken: null, total: 0, appliedFilters: { diagnosis: ["PENDING"] } }));
    const page = await fetchIncidentQueue("RESOLVED", null, { diagnosis: ["PENDING"] });
    expect(service.requests[0].url.searchParams.getAll("diagnosis")).toEqual(["PENDING"]);
    expect(page.filteredByService).toBe(true);
  });
});

describe("exact counts (summary)", () => {
  test("maps the service's counts onto the domain vocabulary", async () => {
    service = fakeFetch(() =>
      json({
        total: 30,
        bySeverity: { CRITICAL: 24, HIGH: 5, MEDIUM: 0, LOW: 0, UNCLASSIFIED: 1 },
        byStatus: { OPEN: 20, IN_REMEDIATION: 8, VERIFICATION: 2 },
        byDiagnosis: { PENDING: 3, CONFIRMED: 0, CORRECTED: 0, REJECTED: 0, ABSENT: 27 },
        appliedFilters: { state: "OPEN" },
      }),
    );
    const summary = await fetchIncidentSummary("OPEN");
    expect(summary).toEqual({
      total: 30,
      bySeverity: { Critical: 24, High: 5, Medium: 0, Low: 0, Unclassified: 1 },
      byDiagnosis: { PENDING: 3, CONFIRMED: 0, CORRECTED: 0, REJECTED: 0, ABSENT: 27 },
    });
    expect(service.requests[0].url.pathname).toBe("/api/v1/incidents/summary");
  });

  test("an older deployment without it yields null (the view keeps its figures)", async () => {
    service = fakeFetch(() => problem(400, "INVALID_REQUEST"));
    expect(await fetchIncidentSummary("OPEN")).toBeNull();
  });

  test("a response without the applied criteria is not trusted", async () => {
    service = fakeFetch(() => json({ total: 3, bySeverity: {}, byStatus: {}, byDiagnosis: {} }));
    expect(await fetchIncidentSummary("RESOLVED", { diagnosis: ["PENDING"] })).toBeNull();
  });
});
