import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, ".", "PIPESOR_DEMO_");
  const port = env.PIPESOR_DEMO_PORT;
  const capturePort = command === "serve" ? env.PIPESOR_DEMO_INGESTION_PORT : undefined;
  if (capturePort && (!/^\d{1,5}$/.test(capturePort) || Number(capturePort) < 1 || Number(capturePort) > 65535)) {
    throw new Error("PIPESOR_DEMO_INGESTION_PORT must be a loopback port number");
  }
  const registrationCatalog = command === "serve" && port ? env.PIPESOR_DEMO_REGISTRATION_CATALOG : undefined;
  if (command === "serve" && port && (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
    throw new Error("PIPESOR_DEMO_PORT must be a loopback port number");
  }

  return {
    plugins: [react()],
    define: {
      __PIPESOR_LOCAL_CAPTURE__: JSON.stringify(Boolean(capturePort)),
      __PIPESOR_REGISTRATION_CATALOG__: JSON.stringify(registrationCatalog ?? ""),
    },
    server: command === "serve" && (port || capturePort) ? {
      host: "127.0.0.1",
      proxy: {
        ...(capturePort ? {
          "^/api/v1/github/(local-analysis$|repositories/[0-9]+/workflows/[0-9]+/runs/[0-9]+/attempts/[0-9]+/analysis$)":
            { target: `http://127.0.0.1:${capturePort}` },
        } : {}),
        ...(registrationCatalog ? {
          "^/api/v1/pipelines(?:\\?.*|/[0-9a-f-]{36}(?:/policy)?)$": { target: `http://127.0.0.1:${port}` },
        } : {}),
        ...(port ? {
          "^/api/v1/(pipelines$|pipelines/[0-9a-f-]{36}/incidents$|incidents/[0-9a-f-]{36}$)": { target: `http://127.0.0.1:${port}` },
          "^/local-demo/v1/(diagnosis$|diagnoses/[0-9a-f-]{36}/review$)": { target: `http://127.0.0.1:${port}` },
        } : {}),
      },
    } : undefined,
  };
});
