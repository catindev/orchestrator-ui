export type WorkflowResponse = {
  processId: string
  applicationRequestId: string
  parentProcessId?: string | null
  rootProcessId: string
  id: string
  status: string
  currentStepId: string
  currentStepType: string
  currentStepSubtype?: string | null
  version: string
  traceMode?: string | null
  context?: {
    facts?: unknown
    checks?: unknown
    effects?: unknown
    decisions?: unknown
    input?: {
      application?: unknown
    }
  }
  result?: unknown
  history?: WorkflowHistoryEvent[]
  createdAt: string
  updatedAt: string
}

export type WorkflowHistoryEvent = {
  at: string
  kind: string
  stepId: string
  details?: Record<string, unknown>
}

export type ProcessStatusTone = 'success' | 'error' | 'neutral'

export type ProcessListItem = {
  processId: string
  applicationRequestId: string
  createdAt: string
  updatedAt: string
  currentStep: string
  statusLabel: string
  statusTone: ProcessStatusTone
}

export type ProcessDetails = {
  processId: string
  parentProcessId: string | null
  applicationRequestId: string
  createdAt: string
  updatedAt: string
  currentStepType: string
  currentStepId: string
  status: string
  version: string
  workflowId: string
  traceMode: string
  inputApplication: unknown | null
  contextSummary: Record<string, unknown> | null
  resultData: unknown | null
  history: ProcessHistoryItem[]
  subprocesses: SubprocessListItem[]
}

export type ProcessHistoryItem = {
  at: string
  kind: string
  stepId: string
  details: string | null
}

export type SubprocessListItem = {
  processId: string
  createdAt: string
  updatedAt: string
  currentStepType: string
  status: string
}

export type ProcessTabId =
  | 'input'
  | 'history'
  | 'context'
  | 'subprocesses'
  | 'result'

export const PROCESS_STATUS_LABELS = [
  'ВЫПОЛНЕНА',
  'ОШИБКА',
  'В ПРОЦЕССЕ',
] as const

export const LONGEST_PROCESS_STATUS_LABEL = PROCESS_STATUS_LABELS.reduce(
  (longestStatus, status) =>
    status.length > longestStatus.length ? status : longestStatus,
)
