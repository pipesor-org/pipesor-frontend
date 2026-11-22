/**
 * Public API of the `diagnosis` entity: Recommendation's diagnosis projection
 * (inferred hypothesis, observed evidence, retrieved sources) and its human
 * review history.
 */
export { fetchIncidentDiagnosis, fetchReviews, submitReview } from "./model/api";
export type { DiagnosisRead, ReviewSubmission } from "./model/api";
export { parseEvidenceLocator } from "./model/locator";
export type { EvidenceLocation } from "./model/locator";
export { DIAGNOSIS_STATUSES, REVIEW_DECISIONS } from "./model/schema";
export type { Diagnosis, DiagnosisEvidence, DiagnosisSource, DiagnosisStatus, Review, ReviewDecision, ReviewView } from "./model/schema";
export { DiagnosisStatusLabel } from "./ui/DiagnosisStatusLabel";
