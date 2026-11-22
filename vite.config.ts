import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const origins = loadEnv(mode, ".", "VITE_PIPESOR_");
    const missing = ["INGESTION", "PIPELINE", "RECOMMENDATION"]
      .map((name) => `VITE_PIPESOR_${name}_URL`)
      .filter((name) => !origins[name]);
    if (missing.length) {
      // Origins are baked in at build time; this bundle will refuse to start.
      console.warn(`[pipesor] ${missing.join(", ")} not set: this build is not deployable.`);
    }
  }

  return {
    plugins: [react()],
  };
});
