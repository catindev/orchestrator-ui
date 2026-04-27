const DEFAULT_ORCHESTRATOR_SERVER_URL = 'http://localhost:8080'
const ORCHESTRATOR_SERVER_STORAGE_KEY = 'orchestrator-server-url'

function hasProtocol(value: string) {
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(value)
}

export function normalizeOrchestratorServerUrl(value: string): string | null {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return null
  }

  const valueWithProtocol = hasProtocol(trimmedValue)
    ? trimmedValue
    : `http://${trimmedValue}`

  try {
    const url = new URL(valueWithProtocol)
    const normalizedPath =
      url.pathname === '/' ? '' : url.pathname.replace(/\/+$/, '')

    return `${url.origin}${normalizedPath}`
  } catch {
    return null
  }
}

export function getDefaultOrchestratorServerUrl() {
  return (
    normalizeOrchestratorServerUrl(__ORCHESTRATOR_BASE_URL__) ??
    DEFAULT_ORCHESTRATOR_SERVER_URL
  )
}

export function getStoredOrchestratorServerUrl() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedValue = window.localStorage.getItem(ORCHESTRATOR_SERVER_STORAGE_KEY)
    return storedValue ? normalizeOrchestratorServerUrl(storedValue) : null
  } catch {
    return null
  }
}

export function persistOrchestratorServerUrl(serverUrl: string) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(ORCHESTRATOR_SERVER_STORAGE_KEY, serverUrl)
  } catch {
    // ignore storage failures and keep the in-memory value
  }
}

export function getInitialOrchestratorServerUrl() {
  return getStoredOrchestratorServerUrl() ?? getDefaultOrchestratorServerUrl()
}

export function getWorkflowsEndpoint(serverUrl: string) {
  const normalizedServerUrl =
    normalizeOrchestratorServerUrl(serverUrl) ??
    getDefaultOrchestratorServerUrl()

  return `${normalizedServerUrl}/api/v1/workflows`
}
