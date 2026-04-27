import { createContext } from 'react'

export type OrchestratorServerContextValue = {
  serverUrl: string
  setServerUrl: (nextServerUrl: string) => void
}

export const OrchestratorServerContext =
  createContext<OrchestratorServerContextValue | null>(null)
