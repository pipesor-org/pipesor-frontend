/**
 * Public API of the `shared/api` segment: the single HTTP client used to call
 * Pipesor services directly from the browser.
 */
export { apiRequest, apiUrl, configureApiAuth } from "./client";
export type { ApiAuthHooks, ApiRequest, QueryValue } from "./client";
export { ApiError, isApiError, safeErrorCode } from "./errors";
export type { ApiErrorKind } from "./errors";
export { DEFAULT_PAGE_SIZE, offsetPageSchema, tokenPageSchema } from "./pagination";
export { createRequestCache, resetRequestCaches } from "./requestCache";
export type { RequestCache } from "./requestCache";
export { useApiQuery } from "./useApiQuery";
export type { QueryState } from "./useApiQuery";
