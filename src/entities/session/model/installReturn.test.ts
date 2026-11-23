import { describe, expect, test } from "bun:test";

import {
  INSTALL_RETURN_TTL_MS,
  clearInstallReturn,
  readInstallReturn,
  rememberInstallReturn,
  signInDestination,
  type TabStore,
} from "./installReturn";

/** In-memory stand-in for this tab's `sessionStorage`. */
function memoryStore(): TabStore & { raw: Map<string, string> } {
  const raw = new Map<string, string>();
  return {
    raw,
    getItem: (key) => raw.get(key) ?? null,
    setItem: (key, value) => void raw.set(key, value),
    removeItem: (key) => void raw.delete(key),
  };
}

const brokenStore: TabStore = {
  getItem: () => {
    throw new Error("storage disabled");
  },
  setItem: () => {
    throw new Error("storage disabled");
  },
  removeItem: () => {
    throw new Error("storage disabled");
  },
};

const NOW = Date.parse("2026-11-23T10:00:00Z");

describe("install return path", () => {
  test("survives the round trip to GitHub in the same tab", () => {
    const store = memoryStore();
    rememberInstallReturn("/pipelines/new", store, NOW);
    expect(readInstallReturn(store, NOW + 60_000)).toBe("/pipelines/new");
  });

  test("reading does not consume it; clearing does", () => {
    const store = memoryStore();
    rememberInstallReturn("/pipelines/new", store, NOW);
    expect(readInstallReturn(store, NOW)).toBe("/pipelines/new");
    expect(readInstallReturn(store, NOW)).toBe("/pipelines/new");
    clearInstallReturn(store);
    expect(readInstallReturn(store, NOW)).toBeNull();
  });

  test("keeps the query of an in-app path", () => {
    const store = memoryStore();
    rememberInstallReturn("/pipelines?criticality=HIGH", store, NOW);
    expect(readInstallReturn(store, NOW)).toBe("/pipelines?criticality=HIGH");
  });

  test.each([
    ["https://evil.example/pipelines/new"],
    ["//evil.example/pipelines/new"],
    ["/\\evil.example"],
    ["javascript:alert(1)"],
    ["/login"],
    ["/auth/complete"],
    ["pipelines/new"],
  ])("never saves an unsafe or sign-in destination: %s", (path) => {
    const store = memoryStore();
    rememberInstallReturn(path, store, NOW);
    expect(store.raw.size).toBe(0);
    expect(readInstallReturn(store, NOW)).toBeNull();
  });

  test("rejects a tampered stored value", () => {
    const store = memoryStore();
    store.setItem("pipesor.installReturn", JSON.stringify({ path: "https://evil.example", savedAt: NOW }));
    expect(readInstallReturn(store, NOW)).toBeNull();
    store.setItem("pipesor.installReturn", "not json");
    expect(readInstallReturn(store, NOW)).toBeNull();
    store.setItem("pipesor.installReturn", JSON.stringify({ path: "/pipelines/new" }));
    expect(readInstallReturn(store, NOW)).toBeNull();
  });

  test("expires after the time limit", () => {
    const store = memoryStore();
    rememberInstallReturn("/pipelines/new", store, NOW);
    expect(readInstallReturn(store, NOW + INSTALL_RETURN_TTL_MS)).toBe("/pipelines/new");
    expect(readInstallReturn(store, NOW + INSTALL_RETURN_TTL_MS + 1)).toBeNull();
  });

  test("ignores a value saved in the future (clock skew)", () => {
    const store = memoryStore();
    rememberInstallReturn("/pipelines/new", store, NOW + 60_000);
    expect(readInstallReturn(store, NOW)).toBeNull();
  });

  test("degrades to no destination when storage is unavailable", () => {
    expect(() => rememberInstallReturn("/pipelines/new", brokenStore, NOW)).not.toThrow();
    expect(readInstallReturn(brokenStore, NOW)).toBeNull();
    expect(() => clearInstallReturn(brokenStore)).not.toThrow();
    expect(readInstallReturn(null, NOW)).toBeNull();
  });
});

describe("destination after sign-in", () => {
  test("a specific destination requested at sign-in wins", () => {
    const store = memoryStore();
    rememberInstallReturn("/pipelines/new", store, NOW);
    expect(signInDestination("/history?view=insights", store, NOW)).toBe("/history?view=insights");
  });

  test("the server's default `/` gives way to the saved installation path", () => {
    const store = memoryStore();
    rememberInstallReturn("/pipelines/new", store, NOW);
    expect(signInDestination("/", store, NOW)).toBe("/pipelines/new");
    expect(signInDestination(null, store, NOW)).toBe("/pipelines/new");
  });

  test("without a saved path there is no destination (the app default applies)", () => {
    expect(signInDestination("/", memoryStore(), NOW)).toBeNull();
    expect(signInDestination(null, memoryStore(), NOW)).toBeNull();
  });
});
