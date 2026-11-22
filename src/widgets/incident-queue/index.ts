/**
 * Public API of the `incident-queue` widget: a paged Pipeline lifecycle queue
 * whose rows are completed with their pipeline and diagnosis, plus its
 * loading/failure and "load more" controls. Operations and History compose it.
 */
export { useIncidentQueue } from "./model/useIncidentQueue";
export type { IncidentQueue, QueueRow, RowDiagnosis, RowPipeline } from "./model/useIncidentQueue";
export { LoadMore, QueueStatus } from "./ui/QueueStatus";
