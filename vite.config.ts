import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const apiTarget = env.VITE_API_TARGET || "http://localhost:3000"

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom"],
    },
    server: {
      host: true,
      port: 5001,
      strictPort: true,
      allowedHosts: true,
      hmr: {
        clientPort: 5001,
      },
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          // Pas de rewrite car le backend Go semble attendre /api
        },
      },
    },
  }
})
