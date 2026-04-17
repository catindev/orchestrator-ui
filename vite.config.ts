import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const orchestratorBaseUrl =
    env.ORCHESTRATOR_BASE_URL || 'http://localhost:8080'

  return {
    plugins: [react()],
    define: {
      __ORCHESTRATOR_BASE_URL__: JSON.stringify(orchestratorBaseUrl),
    },
    server: {
      proxy: {
        '/api': {
          target: orchestratorBaseUrl,
          changeOrigin: true,
        },
      },
    },
  }
})
