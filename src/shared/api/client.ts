import type { z } from "zod";

import { apiOrigins, type ApiService } from "../config";
import { ApiError, readProblem } from "./errors";

/**
 * Session hooks injected by the app layer, so this generic client never
 * depends on the session entity. `getAccessToken` returns the in-memory bearer
 * token; `onUnauthorized` ends the session when a service answers 401.
 */
export interface ApiAuthHooks {
  getAccessToken: () => string | null;
  onUnauthorized: () => void;
}

let authHooks: ApiAuthHooks = {
  getAccessToken: () => null,
  onUnauthorized: () => undefined,
};

export function configureApiAuth(hooks: ApiAuthHooks): void {
  authHooks = hooks;
}

export type QueryValue = string | number | boolean | null | undefined;

export interface ApiRequest<T> {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  /** Path below the service origin, starting with `/api/`. */
  path: string;
  query?: Record<string, QueryValue>;
  /** JSON request body. */
  body?: unknown;
  /** Response contract. `null` for routes without a body (204). */
  schema: z.ZodType<T> | null;
  /** `Idempotency-Key` for commands whose service supports it (a UUID reused on retry). */
  idempotencyKey?: string;
  /** Send the session bearer token. Defaults to `true`. */
  authenticated?: boolean;
  signal?: AbortSignal;
}

function newCorrelationId(): string {
  return crypto.randomUUID();
}

function buildUrl(service: ApiService, path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(path, apiOrigins[service]);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  }
  return url.href;
}

/**
 * Single HTTP entry point for Pipesor services.
 *
 * - Adds `Authorization: Bearer` (unless `authenticated: false`) and a fresh
 *   `X-Correlation-ID` per request; never uses cookies (`credentials: omit`).
 * - Maps non-2xx answers to `ApiError` from the `application/problem+json`
 *   body; a 401 on an authenticated call also ends the session.
 * - Validates successful bodies with the given Zod schema at this boundary.
 * - Rethrows `AbortError` untouched so callers can ignore cancelled requests.
 */
export async function apiRequest<T>(service: ApiService, request: ApiRequest<T>): Promise<T> {
  const correlationId = newCorrelationId();
  const authenticated = request.authenticated ?? true;
  const headers: Record<string, string> = { Accept: "application/json, application/problem+json", "X-Correlation-ID": correlationId };
  if (request.body !== undefined) headers["Content-Type"] = "application/json";
  if (request.idempotencyKey) headers["Idempotency-Key"] = request.idempotencyKey;
  if (authenticated) {
    const token = authHooks.getAccessToken();
    if (!token) {
      authHooks.onUnauthorized();
      throw new ApiError("http", { status: 401, code: "UNAUTHENTICATED", correlationId });
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(service, request.path, request.query), {
      method: request.method ?? "GET",
      headers,
      body: request.body === undefined ? undefined : JSON.stringify(request.body),
      credentials: "omit",
      cache: "no-store",
      signal: request.signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("network", { correlationId, message: "Network request failed" });
  }

  const responseCorrelationId = response.headers.get("X-Correlation-ID") ?? correlationId;
  if (!response.ok) {
    const error = await readProblem(response, responseCorrelationId);
    if (response.status === 401 && authenticated) authHooks.onUnauthorized();
    throw error;
  }

  if (request.schema === null) return undefined as T;

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new ApiError("contract", { status: response.status, correlationId: responseCorrelationId, message: "Response is not JSON" });
  }
  const parsed = request.schema.safeParse(body);
  if (!parsed.success) {
    // Log the failing paths only; response values may hold private data.
    console.warn(`[api] ${service} ${request.path} contract mismatch`, parsed.error.issues.map((issue) => issue.path.join(".")));
    throw new ApiError("contract", { status: response.status, correlationId: responseCorrelationId, message: "Unexpected response shape" });
  }
  return parsed.data;
}

/** Absolute URL of a service route, for full-page navigations (e.g. OAuth start). */
export function apiUrl(service: ApiService, path: string, query?: Record<string, QueryValue>): string {
  return buildUrl(service, path, query);
}
