/**
 * Build-time runtime configuration.
 *
 * The dashboard calls each external service directly (CORS), so their origins
 * are injected at build time through `VITE_PIPESOR_*` variables. `bun run dev`
 * falls back to the local stack ports from the runtime manifest; any other
 * build fails fast when an origin is missing or malformed.
 */
export type ApiService = "ingestion" | "pipeline" | "recommendation";

const LOCAL_DEFAULTS: Record<ApiService, string> = {
  ingestion: "http://127.0.0.1:8081",
  pipeline: "http://127.0.0.1:8082",
  recommendation: "http://127.0.0.1:8086",
};

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

/** Accepts HTTPS anywhere and plain HTTP only for loopback hosts. */
function parseOrigin(name: string, raw: string | undefined, fallback?: string): string {
  const value = raw?.trim() || fallback;
  if (!value) throw new Error(`${name} is required for this build.`);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be an absolute URL.`);
  }
  const secure = url.protocol === "https:" || (url.protocol === "http:" && LOOPBACK_HOSTS.has(url.hostname));
  if (!secure || url.pathname !== "/" || url.search || url.hash || url.username || url.password) {
    throw new Error(`${name} must be an HTTPS origin (HTTP only on loopback) without path, query or credentials.`);
  }
  return url.origin;
}

function devDefault(service: ApiService): string | undefined {
  return import.meta.env.DEV ? LOCAL_DEFAULTS[service] : undefined;
}

export const apiOrigins: Readonly<Record<ApiService, string>> = Object.freeze({
  ingestion: parseOrigin("VITE_PIPESOR_INGESTION_URL", import.meta.env.VITE_PIPESOR_INGESTION_URL, devDefault("ingestion")),
  pipeline: parseOrigin("VITE_PIPESOR_PIPELINE_URL", import.meta.env.VITE_PIPESOR_PIPELINE_URL, devDefault("pipeline")),
  recommendation: parseOrigin(
    "VITE_PIPESOR_RECOMMENDATION_URL",
    import.meta.env.VITE_PIPESOR_RECOMMENDATION_URL,
    devDefault("recommendation"),
  ),
});

function optionalHttpsUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** GitHub App installation page, or `null` when not configured. */
export const githubAppInstallUrl = optionalHttpsUrl(import.meta.env.VITE_PIPESOR_GITHUB_APP_INSTALL_URL);
