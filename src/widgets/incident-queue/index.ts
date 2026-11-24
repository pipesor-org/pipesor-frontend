/**
 * Public API of the `incident-queue` widget: a paged Pipeline lifecycle queue
 * whose rows are completed with their pipeline and diagnosis, plus its
 * loading/failure and "load more" controls. Operations and History compose it.
 */
export { BROWSER_FILTER_CAP, useIncidentQueue } from "./model/useIncidentQueue";
export type { IncidentQueue, QueueRow, QueueScope, RowDiagnosis, RowPipeline } from "./model/useIncidentQueue";
export { useIncidentFilterParams } from "./model/useIncidentFilterParams";
export { IncidentFilterBar } from "./ui/IncidentFilterBar";
export { LoadMore, QueueStatus } from "./ui/QueueStatus";
