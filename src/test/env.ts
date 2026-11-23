/**
 * Test preload. Bun exposes `process.env` as `import.meta.env`, and
 * `shared/config` validates the service origins when it is imported, so tests
 * get the local-stack origins (`bun run dev` falls back to the same values).
 */
process.env.VITE_PIPESOR_INGESTION_URL ??= "http://127.0.0.1:8081";
process.env.VITE_PIPESOR_PIPELINE_URL ??= "http://127.0.0.1:8082";
process.env.VITE_PIPESOR_RECOMMENDATION_URL ??= "http://127.0.0.1:8086";
