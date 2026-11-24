import { describe, expect, test } from "bun:test";

import type { GitHubCollaborator } from "../../../entities/github-access";
import type { PipelineCapability, PipelineGrant } from "../../../entities/monitored-pipeline";

import { accessChanges, candidates, levelOf, offeredLevels, peopleWithAccess } from "./access";

const caps = (...values: PipelineCapability[]) => new Set(values);
const grant = (principalRef: string, capability: PipelineCapability): PipelineGrant => ({ principalRef, capability });
const person = (login: string, principalRef: string, role: GitHubCollaborator["role"] = "WRITE"): GitHubCollaborator => ({
  githubUserId: String(login.length),
  login,
  avatarUrl: null,
  role,
  principalRef,
  pipesorConnection: "ACTIVE",
});

describe("access levels", () => {
  test("read from capability grants (any grant implies view)", () => {
    expect(levelOf(caps("VIEW"))).toBe("VIEW");
    expect(levelOf(caps("VIEW", "OPERATE"))).toBe("OPERATE");
    expect(levelOf(caps("CONFIGURE"))).toBe("CONFIGURE");
    expect(levelOf(caps("CONFIGURE", "OPERATE"))).toBe("OPERATE_CONFIGURE");
  });

  test("moving between levels adds first and removes what the new level does not hold", () => {
    expect(accessChanges(caps("CONFIGURE"), "OPERATE_CONFIGURE")).toEqual({ add: ["OPERATE"], remove: [] });
    expect(accessChanges(caps("VIEW"), "OPERATE")).toEqual({ add: ["OPERATE"], remove: ["VIEW"] });
    expect(accessChanges(caps("OPERATE", "CONFIGURE"), "VIEW")).toEqual({ add: ["VIEW"], remove: ["OPERATE", "CONFIGURE"] });
    expect(accessChanges(caps("OPERATE"), null)).toEqual({ add: [], remove: ["OPERATE"] });
  });

  test("configure is offered to GitHub administrators only and never taken from the last configurer", () => {
    expect(offeredLevels("WRITE", false)).toEqual(["VIEW", "OPERATE"]);
    expect(offeredLevels("ADMIN", false)).toEqual(["VIEW", "OPERATE", "CONFIGURE", "OPERATE_CONFIGURE"]);
    expect(offeredLevels("ADMIN", true)).toEqual(["CONFIGURE", "OPERATE_CONFIGURE"]);
  });
});

describe("people with access", () => {
  const grants = [grant("t:me", "CONFIGURE"), grant("t:ramiro", "OPERATE"), grant("t:gone", "VIEW")];
  const list = [person("Chaomeum", "t:me", "ADMIN"), person("ramiro", "t:ramiro")];

  test("joined with GitHub by principal: the caller first, then by login, unknown last", () => {
    const people = peopleWithAccess(grants, { list, complete: true }, "t:me");
    expect(people.map((entry) => [entry.collaborator?.login ?? entry.principalRef, entry.level, entry.lastConfigurer])).toEqual([
      ["Chaomeum", "CONFIGURE", true],
      ["ramiro", "OPERATE", false],
      ["t:gone", "VIEW", false],
    ]);
    expect(people[2].noLongerOnGitHub).toBe(true);
  });

  test("absence means lost access only when the collaborator list is complete", () => {
    expect(peopleWithAccess(grants, { list, complete: false }, null).some((entry) => entry.noLongerOnGitHub)).toBe(false);
    expect(peopleWithAccess(grants, null, null).some((entry) => entry.noLongerOnGitHub)).toBe(false);
  });

  test("candidates are collaborators without access, by login, searchable", () => {
    const everyone = [...list, person("ana-dev", "t:ana"), person("Bob", "t:bob")];
    expect(candidates(everyone, grants).map((entry) => entry.login)).toEqual(["ana-dev", "Bob"]);
    expect(candidates(everyone, grants, " ANA ").map((entry) => entry.login)).toEqual(["ana-dev"]);
  });
});
