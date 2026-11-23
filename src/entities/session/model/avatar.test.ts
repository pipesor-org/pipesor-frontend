import { describe, expect, test } from "bun:test";

import { GITHUB_AVATAR_ORIGIN, githubAvatarUrl } from "./avatar";

describe("GitHub avatar", () => {
  test("derives from the numeric user id on GitHub's avatar CDN", () => {
    expect(githubAvatarUrl("87343021", 64)).toBe("https://avatars.githubusercontent.com/u/87343021?s=64&v=4");
    expect(githubAvatarUrl("87343021", 64)?.startsWith(`${GITHUB_AVATAR_ORIGIN}/`)).toBe(true);
  });

  test.each([[""], ["0"], ["0123"], ["chaomeum"], ["123/../../evil"], ["12 34"], ["-5"]])(
    "builds nothing for an id that is not a GitHub numeric id: %p",
    (id) => {
      expect(githubAvatarUrl(id, 64)).toBeNull();
    },
  );

  test("keeps the requested size within what GitHub serves", () => {
    expect(githubAvatarUrl("1", 63.6)).toContain("s=64");
    expect(githubAvatarUrl("1", 0)).toContain("s=1");
    expect(githubAvatarUrl("1", 2000)).toContain("s=460");
  });
});
