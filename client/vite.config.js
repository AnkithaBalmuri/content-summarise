import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // During local development, the browser uses one visible URL:
      // http://localhost:5173/api/summarize
      "/api": "http://localhost:5000"
    }
  }
});
