import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getInitialOrchestratorServerUrl,
  persistOrchestratorServerUrl,
} from './orchestrator-server'
import { OrchestratorServerContext } from './orchestrator-server-store'

type OrchestratorServerProviderProps = {
  children: ReactNode
}

export function OrchestratorServerProvider({
  children,
}: OrchestratorServerProviderProps) {
  const [serverUrl, setServerUrl] = useState(getInitialOrchestratorServerUrl)

  useEffect(() => {
    persistOrchestratorServerUrl(serverUrl)
  }, [serverUrl])

  const value = useMemo(
    () => ({ serverUrl, setServerUrl }),
    [serverUrl],
  )

  return (
    <OrchestratorServerContext.Provider value={value}>
      {children}
    </OrchestratorServerContext.Provider>
  )
}
