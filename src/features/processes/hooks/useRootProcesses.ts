import { useEffect, useState } from 'react'
import { fetchRootProcesses } from '../api'
import type { ProcessListItem } from '../types'
import { useOrchestratorServer } from '../../../shared/lib/use-orchestrator-server'

type UseRootProcessesResult = {
  processes: ProcessListItem[]
  isLoading: boolean
  errorMessage: string | null
  refetch: () => void
}

export function useRootProcesses(): UseRootProcessesResult {
  const { serverUrl } = useOrchestratorServer()
  const [processes, setProcesses] = useState<ProcessListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    const abortController = new AbortController()

    async function loadProcesses() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const nextProcesses = await fetchRootProcesses(
          serverUrl,
          abortController.signal,
        )
        setProcesses(nextProcesses)
      } catch (error) {
        if (abortController.signal.aborted) {
          return
        }

        const message =
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить процессы'

        setErrorMessage(message)
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadProcesses()

    return () => {
      abortController.abort()
    }
  }, [requestVersion, serverUrl])

  return {
    processes,
    isLoading,
    errorMessage,
    refetch: () => {
      setRequestVersion((version) => version + 1)
    },
  }
}
