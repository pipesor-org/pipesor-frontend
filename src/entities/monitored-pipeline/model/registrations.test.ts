import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { configureApiAuth } from "../../../shared/api";
import { fakeFetch, json, problem } from "../../../test/fakeFetch";

import { fetchRepositoryRegistrations } from "./api";

let service: ReturnType<typeof fakeFetch> | null = null;

beforeEach(() => configureApiAuth({ getAccessToken: () => "test-token", onUnauthorized: () => undefined }));
afterEach(() => service?.restore());

describe("monitored workflows of a repository (registrations)", () => {
  test("by GitHub workflow id, saying which ones the caller can already see", async () => {
    service = fakeFetch(() =>
      json({
        repositoryId: "101",
        items: [
          { pipelineId: "p-ci", githubWorkflowId: "10", accessible: true },
          { pipelineId: "p-other", githubWorkflowId: "11", accessible: false },
        ],
      }),
    );
    const registrations = await fetchRepositoryRegistrations("101");
    expect(service.requests[0].url.pathname).toBe("/api/v1/pipelines/registrations");
    expect(service.requests[0].url.searchParams.get("repositoryId")).toBe("101");
    expect(registrations?.get("11")).toEqual({ pipelineId: "p-other", accessible: false });
    expect(registrations?.get("10")?.accessible).toBe(true);
  });

  test("an older Pipeline or a refused read yields null (only visible pipelines are marked)", async () => {
    service = fakeFetch(() => problem(404, "NOT_FOUND"));
    expect(await fetchRepositoryRegistrations("101")).toBeNull();
    service.restore();
    service = fakeFetch(() => problem(403, "ACCESS_DENIED"));
    expect(await fetchRepositoryRegistrations("101")).toBeNull();
  });
});
