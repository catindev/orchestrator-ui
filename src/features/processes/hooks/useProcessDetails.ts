import { useEffect, useState } from 'react'
import { fetchProcessDetails } from '../api'
import type { ProcessDetails } from '../types'
import { useOrchestratorServer } from '../../../shared/lib/use-orchestrator-server'

type UseProcessDetailsResult = {
  process: ProcessDetails | null
  isLoading: boolean
  errorMessage: string | null
  refetch: () => void
}

export function useProcessDetails(
  processId: string | undefined,
): UseProcessDetailsResult {
  const { serverUrl } = useOrchestratorServer()
  const hasProcessId = Boolean(processId)
  const [process, setProcess] = useState<ProcessDetails | null>(null)
  const [isLoading, setIsLoading] = useState(hasProcessId)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [requestVersion, setRequestVersion] = useState(0)

  useEffect(() => {
    if (!processId) {
      return
    }

    const targetProcessId = processId
    const abortController = new AbortController()

    async function loadProcess() {
      try {
        setIsLoading(true)
        setErrorMessage(null)

        const nextProcess = await fetchProcessDetails(
          serverUrl,
          targetProcessId,
          abortController.signal,
        )

        setProcess(nextProcess)
      } catch (error) {
        if (abortController.signal.aborted) {
          return
        }

        const message =
          error instanceof Error ? error.message : 'Не удалось загрузить процесс'

        setProcess(null)
        setErrorMessage(message)
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadProcess()

    return () => {
      abortController.abort()
    }
  }, [processId, requestVersion, serverUrl])

  if (!hasProcessId) {
    return {
      process: null,
      isLoading: false,
      errorMessage: 'Не передан идентификатор процесса',
      refetch: () => {
        setRequestVersion((version) => version + 1)
      },
    }
  }

  return {
    process,
    isLoading,
    errorMessage,
    refetch: () => {
      setRequestVersion((version) => version + 1)
    },
  }
}
