import { describe, expect, test } from "bun:test";

import {
  AnalysisTimeoutError,
  analysisBlock,
  followAnalysis,
  isTerminalPhase,
  type AnalysisPhase,
  type AnalysisReceipt,
} from "./analysis";

describe("terminal phases", () => {
  test("PUBLISHED and BLOCKED are final", () => {
    expect(isTerminalPhase("PUBLISHED")).toBe(true);
    expect(isTerminalPhase("BLOCKED")).toBe(true);
  });

  test("ACCEPTED and PREPARING are still in progress", () => {
    expect(isTerminalPhase("ACCEPTED")).toBe(false);
    expect(isTerminalPhase("PREPARING")).toBe(false);
  });
});

describe("blocked reason", () => {
  test("SOURCE_EXPIRED: GitHub no longer keeps the run's logs", () => {
    expect(analysisBlock({ phase: "BLOCKED", blockedReason: "SOURCE_EXPIRED" })).toBe("sourceExpired");
  });

  test("SCOPE_CHANGED: access to the repository changed", () => {
    expect(analysisBlock({ phase: "BLOCKED", blockedReason: "SCOPE_CHANGED" })).toBe("scopeChanged");
  });

  test("an unknown or missing reason is still blocked", () => {
    expect(analysisBlock({ phase: "BLOCKED", blockedReason: "SOMETHING_NEW" })).toBe("other");
    expect(analysisBlock({ phase: "BLOCKED", blockedReason: null })).toBe("other");
    expect(analysisBlock({ phase: "BLOCKED" })).toBe("other");
  });

  test("a receipt that is not blocked has no reason", () => {
    expect(analysisBlock({ phase: "PUBLISHED", blockedReason: "SOURCE_EXPIRED" })).toBeNull();
    expect(analysisBlock({ phase: "PREPARING" })).toBeNull();
  });
});

/** Scripted receipts plus a fake clock: each wait advances time by the interval. */
function harness(sequence: (AnalysisReceipt | null)[]) {
  let clock = 0;
  const fetched: (AnalysisReceipt | null)[] = [];
  const phases: AnalysisPhase[] = [];
  const queue = [...sequence];
  return {
    phases,
    fetched,
    fetchNext: async () => {
      const next = queue.length ? queue.shift()! : null;
      fetched.push(next);
      return next;
    },
    options: {
      onPhase: (phase: AnalysisPhase) => void phases.push(phase),
      intervalMs: 2_000,
      timeoutMs: 10_000,
      wait: async (ms: number) => {
        clock += ms;
      },
      now: () => clock,
    },
  };
}

describe("following an analysis", () => {
  test("a receipt that is already BLOCKED is not polled at all", async () => {
    const run = harness([]);
    const result = await followAnalysis({ phase: "BLOCKED", blockedReason: "SOURCE_EXPIRED" }, run.fetchNext, run.options);
    expect(result.blockedReason).toBe("SOURCE_EXPIRED");
    expect(run.fetched).toHaveLength(0);
    expect(run.phases).toEqual(["BLOCKED"]);
  });

  test("polling stops at the first BLOCKED receipt", async () => {
    const run = harness([
      { phase: "PREPARING" },
      { phase: "BLOCKED", blockedReason: "SOURCE_EXPIRED" },
      { phase: "PUBLISHED" },
    ]);
    const result = await followAnalysis({ phase: "ACCEPTED" }, run.fetchNext, run.options);
    expect(result).toEqual({ phase: "BLOCKED", blockedReason: "SOURCE_EXPIRED" });
    expect(run.fetched).toHaveLength(2);
    expect(run.phases).toEqual(["ACCEPTED", "PREPARING", "BLOCKED"]);
  });

  test("polling stops when the receipt is PUBLISHED", async () => {
    const run = harness([{ phase: "PUBLISHED" }]);
    const result = await followAnalysis({ phase: "PREPARING" }, run.fetchNext, run.options);
    expect(result.phase).toBe("PUBLISHED");
    expect(run.fetched).toHaveLength(1);
  });

  test("a missing receipt keeps the last known one", async () => {
    const run = harness([null, { phase: "BLOCKED", blockedReason: "SCOPE_CHANGED" }]);
    const result = await followAnalysis({ phase: "ACCEPTED" }, run.fetchNext, run.options);
    expect(analysisBlock(result)).toBe("scopeChanged");
    expect(run.phases).toEqual(["ACCEPTED", "ACCEPTED", "BLOCKED"]);
  });

  test("gives up after the time limit", async () => {
    const run = harness(Array.from({ length: 20 }, () => ({ phase: "PREPARING" as const })));
    await expect(followAnalysis({ phase: "ACCEPTED" }, run.fetchNext, run.options)).rejects.toBeInstanceOf(AnalysisTimeoutError);
    expect(run.fetched.length).toBeLessThan(20);
  });
});
