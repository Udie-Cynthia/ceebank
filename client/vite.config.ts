// client/vite.config.ts
// Minimal Vite config for React. We'll install @vitejs/plugin-react shortly.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  preview: {
    port: 5173
  }
});
