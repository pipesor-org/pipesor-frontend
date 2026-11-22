import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, ".", "PIPESOR_DEMO_");
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
  const port = env.PIPESOR_DEMO_PORT;
  const registrationCatalog = command === "serve" && port ? env.PIPESOR_DEMO_REGISTRATION_CATALOG : undefined;
  if (command === "serve" && port && (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
    throw new Error("PIPESOR_DEMO_PORT must be a loopback port number");
  }

  return {
    plugins: [react()],
    define: {
      __PIPESOR_REGISTRATION_CATALOG__: JSON.stringify(registrationCatalog ?? ""),
    },
    server: command === "serve" && port ? {
      host: "127.0.0.1",
      proxy: {
        ...(registrationCatalog ? {
          "^/api/v1/pipelines(?:\\?.*|/[0-9a-f-]{36}(?:/policy)?)$": { target: `http://127.0.0.1:${port}` },
        } : {}),
      },
    } : undefined,
  };
});
