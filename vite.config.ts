import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  const port = loadEnv(mode, ".", "PIPESOR_DEMO_").PIPESOR_DEMO_PORT;
  if (command === "serve" && port && (!/^\d{1,5}$/.test(port) || Number(port) < 1 || Number(port) > 65535)) {
    throw new Error("PIPESOR_DEMO_PORT must be a loopback port number");
  }

  return {
    plugins: [react()],
    server: command === "serve" && port ? {
      host: "127.0.0.1",
      proxy: {
        "^/api/v1/(pipelines$|pipelines/[0-9a-f-]{36}/incidents$|incidents/[0-9a-f-]{36}$)": { target: `http://127.0.0.1:${port}` },
        "^/local-demo/v1/(diagnosis$|diagnoses/[0-9a-f-]{36}/review$)": { target: `http://127.0.0.1:${port}` },
      },
    } : undefined,
  };
});
