import { describe, expect, test } from "bun:test";

import { buildInsights, type InsightsRecord } from "./insights";

const NOW = Date.parse("2026-11-23T12:00:00Z");

const record = (patch: Partial<InsightsRecord>): InsightsRecord => ({
  incidentId: "i",
  detectedAt: "2026-11-20T10:00:00Z",
  resolvedAt: "2026-11-20T12:00:00Z",
  stage: "Testing",
  pipelineId: "p1",
  repository: "acme/api",
  workflow: "CI",
  diagnosisCreatedAt: "2026-11-20T10:02:00Z",
  outcome: "CONFIRMED",
  ...patch,
});

describe("insights computed in the browser (fallback)", () => {
  test("use the service's definitions over the window", () => {
    const insights = buildInsights(
      [
        record({ incidentId: "a" }),
        record({ incidentId: "b", outcome: "CORRECTED", stage: "Build" }),
        record({ incidentId: "c", outcome: "PENDING", diagnosisCreatedAt: null }),
        record({ incidentId: "old", resolvedAt: "2026-09-01T00:00:00Z" }),
      ],
      NOW,
    );
    expect(insights.window.start).toBe("2026-10-25T00:00:00.000Z");
    expect(insights.summary).toMatchObject({ resolvedIncidents: 3, confirmed: 1, rejected: 1, pending: 1, confirmationRate: 0.5 });
    expect(insights.summary.meanDiagnosis).toEqual({ meanMs: 120_000, sampleSize: 2 });
    expect(insights.stages).toEqual([
      { stage: "Testing", count: 2 },
      { stage: "Build", count: 1 },
    ]);
    // Every group is known here, so the list is never truncated.
    expect(insights.recurringTruncated).toBe(false);
  });
});
