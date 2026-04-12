import type {
  ProcessDetails,
  ProcessHistoryItem,
  ProcessListItem,
  ProcessStatusTone,
  SubprocessListItem,
  WorkflowResponse,
} from './types'

const WORKFLOWS_ENDPOINT = '/api/v1/workflows'
const HUMAN_DATE_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function isWorkflowResponse(value: unknown): value is WorkflowResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.processId === 'string' &&
    typeof candidate.applicationRequestId === 'string' &&
    typeof candidate.rootProcessId === 'string' &&
    typeof candidate.id === 'string' &&
    typeof candidate.status === 'string' &&
    typeof candidate.currentStepId === 'string' &&
    typeof candidate.currentStepType === 'string' &&
    typeof candidate.version === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  )
}

function formatWorkflowTimestamp(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  const parts = HUMAN_DATE_FORMATTER.formatToParts(date)
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''

  const day = getPart('day')
  const month = getPart('month').replace('.', '').toLowerCase()
  const year = getPart('year')
  const hour = getPart('hour')
  const minute = getPart('minute')

  return `${day} ${month} ${year} в ${hour}:${minute}`
}

function mapStatusPresentation(status: string): {
  label: string
  tone: ProcessStatusTone
} {
  switch (status) {
    case 'COMPLETE':
      return { label: 'ВЫПОЛНЕНА', tone: 'success' }
    case 'FAIL':
      return { label: 'ОШИБКА', tone: 'error' }
    default:
      return { label: 'В ПРОЦЕССЕ', tone: 'neutral' }
  }
}

function mapWorkflowToListItem(workflow: WorkflowResponse): ProcessListItem {
  const statusPresentation = mapStatusPresentation(workflow.status)

  return {
    processId: workflow.processId,
    applicationRequestId: workflow.applicationRequestId,
    createdAt: formatWorkflowTimestamp(workflow.createdAt),
    updatedAt: formatWorkflowTimestamp(workflow.updatedAt),
    currentStep: workflow.currentStepType,
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
  }
}

function formatHistoryDetails(details: Record<string, unknown> | undefined) {
  if (!details || Object.keys(details).length === 0) {
    return null
  }

  return Object.entries(details)
    .map(([key, value]) => {
      const formattedValue =
        typeof value === 'string'
          ? value
          : JSON.stringify(value)

      return `${key}: ${formattedValue}`
    })
    .join(', ')
}

function mapWorkflowHistory(history: WorkflowResponse['history']): ProcessHistoryItem[] {
  return (history ?? []).map((event) => ({
    at: formatWorkflowTimestamp(event.at),
    kind: event.kind,
    stepId: event.stepId,
    details: formatHistoryDetails(event.details),
  }))
}

function mapWorkflowToSubprocessListItem(
  workflow: WorkflowResponse,
): SubprocessListItem {
  return {
    processId: workflow.processId,
    createdAt: formatWorkflowTimestamp(workflow.createdAt),
    updatedAt: formatWorkflowTimestamp(workflow.updatedAt),
    currentStepType: workflow.currentStepType,
    status: workflow.status,
  }
}

function pickProcessContextSummary(workflow: WorkflowResponse) {
  const nextSummary: Record<string, unknown> = {}

  if (workflow.context?.facts !== undefined) {
    nextSummary.facts = workflow.context.facts
  }

  if (workflow.context?.checks !== undefined) {
    nextSummary.checks = workflow.context.checks
  }

  if (workflow.context?.effects !== undefined) {
    nextSummary.effects = workflow.context.effects
  }

  if (workflow.context?.decisions !== undefined) {
    nextSummary.decisions = workflow.context.decisions
  }

  return Object.keys(nextSummary).length > 0 ? nextSummary : null
}

function mapWorkflowToDetails(
  workflow: WorkflowResponse,
  allWorkflows: WorkflowResponse[],
): ProcessDetails {
  const subprocesses = allWorkflows
    .filter((candidate) => candidate.parentProcessId === workflow.processId)
    .map(mapWorkflowToSubprocessListItem)

  return {
    processId: workflow.processId,
    parentProcessId: workflow.parentProcessId ?? null,
    applicationRequestId: workflow.applicationRequestId,
    createdAt: formatWorkflowTimestamp(workflow.createdAt),
    updatedAt: formatWorkflowTimestamp(workflow.updatedAt),
    currentStepType: workflow.currentStepType,
    currentStepId: workflow.currentStepId,
    status: workflow.status,
    version: workflow.version,
    workflowId: workflow.id,
    traceMode: workflow.traceMode ?? 'basic',
    inputApplication: workflow.context?.input?.application ?? null,
    contextSummary: pickProcessContextSummary(workflow),
    resultData: workflow.result ?? null,
    history: mapWorkflowHistory(workflow.history),
    subprocesses,
  }
}

async function fetchWorkflows(signal?: AbortSignal): Promise<WorkflowResponse[]> {
  const response = await fetch(WORKFLOWS_ENDPOINT, { signal })

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
  signal?: AbortSignal,
): Promise<ProcessListItem[]> {
  const workflows = await fetchWorkflows(signal)

  return workflows
    .filter((workflow) => workflow.parentProcessId == null)
    .map(mapWorkflowToListItem)
}

export async function fetchProcessDetails(
  processId: string,
  signal?: AbortSignal,
): Promise<ProcessDetails> {
  const workflows = await fetchWorkflows(signal)
  const process = workflows.find((workflow) => workflow.processId === processId)

  if (!process) {
    throw new Error(`Процесс ${processId} не найден`)
  }

  return mapWorkflowToDetails(process, workflows)
}
