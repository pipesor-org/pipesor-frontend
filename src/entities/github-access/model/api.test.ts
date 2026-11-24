import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { configureApiAuth, resetRequestCaches } from "../../../shared/api";
import { fakeFetch, json, problem } from "../../../test/fakeFetch";

import { DISCOVERY_CAP, DISCOVERY_LIMIT, DISCOVERY_PAGE_SIZE, fetchRepositories, fetchSelfPrincipalRef, fetchWorkflows } from "./api";

const REPOSITORIES = [
  { repositoryId: "101", fullName: "acme/api", defaultBranch: "main" },
  { repositoryId: "102", fullName: "acme/web", defaultBranch: "main" },
];
const CONTEXT = { tenantId: "tenant-1", subjectObjectId: "object-1" };

const many = (count: number) =>
  Array.from({ length: count }, (_, index) => ({ repositoryId: String(1000 + index), fullName: `acme/r${String(index).padStart(4, "0")}` }));

/**
 * Ingestion's discovery as it behaves. Paged form (`pageSize`, `pageToken`):
 * one page and a `nextPageToken`. Legacy form (`limit` only): the complete
 * list, or 503 VERIFICATION_UNAVAILABLE beyond `limit` (it never truncates).
 * An Ingestion without pages (`paged: false`) rejects `pageSize` with 400.
 */
function ingestion(repositories: object[] = REPOSITORIES, { paged = true } = {}) {
  return fakeFetch(({ url }) => {
    const params = url.searchParams;
    const workflows = /^\/api\/v1\/github\/repositories\/[0-9]+\/workflows$/.test(url.pathname);
    if (url.pathname !== "/api/v1/github/repositories" && !workflows) return problem(404, "NOT_FOUND");
    const items = workflows ? [{ workflowId: "7", name: "CI", file: ".github/workflows/ci.yml" }] : repositories;
    const body = (list: object[], nextPageToken?: string | null) =>
      json(workflows ? { context: CONTEXT, workflows: list, nextPageToken } : { context: CONTEXT, repositories: list, nextPageToken });
    if (params.has("pageSize") && params.has("limit")) return problem(400, "INVALID_REQUEST");
    if (params.has("pageSize")) {
      if (!paged) return problem(400, "INVALID_LIMIT");
      const size = Number(params.get("pageSize"));
      const start = Number(params.get("pageToken") ?? 0);
      const next = start + size < items.length ? String(start + size) : null;
      return body(items.slice(start, start + size), next);
    }
    const limit = Number(params.get("limit"));
    if (!Number.isInteger(limit) || limit < 1) return problem(400, "INVALID_LIMIT");
    if (items.length > limit) return problem(503, "VERIFICATION_UNAVAILABLE");
    return body(items);
  });
}

let service: ReturnType<typeof ingestion>;

beforeEach(() => {
  configureApiAuth({ getAccessToken: () => "test-token", onUnauthorized: () => undefined });
  resetRequestCaches();
  service = ingestion();
});

afterEach(() => service.restore());

describe("the caller's principal (Grant me Operate)", () => {
  test("resolves for a caller with two repositories", async () => {
    expect(await fetchSelfPrincipalRef()).toBe("tenant-1:object-1");
  });

  test("reads pages of the backend maximum, never limit=1", async () => {
    await fetchSelfPrincipalRef();
    expect(service.requests).toHaveLength(1);
    expect(service.requests[0].url.searchParams.get("pageSize")).toBe(String(DISCOVERY_PAGE_SIZE));
    expect(service.requests[0].url.searchParams.has("limit")).toBe(false);
  });

  test("the modelled backend rejects a smaller legacy limit, which is the bug this guards", async () => {
    const response = await fetch("http://127.0.0.1:8081/api/v1/github/repositories?limit=1");
    expect(response.status).toBe(503);
  });

  test("reuses the discovery read instead of asking again", async () => {
    await fetchSelfPrincipalRef();
    await fetchSelfPrincipalRef();
    expect(service.requests).toHaveLength(1);
  });

  test("reuses the read the onboarding form already made", async () => {
    await fetchRepositories();
    expect(await fetchSelfPrincipalRef()).toBe("tenant-1:object-1");
    expect(service.requests).toHaveLength(1);
  });

  test("a failed read is not reused", async () => {
    service.restore();
    let calls = 0;
    service = fakeFetch(() => (++calls === 1
      ? problem(503, "VERIFICATION_UNAVAILABLE")
      : json({ context: CONTEXT, repositories: REPOSITORIES, nextPageToken: null })));
    await expect(fetchSelfPrincipalRef()).rejects.toMatchObject({ status: 503, code: "VERIFICATION_UNAVAILABLE" });
    expect(await fetchSelfPrincipalRef()).toBe("tenant-1:object-1");
    expect(service.requests).toHaveLength(2);
  });
});

describe("repository discovery (Add workflow)", () => {
  test("lists both repositories", async () => {
    const list = await fetchRepositories();
    expect(list.repositories.map((repository) => repository.fullName)).toEqual(["acme/api", "acme/web"]);
    expect(list.truncated).toBe(false);
  });

  test("follows the pages: more than 100 repositories no longer fail", async () => {
    service.restore();
    service = ingestion(many(250));
    const list = await fetchRepositories();
    expect(list.repositories).toHaveLength(250);
    expect(list.truncated).toBe(false);
    expect(service.requests.map((request) => request.url.searchParams.get("pageToken"))).toEqual([null, "100", "200"]);
  });

  test("stops at the cap and says so", async () => {
    service.restore();
    service = ingestion(many(DISCOVERY_CAP + 5));
    const list = await fetchRepositories();
    expect(list.repositories).toHaveLength(DISCOVERY_CAP);
    expect(list.truncated).toBe(true);
  });

  test("an Ingestion without pages is read the legacy way", async () => {
    service.restore();
    service = ingestion(REPOSITORIES, { paged: false });
    const list = await fetchRepositories();
    expect(list.repositories).toHaveLength(2);
    expect(service.requests[1].url.searchParams.get("limit")).toBe(String(DISCOVERY_LIMIT));
    expect(await fetchSelfPrincipalRef()).toBe("tenant-1:object-1");
  });

  test("other failures are not retried the legacy way", async () => {
    service.restore();
    service = fakeFetch(() => problem(503, "VERIFICATION_UNAVAILABLE"));
    await expect(fetchRepositories()).rejects.toMatchObject({ status: 503 });
    expect(service.requests).toHaveLength(1);
  });

  test("always reads fresh, so a change made on GitHub shows after refresh", async () => {
    await fetchRepositories();
    await fetchRepositories();
    expect(service.requests).toHaveLength(2);
  });
});

describe("workflow discovery", () => {
  test("reads pages of the selected repository", async () => {
    const workflows = await fetchWorkflows("101");
    expect(workflows.map((workflow) => workflow.name)).toEqual(["CI"]);
    expect(service.requests[0].url.pathname).toBe("/api/v1/github/repositories/101/workflows");
    expect(service.requests[0].url.searchParams.get("pageSize")).toBe(String(DISCOVERY_PAGE_SIZE));
  });
});
