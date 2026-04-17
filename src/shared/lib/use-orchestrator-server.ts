import { useContext } from 'react'
import { OrchestratorServerContext } from './orchestrator-server-store'

export function useOrchestratorServer() {
  const context = useContext(OrchestratorServerContext)

  if (!context) {
    throw new Error(
      'useOrchestratorServer must be used within OrchestratorServerProvider',
    )
  }

  return context
}
