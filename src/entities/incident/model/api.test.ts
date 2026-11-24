import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { configureApiAuth } from "../../../shared/api";
import { fakeFetch, json, problem } from "../../../test/fakeFetch";

import { INSIGHTS_TOP, fetchIncidentInsights, fetchIncidentQueue, fetchIncidentSummary, incidentFilterQuery } from "./api";
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
        diagnoses: ["CONFIRMED", "ABSENT"],
        resolvedWithin: "24h",
      }, Date.parse("2026-11-24T12:00:00Z")),
    ).toEqual({
      resolvedFrom: "2026-11-23T12:00:00.000Z",
      q: "INC-7",
      repositoryId: ["1001"],
      severity: ["CRITICAL", "UNCLASSIFIED"],
      stage: ["QUALITY_GATE"],
      status: ["IN_REMEDIATION"],
      diagnosis: ["CONFIRMED", "ABSENT"],
    });
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

describe("a Resolved period", () => {
  test("sends the same instant on every page of one read (tokens are bound to it)", async () => {
    service = fakeFetch(() => json({ items: [], nextPageToken: null, appliedFilters: {} }));
    const filters = { ...NO_INCIDENT_FILTERS, resolvedWithin: "7d" as const };
    const nowMs = Date.parse("2026-11-24T12:00:00Z");
    await fetchIncidentQueue("RESOLVED", null, { filters, nowMs });
    await fetchIncidentQueue("RESOLVED", "token-2", { filters, nowMs });
    expect(service.requests.map((request) => request.url.searchParams.get("resolvedFrom"))).toEqual([
      "2026-11-17T12:00:00.000Z",
      "2026-11-17T12:00:00.000Z",
    ]);
  });
});

describe("queue order (History)", () => {
  test("is sent with every read, including the next page, and is not a filter", async () => {
    service = fakeFetch(() => json({ items: [], nextPageToken: null, appliedFilters: { sort: "resolvedAt" } }));
    const page = await fetchIncidentQueue("RESOLVED", "token-2", { sort: "resolvedAt" });
    const url = service.requests[0].url;
    expect(url.searchParams.get("sort")).toBe("resolvedAt");
    expect(url.searchParams.get("pageToken")).toBe("token-2");
    expect(page.filteredByService).toBe(false);
  });

  test("is omitted by default (Pipeline's createdAt order)", async () => {
    service = fakeFetch(() => json({ items: [], nextPageToken: null }));
    await fetchIncidentQueue("OPEN", null);
    expect(service.requests[0].url.searchParams.has("sort")).toBe(false);
  });
});

describe("the queue's defining diagnosis (Needs Validation)", () => {
  test("wins over a Validation criterion (no view offers both)", async () => {
    service = fakeFetch(() => json({ items: [], nextPageToken: null, appliedFilters: { diagnosis: ["PENDING"] } }));
    await fetchIncidentQueue("RESOLVED", null, { filters: { ...NO_INCIDENT_FILTERS, diagnoses: ["CONFIRMED"] }, diagnosis: ["PENDING"] });
    expect(service.requests[0].url.searchParams.getAll("diagnosis")).toEqual(["PENDING"]);
  });

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

describe("insights from Pipeline", () => {
  const mean = (meanMs: number | null, sampleSize: number) => ({ meanMs, sampleSize });
  const body = (recurring: unknown[] = []) => ({
    window: { from: "2026-10-25T00:00:00Z", to: "2026-11-23T12:00:00Z" },
    summary: {
      resolvedIncidents: 3,
      confirmed: 1,
      rejected: 1,
      pending: 1,
      confirmationRate: 0.5,
      meanDiagnosis: mean(120000, 2),
      meanResolution: mean(3600000, 3),
    },
    outcomes: { PENDING: 1, CONFIRMED: 1, CORRECTED: 0, REJECTED: 1, ABSENT: 0 },
    // Pipeline breaks ties in its enum order; the view uses the domain's (Testing before Build).
    stages: [
      { stage: "BUILD", count: 1 },
      { stage: "TESTING", count: 1 },
      { stage: "QUALITY_GATE", count: 2 },
    ],
    recurring,
    trend: [{ start: "2026-10-25T00:00:00Z", end: "2026-11-01T00:00:00Z", incidentCount: 1, meanDiagnosisMs: null }],
  });
  const group = (fullName: string, count: number) => ({
    pipelineId: `p-${fullName}`,
    repository: { repositoryId: "1001", fullName },
    workflow: { workflowId: "2001", name: "CI" },
    stage: "TESTING",
    count,
  });

  test("map onto the domain vocabulary and the view's order", async () => {
    service = fakeFetch(() => json(body([group("acme/web", 1), group("acme/api", 1), { ...group("x", 3), repository: null, workflow: null }])));
    const insights = await fetchIncidentInsights();
    expect(service.requests[0].url.pathname).toBe("/api/v1/insights");
    expect(service.requests[0].url.searchParams.get("top")).toBe(String(INSIGHTS_TOP));
    expect(insights?.window).toEqual({ start: "2026-10-25T00:00:00Z", end: "2026-11-23T12:00:00Z" });
    expect(insights?.summary.meanDiagnosis).toEqual({ meanMs: 120000, sampleSize: 2 });
    expect(insights?.stages.map((entry) => entry.stage)).toEqual(["Quality Gate", "Testing", "Build"]);
    expect(insights?.recurring.map((entry) => [entry.repository, entry.workflow, entry.count])).toEqual([
      [null, null, 3],
      ["acme/api", "CI", 1],
      ["acme/web", "CI", 1],
    ]);
    expect(insights?.recurringTruncated).toBe(false);
    expect(insights?.trend[0].meanDiagnosisMs).toBeNull();
  });

  test("a full top list means more groups may exist", async () => {
    service = fakeFetch(() => json(body(Array.from({ length: INSIGHTS_TOP }, (_, index) => group(`acme/r${index}`, 1)))));
    expect((await fetchIncidentInsights())?.recurringTruncated).toBe(true);
  });

  test("an older deployment or an unexpected shape yields null (the view computes them)", async () => {
    service = fakeFetch(() => problem(404, "NOT_FOUND"));
    expect(await fetchIncidentInsights()).toBeNull();
    service.restore();
    service = fakeFetch(() => json({ ...body(), summary: { resolvedIncidents: -1 } }));
    expect(await fetchIncidentInsights()).toBeNull();
  });
});
