import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import { configureApiAuth, resetRequestCaches } from "../../../shared/api";
import { fakeFetch, json, problem } from "../../../test/fakeFetch";

import { loadWorkspace } from "./loadWorkspace";

const ID = "00000000-0000-4000-8000-000000000001";
const PIPELINE_ID = "00000000-0000-4000-8000-000000000002";

const incident = {
  id: ID,
  pipelineId: PIPELINE_ID,
  displayNumber: 7,
  status: "OPEN",
  severity: "CRITICAL",
  stage: "BUILD",
  detectedAt: "2026-11-23T10:00:00Z",
  repository: { repositoryId: "1001", fullName: "acme/api" },
  workflow: { workflowId: "2001", name: "CI" },
  diagnosis: { status: "PENDING", probableCause: "Missing secret", createdAt: "2026-11-23T10:05:00Z" },
};

let service: ReturnType<typeof fakeFetch> | null = null;

beforeEach(() => {
  configureApiAuth({ getAccessToken: () => "test-token", onUnauthorized: () => undefined });
  resetRequestCaches();
});
afterEach(() => service?.restore());

describe("the Workspace read model", () => {
  test("names the repository and workflow from the incident when the pipeline cannot be read", async () => {
    service = fakeFetch(({ url }) =>
      url.pathname === `/api/v1/incidents/${ID}` ? json(incident) : problem(503, "UNAVAILABLE"),
    );
    const data = await loadWorkspace(ID, new AbortController().signal);
    expect(data.pipeline).toBeNull();
    expect(data.repository).toBe("acme/api");
    expect(data.workflow).toBe("CI");
    expect(data.incident.diagnosis?.status).toBe("PENDING");
  });

  test("without either source, both are unavailable rather than invented", async () => {
    const older = { ...incident, repository: undefined, workflow: undefined };
    service = fakeFetch(({ url }) => (url.pathname === `/api/v1/incidents/${ID}` ? json(older) : problem(503, "UNAVAILABLE")));
    const data = await loadWorkspace(ID, new AbortController().signal);
    expect(data.repository).toBeNull();
    expect(data.workflow).toBeNull();
  });
});
