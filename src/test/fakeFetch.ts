/**
 * Replaces `globalThis.fetch` for a test with a handler that answers like a
 * service, and records every request. Call `restore()` in `afterEach`.
 */
export interface RecordedRequest {
  method: string;
  url: URL;
}

export function fakeFetch(handler: (request: RecordedRequest) => Response | Promise<Response>) {
  const original = globalThis.fetch;
  const requests: RecordedRequest[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    const request = { method: (init?.method ?? "GET").toUpperCase(), url };
    requests.push(request);
    return handler(request);
  }) as typeof fetch;
  return {
    requests,
    restore: () => {
      globalThis.fetch = original;
    },
  };
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

/** An RFC 9457 problem as the Pipesor services answer errors. */
export function problem(status: number, code: string): Response {
  return new Response(JSON.stringify({ status, code }), { status, headers: { "Content-Type": "application/problem+json" } });
}
