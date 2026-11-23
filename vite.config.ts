import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// API origins are runtime configuration (/config.js rendered by the container), so production
// builds are environment-independent and the same image is promoted across environments.
export default defineConfig({
  plugins: [react()],
});
