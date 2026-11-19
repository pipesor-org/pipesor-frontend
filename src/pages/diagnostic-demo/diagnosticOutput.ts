import { z } from "zod";

const text = z.string().trim().min(1);
const id = z.guid();

function sameIds(cited: string[], linked: string[]) {
  const ids = new Set(linked);
  return ids.size === linked.length && new Set(cited).size === ids.size && cited.every((value) => ids.has(value));
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
