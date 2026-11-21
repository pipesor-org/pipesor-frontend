import { z } from "zod";

const text = z.string().trim().min(1);
const id = z.guid();

function sameIds(cited: string[], linked: string[]) {
  const ids = new Set(linked);
  return ids.size === linked.length && cited.length === ids.size && new Set(cited).size === ids.size && cited.every((value) => ids.has(value));
}

// This schema reads the emitted local demonstration artifact.
export const diagnosticOutputSchema = z.object({
  contextId: id,
  executionId: id,
  incidentId: id,
  correlationId: z.string().regex(/^[A-Za-z0-9._:-]{1,128}$/),
  hypothesis: z.object({
    probableCause: text,
    recommendation: text,
    limitations: text,
    evidenceIds: z.array(id).min(1),
    chunkIds: z.array(id),
  }),
  evidence: z.array(z.object({
    evidenceId: id,
    originContextId: id,
    stage: text,
    sourceLocator: z.string().regex(
      /^v2:job:[1-9][0-9]*:member:[0-9]{1,9}_verify\.txt:lines:([1-9][0-9]{0,8})-\1:sha256:[0-9a-f]{64}$/,
    ).optional(),
    content: z.string().min(1),
  })).min(1),
  sources: z.array(z.object({
    documentId: id,
    chunkId: id,
    provenance: text,
  })),
}).refine((result) =>
  sameIds(result.hypothesis.evidenceIds, result.evidence.map((signal) => signal.evidenceId)) &&
  sameIds(result.hypothesis.chunkIds, result.sources.map((source) => source.chunkId)),
);

export type DiagnosticOutput = z.infer<typeof diagnosticOutputSchema>;

export const reviewDecision = z.enum(["CONFIRMED", "CORRECTED", "REJECTED"]);
export const reviewSchema = z.object({
  diagnosticId: z.guid(),
  diagnosisVersion: z.int().positive(),
  reviewRevision: z.int().nonnegative(),
  status: z.union([z.literal("PENDING"), reviewDecision]),
  original: diagnosticOutputSchema,
  history: z.array(z.object({
    id: z.guid(),
    revision: z.int().positive(),
    decision: reviewDecision,
    reviewer: z.string(),
    timestamp: z.iso.datetime({ offset: true }),
    correlationId: z.string(),
    comment: z.string(),
    actualCause: z.string().nullable(),
    correctedRecommendation: z.string().nullable(),
  })),
}).refine((view) => view.reviewRevision === view.history.length &&
  view.status === (view.history.at(-1)?.decision ?? "PENDING") &&
  view.history.every((entry, i) => entry.revision === i + 1 &&
    entry.correlationId === view.original.correlationId));

export type ReviewView = z.infer<typeof reviewSchema>;
