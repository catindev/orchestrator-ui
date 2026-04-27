import type { ProcessDetails, ProcessListItem, WorkflowResponse } from './types'
import {
  isWorkflowResponse,
  mapWorkflowToDetails,
  mapWorkflowToListItem,
} from './lib/process-view-model'
import { getWorkflowsEndpoint } from '../../shared/lib/orchestrator-server'

async function fetchWorkflows(
  serverUrl: string,
  signal?: AbortSignal,
): Promise<WorkflowResponse[]> {
  const response = await fetch(getWorkflowsEndpoint(serverUrl), { signal })

  if (!response.ok) {
    throw new Error(`Не удалось загрузить процессы: ${response.status}`)
  }

  const payload: unknown = await response.json()

  if (!Array.isArray(payload)) {
    throw new Error('Некорректный формат ответа workflows API')
  }

  return payload.filter(isWorkflowResponse)
}

export async function fetchRootProcesses(
  serverUrl: string,
  signal?: AbortSignal,
): Promise<ProcessListItem[]> {
  const workflows = await fetchWorkflows(serverUrl, signal)

  return workflows
    .filter((workflow) => workflow.parentProcessId == null)
    .map(mapWorkflowToListItem)
}

export async function fetchProcessDetails(
  serverUrl: string,
  processId: string,
  signal?: AbortSignal,
): Promise<ProcessDetails> {
  const workflows = await fetchWorkflows(serverUrl, signal)
  const process = workflows.find((workflow) => workflow.processId === processId)

  if (!process) {
    throw new Error(`Процесс ${processId} не найден`)
  }

  return mapWorkflowToDetails(process, workflows)
}
