import { describe, expect, test } from "bun:test";

import { groupRepositories, repositoryAccount } from "./repositoryGroups";

const repo = (repositoryId: string, fullName: string) => ({ repositoryId, fullName, defaultBranch: "main" });

const REPOSITORIES = [
  repo("3", "pipesor-org/pipesor-workspace"),
  repo("1", "Coware-org/api"),
  repo("2", "pipesor-org/pipesor-ingestion-normalization-service"),
  repo("4", "11770-Cobox/Documentacion"),
];

const MONITORED = [
  { pipelineId: "p-ci", githubRepositoryId: "2", githubWorkflowId: "10" },
  { pipelineId: "p-verify", githubRepositoryId: "2", githubWorkflowId: "11" },
];

describe("repositories grouped by account", () => {
  test("accounts and repositories by name, case-insensitive, with their counts", () => {
    const groups = groupRepositories(REPOSITORIES, MONITORED);
    expect(groups.map((group) => [group.account, group.total, group.monitoredCount])).toEqual([
      ["11770-Cobox", 1, 0],
      ["Coware-org", 1, 0],
      ["pipesor-org", 2, 2],
    ]);
    expect(groups[2].repositories.map((entry) => entry.repository.fullName)).toEqual([
      "pipesor-org/pipesor-ingestion-normalization-service",
      "pipesor-org/pipesor-workspace",
    ]);
    expect(groups[2].repositories[0].monitored.get("10")).toBe("p-ci");
  });

  test("a search keeps matching repositories (every word) and drops empty accounts", () => {
    const groups = groupRepositories(REPOSITORIES, MONITORED, "  PIPESOR  normalization ");
    expect(groups).toHaveLength(1);
    expect(groups[0].account).toBe("pipesor-org");
    expect(groups[0].repositories).toHaveLength(1);
    // The whole account still counts; monitored counts follow the matches.
    expect(groups[0].total).toBe(2);
    expect(groups[0].monitoredCount).toBe(2);
    expect(groupRepositories(REPOSITORIES, MONITORED, "nothing-like-this")).toEqual([]);
  });

  test("the account is the owner part of the full name", () => {
    expect(repositoryAccount("pipesor-org/pipesor-workspace")).toBe("pipesor-org");
  });
});
