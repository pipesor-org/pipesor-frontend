import { z } from "zod";

/**
 * Recommendation contracts (MVP HTTP API v1, "Diagnosis by incident" and
 * "Reviews"). `hypothesis` is model output (inferred), `evidence` is observed
 * and sanitized, `sources` is retrieved knowledge: the UI keeps them apart.
 */
const instant = z.iso.datetime({ offset: true });

export const DIAGNOSIS_STATUSES = ["PENDING", "CONFIRMED", "CORRECTED", "REJECTED"] as const;
export type DiagnosisStatus = (typeof DIAGNOSIS_STATUSES)[number];

export const REVIEW_DECISIONS = ["CONFIRMED", "CORRECTED", "REJECTED"] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export const reviewSchema = z.object({
  revision: z.number().int().positive(),
  decision: z.enum(REVIEW_DECISIONS),
  timestamp: instant,
  actualCause: z.string().nullish(),
  comment: z.string().nullish(),
  correctedRecommendation: z.string().nullish(),
});

export type Review = z.infer<typeof reviewSchema>;

export const diagnosisSchema = z.object({
  diagnosisId: z.guid(),
  version: z.number().int().positive(),
  incidentId: z.guid(),
  executionId: z.guid(),
  createdAt: instant,
  status: z.enum(DIAGNOSIS_STATUSES),
  hypothesis: z.object({
    probableCause: z.string().min(1),
    recommendation: z.string().nullish(),
    limitations: z.string().nullish(),
    evidenceIds: z.array(z.guid()).default([]),
    chunkIds: z.array(z.guid()).default([]),
  }),
  evidence: z
    .array(
      z.object({
        evidenceId: z.guid(),
        stage: z.string().nullish(),
        sourceLocator: z.string().nullish(),
        content: z.string(),
      }),
    )
    .default([]),
  sources: z
    .array(z.object({ documentId: z.guid(), chunkId: z.guid(), provenance: z.string().nullish() }))
    .default([]),
  model: z.object({ deployment: z.string().nullish(), modelVersion: z.string().nullish() }).nullish(),
  reviews: z.array(reviewSchema).default([]),
});

export type Diagnosis = z.infer<typeof diagnosisSchema>;
export type DiagnosisEvidence = Diagnosis["evidence"][number];
export type DiagnosisSource = Diagnosis["sources"][number];

/** `GET|POST /api/v1/diagnoses/{id}/reviews`: current status, revision and history. */
export const reviewViewSchema = z.object({
  diagnosticId: z.guid(),
  diagnosisVersion: z.number().int().positive(),
  reviewRevision: z.number().int().nonnegative(),
  status: z.enum(DIAGNOSIS_STATUSES),
  history: z.array(reviewSchema),
});

export type ReviewView = z.infer<typeof reviewViewSchema>;
