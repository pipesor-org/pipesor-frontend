import type { PipelineActivityEntry, PipelineCapability } from "../../../entities/monitored-pipeline";

/** Settings the audit snapshot records, in display order (`policy.*` / `ownership.*` labels). */
export const AUDITED_FIELDS = ["criticality", "monitoringStatus", "environment", "responsibleTeamNameSnapshot"] as const;
export type AuditedField = (typeof AUDITED_FIELDS)[number];

export interface FieldChange {
  field: AuditedField;
  before: string;
  after: string;
}

export type ActivityDescription =
  | { kind: "register" }
  | { kind: "policy" | "ownership" | "configure"; changes: FieldChange[] }
  | { kind: "grant" | "revoke"; principalRef: string | null; capability: PipelineCapability | null }
  | { kind: "other"; action: string };

const CAPABILITIES = ["VIEW", "OPERATE", "CONFIGURE"] as const;

function text(state: Record<string, unknown> | null | undefined, key: string): string {
  const value = state?.[key];
  return typeof value === "string" ? value : "";
}

/**
 * What one audit record means, for a sentence in the activity list. Only the
 * recorded, sanitized fields are used; unknown actions stay as their code.
 */
export function describeActivity(entry: Pick<PipelineActivityEntry, "action" | "beforeState" | "afterState">): ActivityDescription {
  switch (entry.action) {
    case "REGISTER":
      return { kind: "register" };
    case "GRANT":
    case "REVOKE": {
      const capability = text(entry.afterState, "capability");
      return {
        kind: entry.action === "GRANT" ? "grant" : "revoke",
        principalRef: text(entry.afterState, "principalRef") || null,
        capability: CAPABILITIES.find((value) => value === capability) ?? null,
      };
    }
    case "CONFIGURE":
    case "CONFIGURE_POLICY":
    case "CONFIGURE_OWNERSHIP":
      return {
        kind: entry.action === "CONFIGURE_POLICY" ? "policy" : entry.action === "CONFIGURE_OWNERSHIP" ? "ownership" : "configure",
        changes: AUDITED_FIELDS.map((field) => ({ field, before: text(entry.beforeState, field), after: text(entry.afterState, field) })).filter(
          (change) => change.before !== change.after,
        ),
      };
    default:
      return { kind: "other", action: entry.action };
  }
}
