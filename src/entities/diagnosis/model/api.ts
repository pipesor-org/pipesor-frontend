import { apiRequest, isApiError } from "../../../shared/api";
import { diagnosisSchema, reviewViewSchema, type Diagnosis, type ReviewDecision, type ReviewView } from "./schema";

/** Diagnosis read result: `absent` while processing has not produced one yet. */
export type DiagnosisRead = { kind: "ready"; diagnosis: Diagnosis } | { kind: "absent" };

function hasCode(error: unknown, code: string): boolean {
  return isApiError(error) && error.code?.toLowerCase() === code;
}

/**
 * `GET /api/v1/incidents/{id}/diagnosis`. `404 diagnosis_absent` (processing
 * not finished, or no admitted diagnosis) becomes `absent`; every other
 * failure, including the access-hiding `404 incident_not_found`, is thrown.
 */
export async function fetchIncidentDiagnosis(incidentId: string, signal?: AbortSignal): Promise<DiagnosisRead> {
  try {
    const diagnosis = await apiRequest("recommendation", {
      path: `/api/v1/incidents/${encodeURIComponent(incidentId)}/diagnosis`,
      schema: diagnosisSchema,
      signal,
    });
    return { kind: "ready", diagnosis };
  } catch (error) {
    if (isApiError(error) && error.status === 404 && hasCode(error, "diagnosis_absent")) return { kind: "absent" };
    throw error;
  }
}

export function fetchReviews(diagnosisId: string, signal?: AbortSignal): Promise<ReviewView> {
  return apiRequest("recommendation", {
    path: `/api/v1/diagnoses/${encodeURIComponent(diagnosisId)}/reviews`,
    schema: reviewViewSchema,
    signal,
  });
}

export interface ReviewSubmission {
  diagnosisVersion: number;
  expectedRevision: number;
  decision: ReviewDecision;
  /** Optional for `CONFIRMED` and `CORRECTED`; omitted when empty. */
  comment?: string;
  /** Required for `CORRECTED`; must be absent otherwise. */
  actualCause?: string;
}

/**
 * `POST /api/v1/diagnoses/{id}/reviews`. The reviewer is the session subject.
 * A stale `expectedRevision` answers 409.
 */
export function submitReview(diagnosisId: string, submission: ReviewSubmission): Promise<ReviewView> {
  const body: Record<string, unknown> = {
    diagnosisVersion: submission.diagnosisVersion,
    expectedRevision: submission.expectedRevision,
    decision: submission.decision,
  };
  if (submission.comment) body.comment = submission.comment;
  if (submission.decision === "CORRECTED") body.actualCause = submission.actualCause;
  return apiRequest("recommendation", {
    method: "POST",
    path: `/api/v1/diagnoses/${encodeURIComponent(diagnosisId)}/reviews`,
    body,
    schema: reviewViewSchema,
  });
}
