const DEFAULT_ORCHESTRATOR_SERVER_URL = 'http://localhost:8080'

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

export function getWorkflowsEndpoint(serverUrl: string) {
  const normalizedServerUrl =
    normalizeOrchestratorServerUrl(serverUrl) ??
    getDefaultOrchestratorServerUrl()

  return `${normalizedServerUrl}/api/v1/workflows`
}
