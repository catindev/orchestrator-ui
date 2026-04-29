import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const DEV_ORCHESTRATOR_BASE_URL = 'http://localhost:8080'
const DEFAULT_ORCHESTRATOR_BASE_URL =
  'https://j-nominal-beneficiaries.preprod.transcapital.com'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const orchestratorBaseUrl =
    env.ORCHESTRATOR_BASE_URL ||
    (command === 'serve' ? DEV_ORCHESTRATOR_BASE_URL : DEFAULT_ORCHESTRATOR_BASE_URL)

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
