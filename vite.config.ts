import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const origins = loadEnv(mode, ".", "VITE_PIPESOR_");
    const missing = ["INGESTION", "PIPELINE", "RECOMMENDATION"]
      .map((name) => `VITE_PIPESOR_${name}_URL`)
      .filter((name) => !origins[name]);
    if (missing.length) {
      const message = `[pipesor] ${missing.join(", ")} not set: this build is not deployable.`;
      // Origins are baked in at build time; a deployable (image) build must not proceed without them.
      if (loadEnv(mode, ".", "PIPESOR_REQUIRE_").PIPESOR_REQUIRE_API_ORIGINS === "1") throw new Error(message);
      console.warn(message);
    }
  }

  return {
    plugins: [react()],
  };
});
