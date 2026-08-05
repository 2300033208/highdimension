import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import viteCompression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    viteCompression({ algorithm: "gzip", ext: ".gz" }),
    viteCompression({ algorithm: "brotliCompress", ext: ".br" })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/v1": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
      },
      "/api/engine": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/engine/, "/api"),
      },
    },
  },
  build: {
    target: "esnext",
    sourcemap: false,
    rollupOptions: {
      treeshake: true,
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          motion: ["framer-motion"],
          ui: ["lucide-react"]
        },
      },
    },
  },
});
