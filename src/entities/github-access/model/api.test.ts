import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { configureApiAuth, resetRequestCaches } from "../../../shared/api";
import { fakeFetch, json, problem } from "../../../test/fakeFetch";

import { DISCOVERY_LIMIT, fetchRepositories, fetchSelfPrincipalRef } from "./api";

const REPOSITORIES = [
  { repositoryId: "101", fullName: "acme/api", defaultBranch: "main" },
  { repositoryId: "102", fullName: "acme/web", defaultBranch: "main" },
];

/**
 * Ingestion's discovery as it behaves: it never truncates. A caller who can see
 * more repositories than `limit` gets 503 VERIFICATION_UNAVAILABLE.
 */
function ingestion(repositories = REPOSITORIES) {
  return fakeFetch(({ url }) => {
    if (url.pathname !== "/api/v1/github/repositories") return problem(404, "NOT_FOUND");
    const limit = Number(url.searchParams.get("limit"));
    if (!Number.isInteger(limit) || limit < 1) return problem(400, "INVALID_LIMIT");
    if (repositories.length > limit) return problem(503, "VERIFICATION_UNAVAILABLE");
    return json({ context: { tenantId: "tenant-1", subjectObjectId: "object-1" }, repositories });
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

  test("asks for the backend maximum, never limit=1", async () => {
    await fetchSelfPrincipalRef();
    expect(service.requests).toHaveLength(1);
    expect(service.requests[0].url.searchParams.get("limit")).toBe(String(DISCOVERY_LIMIT));
    expect(DISCOVERY_LIMIT).toBe(100);
  });

  test("the modelled backend rejects a smaller limit, which is the bug this guards", async () => {
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
      : json({ context: { tenantId: "tenant-1", subjectObjectId: "object-1" }, repositories: REPOSITORIES })));
    await expect(fetchSelfPrincipalRef()).rejects.toMatchObject({ status: 503, code: "VERIFICATION_UNAVAILABLE" });
    expect(await fetchSelfPrincipalRef()).toBe("tenant-1:object-1");
    expect(service.requests).toHaveLength(2);
  });
});

describe("repository discovery (Add workflow)", () => {
  test("lists both repositories", async () => {
    expect((await fetchRepositories()).map((repository) => repository.fullName)).toEqual(["acme/api", "acme/web"]);
  });

  test("always reads fresh, so a change made on GitHub shows after refresh", async () => {
    await fetchRepositories();
    await fetchRepositories();
    expect(service.requests).toHaveLength(2);
  });
});
