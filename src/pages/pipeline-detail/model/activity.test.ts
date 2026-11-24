import { describe, expect, test } from "bun:test";

import { describeActivity } from "./activity";

describe("pipeline activity", () => {
  test("access given or removed names the person and the capability", () => {
    expect(describeActivity({ action: "GRANT", beforeState: { granted: "false" }, afterState: { principalRef: "t:o", capability: "OPERATE", granted: "true" } })).toEqual({
      kind: "grant",
      principalRef: "t:o",
      capability: "OPERATE",
    });
    expect(describeActivity({ action: "REVOKE", beforeState: null, afterState: { principalRef: "t:o", capability: "WHATEVER" } })).toEqual({
      kind: "revoke",
      principalRef: "t:o",
      capability: null,
    });
  });

  test("a settings change lists only the fields that changed, in display order", () => {
    const description = describeActivity({
      action: "CONFIGURE_POLICY",
      beforeState: { criticality: "HIGH", monitoringStatus: "ACTIVE", environment: "", snapshotVersion: "2" },
      afterState: { criticality: "CRITICAL", monitoringStatus: "ACTIVE", environment: "PRODUCTION", snapshotVersion: "2" },
    });
    expect(description).toEqual({
      kind: "policy",
      changes: [
        { field: "criticality", before: "HIGH", after: "CRITICAL" },
        { field: "environment", before: "", after: "PRODUCTION" },
      ],
    });
  });

  test("registration and unknown actions", () => {
    expect(describeActivity({ action: "REGISTER", beforeState: {}, afterState: { creatorCapability: "CONFIGURE" } })).toEqual({ kind: "register" });
    expect(describeActivity({ action: "SOMETHING_NEW", beforeState: null, afterState: null })).toEqual({ kind: "other", action: "SOMETHING_NEW" });
  });
});
