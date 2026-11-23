/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Ingestion API origin, e.g. `http://127.0.0.1:8081`. Local override; deployed images read it from the runtime `/config.js`. */
  readonly VITE_PIPESOR_INGESTION_URL?: string;
  /** Pipeline API origin, e.g. `http://127.0.0.1:8082`. Local override; deployed images read it from the runtime `/config.js`. */
  readonly VITE_PIPESOR_PIPELINE_URL?: string;
  /** Recommendation API origin, e.g. `http://127.0.0.1:8086`. Local override; deployed images read it from the runtime `/config.js`. */
  readonly VITE_PIPESOR_RECOMMENDATION_URL?: string;
  /** Optional GitHub App installation page; when absent the link is not shown. */
  readonly VITE_PIPESOR_GITHUB_APP_INSTALL_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
