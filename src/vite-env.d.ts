/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Ingestion API origin, e.g. `http://127.0.0.1:8081`. Required outside `bun run dev`. */
  readonly VITE_PIPESOR_INGESTION_URL?: string;
  /** Pipeline API origin, e.g. `http://127.0.0.1:8082`. Required outside `bun run dev`. */
  readonly VITE_PIPESOR_PIPELINE_URL?: string;
  /** Recommendation API origin, e.g. `http://127.0.0.1:8086`. Required outside `bun run dev`. */
  readonly VITE_PIPESOR_RECOMMENDATION_URL?: string;
  /** Optional GitHub App installation page; when absent the link is not shown. */
  readonly VITE_PIPESOR_GITHUB_APP_INSTALL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
