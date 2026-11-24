import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { configureApiAuth } from "../../../shared/api";
import { fakeFetch, json } from "../../../test/fakeFetch";

import { fetchIncidentQueue, incidentFilterQuery } from "./api";
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
