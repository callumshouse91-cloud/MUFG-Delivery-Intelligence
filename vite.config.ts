import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { aiApiPlugin } from "./vite-plugin-ai-api";

export default defineConfig({
  plugins: [react(), aiApiPlugin()],
  server: {
    watch: {
      usePolling: true,
    },
  },
});
