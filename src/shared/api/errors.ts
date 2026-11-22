import { z } from "zod";

/**
 * `application/problem+json` body shared by every Pipesor service. All fields
 * are optional: a gateway or an older route may omit some of them, and the
 * client must still surface a typed error.
 */
const problemSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  status: z.number().int().optional(),
  code: z.string().optional(),
  correlationId: z.string().optional(),
});

export type ApiErrorKind =
  /** The service answered with a non-2xx status. */
  | "http"
  /** The request never produced a response (offline, CORS, DNS, refused). */
  | "network"
  /** A 2xx response did not match the expected contract. */
  | "contract";

/**
 * Typed failure of an API call. It carries only safe metadata (status, stable
 * error code, correlation id) — never request bodies, tokens or raw responses —
 * so it can be shown to the user and attached to bug reports.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number | null;
  readonly code: string | null;
  readonly correlationId: string | null;

  constructor(kind: ApiErrorKind, options: { status?: number | null; code?: string | null; correlationId?: string | null; message?: string }) {
    super(options.message ?? kind);
    this.name = "ApiError";
    this.kind = kind;
    this.status = options.status ?? null;
    this.code = options.code ?? null;
    this.correlationId = options.correlationId ?? null;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

/** Stable error codes are short identifiers; anything else is not displayed. */
const ERROR_CODE = /^[A-Za-z0-9_.:-]{1,64}$/;

export function safeErrorCode(value: unknown): string | null {
  return typeof value === "string" && ERROR_CODE.test(value) ? value : null;
}

export async function readProblem(response: Response, fallbackCorrelationId: string): Promise<ApiError> {
  let problem: z.infer<typeof problemSchema> = {};
  const type = response.headers.get("Content-Type") ?? "";
  if (type.includes("json")) {
    try {
      const parsed = problemSchema.safeParse(await response.json());
      if (parsed.success) problem = parsed.data;
    } catch {
      // An unreadable error body still yields a typed HTTP error.
    }
  }
  return new ApiError("http", {
    status: response.status,
    code: safeErrorCode(problem.code),
    correlationId: safeErrorCode(problem.correlationId) ?? response.headers.get("X-Correlation-ID") ?? fallbackCorrelationId,
    message: `HTTP ${response.status}`,
  });
}
