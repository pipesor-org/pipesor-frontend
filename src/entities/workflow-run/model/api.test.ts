import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { configureApiAuth } from "../../../shared/api";
import { fakeFetch, json, problem } from "../../../test/fakeFetch";

import { fetchRunAnalysis } from "./api";

const target = { repositoryId: "101", workflowId: "201", runId: "301", attempt: 1 };

let service: ReturnType<typeof fakeFetch> | null = null;

beforeEach(() => {
  configureApiAuth({ getAccessToken: () => "test-token", onUnauthorized: () => undefined });
});

afterEach(() => service?.restore());

describe("a run's analysis receipt", () => {
  test("404 ANALYSIS_NOT_FOUND means not analyzed yet, not a failure", async () => {
    service = fakeFetch(() => problem(404, "ANALYSIS_NOT_FOUND"));
    expect(await fetchRunAnalysis(target)).toBeNull();
  });

  test("another 404 is still an error", async () => {
    service = fakeFetch(() => problem(404, "WORKFLOW_NOT_FOUND"));
    await expect(fetchRunAnalysis(target)).rejects.toMatchObject({ status: 404, code: "WORKFLOW_NOT_FOUND" });
  });

  test("a server failure is an error, not 'not analyzed'", async () => {
    service = fakeFetch(() => problem(503, "VERIFICATION_UNAVAILABLE"));
    await expect(fetchRunAnalysis(target)).rejects.toMatchObject({ status: 503 });
  });

  test("a receipt is returned as read", async () => {
    service = fakeFetch(() => json({ analysisId: "00000000-0000-4000-8000-000000000001", phase: "PUBLISHED", incidentId: "00000000-0000-4000-8000-000000000002" }));
    expect((await fetchRunAnalysis(target))?.phase).toBe("PUBLISHED");
    expect(service.requests[0].url.pathname).toBe("/api/v1/github/repositories/101/workflows/201/runs/301/attempts/1/analysis");
  });
});
