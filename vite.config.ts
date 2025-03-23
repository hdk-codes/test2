import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  envDir: path.resolve(__dirname), // Load .env from project root, not client/
  envPrefix: "VITE_", // Explicitly allow VITE_ vars (optional, default anyway)
  build: {
    outDir: path.join(__dirname, "client", "dist"),
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5179,
    open: process.env.NODE_ENV !== "production",
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
  },
});