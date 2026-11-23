/**
 * Runtime configuration.
 *
 * The dashboard calls each external service directly (CORS). The container
 * renders `/config.js` at startup from its environment (see
 * `deploy/40-pipesor-config.sh`), so one image is promoted unchanged across
 * environments. `VITE_PIPESOR_*` variables remain a local override, and
 * `bun run dev` falls back to the local stack ports from the runtime manifest.
 * A missing or malformed origin fails fast.
 */
export type ApiService = "ingestion" | "pipeline" | "recommendation";

interface RuntimeConfig {
  ingestionUrl?: string;
  pipelineUrl?: string;
  recommendationUrl?: string;
  githubAppInstallUrl?: string;
}

const runtime: RuntimeConfig =
  (globalThis as typeof globalThis & { __PIPESOR_CONFIG__?: RuntimeConfig }).__PIPESOR_CONFIG__ ?? {};

const LOCAL_DEFAULTS: Record<ApiService, string> = {
  ingestion: "http://127.0.0.1:8081",
  pipeline: "http://127.0.0.1:8082",
  recommendation: "http://127.0.0.1:8086",
};

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

/** Accepts HTTPS anywhere and plain HTTP only for loopback hosts. */
function parseOrigin(name: string, raw: string | undefined, fallback?: string): string {
  const value = raw?.trim() || fallback;
  if (!value) throw new Error(`${name} is required (runtime /config.js or VITE_ build variable).`);
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
  ingestion: parseOrigin(
    "PIPESOR_INGESTION_URL",
    runtime.ingestionUrl || import.meta.env.VITE_PIPESOR_INGESTION_URL,
    devDefault("ingestion"),
  ),
  pipeline: parseOrigin(
    "PIPESOR_PIPELINE_URL",
    runtime.pipelineUrl || import.meta.env.VITE_PIPESOR_PIPELINE_URL,
    devDefault("pipeline"),
  ),
  recommendation: parseOrigin(
    "PIPESOR_RECOMMENDATION_URL",
    runtime.recommendationUrl || import.meta.env.VITE_PIPESOR_RECOMMENDATION_URL,
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
export const githubAppInstallUrl = optionalHttpsUrl(
  runtime.githubAppInstallUrl || import.meta.env.VITE_PIPESOR_GITHUB_APP_INSTALL_URL,
);
