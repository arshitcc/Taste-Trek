import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { loadEnv } from "vite"

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    server: {
      proxy: {
        '/api': env.VITE_API_URL,
      }
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src/"),
      },
    },
  }
})