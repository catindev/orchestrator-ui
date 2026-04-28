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
    steps?: Record<string, WorkflowContextStepState>
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

export type WorkflowContextStepState = {
  reason?: string | null
  status?: string
  requestId?: string
  startedAt?: string
  finishedAt?: string
  failureCode?: string | null
  selectedNextStepId?: string
}

export type ProcessStatusTone = 'success' | 'error' | 'neutral'

export type ProcessKind = 'root' | 'subprocess'

export type ProcessStageState =
  | 'completed'
  | 'active'
  | 'error'
  | 'pending'
  | 'skipped'

export type ProcessListItem = {
  processId: string
  applicationRequestId: string
  beneficiaryName: string
  beneficiaryMeta: string
  requestMeta: string
  stageLabel: string
  stageSummary: string
  createdAt: string
  updatedAt: string
  statusLabel: string
  statusTone: ProcessStatusTone
  searchableText: string
}

export type ProcessDetails = {
  processId: string
  parentProcessId: string | null
  applicationRequestId: string
  kind: ProcessKind
  statusLabel: string
  statusTone: ProcessStatusTone
  overviewPrimary: ProcessOverviewItem[]
  overviewSecondary: ProcessOverviewItem[]
  inputApplication: unknown | null
  contextSummary: Record<string, unknown> | null
  resultData: unknown | null
  history: ProcessHistoryItem[]
  subprocesses: SubprocessListItem[]
  subflowHandoff: ProcessSubflowHandoff | null
  stages: ProcessStageItem[]
}

export type ProcessHistoryItem = {
  at: string
  kind: string
  kindLabel: string
  stepId: string
  stepLabel: string
  details: string | null
}

export type SubprocessListItem = {
  processId: string
  title: string
  stageLabel: string
  summary: string
  createdAt: string
  updatedAt: string
  statusLabel: string
  statusTone: ProcessStatusTone
}

export type ProcessTabId =
  | 'stages'
  | 'input'
  | 'history'
  | 'context'
  | 'subprocesses'
  | 'result'

export type ProcessOverviewItem = {
  label: string
  value: string
  description?: string
  compact?: boolean
  copyValue?: string
}

export type StepKind =
  | 'rules'
  | 'prepare'
  | 'send'
  | 'wait'
  | 'extract'
  | 'decision'
  | 'finish'

export type StepEvidencePanel = {
  title: string
  data: unknown
}

export type StepEvidencePanels = Partial<{
  request: StepEvidencePanel
  response: StepEvidencePanel
  facts: StepEvidencePanel
  decision: StepEvidencePanel
  meta: StepEvidencePanel
}>

export type StepEvidenceItem = {
  stepId: string
  title: string
  kind: StepKind
  status: string | null
  summary: string | null
  error: string | null
  startedAt: string | null
  finishedAt: string | null
  panels: StepEvidencePanels
}

export type ProcessSubflowHandoff = {
  parentInput: unknown
  childInput: unknown
  isDifferent: boolean
}

export type ProcessStageItem = {
  id: string
  title: string
  state: ProcessStageState
  stateLabel: string
  summary: string
  details: string[]
  startedAt: string | null
  finishedAt: string | null
  steps: StepEvidenceItem[]
}

export const PROCESS_STATUS_LABELS = [
  'ВЫПОЛНЕНА',
  'ОШИБКА',
  'В ПРОЦЕССЕ',
] as const

export const LONGEST_PROCESS_STATUS_LABEL = PROCESS_STATUS_LABELS.reduce(
  (longestStatus, status) =>
    status.length > longestStatus.length ? status : longestStatus,
)
