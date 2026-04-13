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

type BeneficiaryInput = {
  type?: string
  inn?: string
  participationId?: string
  contacts?: {
    email?: string
    phone?: string
  }
  fl?: {
    firstName?: string
    middleName?: string
    lastName?: string
  }
  ip?: {
    firstName?: string
    middleName?: string
    lastName?: string
  }
  ul?: {
    fullNameRu?: string
    shortNameRu?: string
    fullName?: string
    shortName?: string
    name?: string
  }
}

type WorkflowResultSummary = {
  outcome?: string
  message?: string
}

type StagePresentation = {
  label: string
  summary: string
}

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

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function pickValidationIssueMessage(workflow: WorkflowResponse): string | null {
  const checks = asRecord(workflow.context?.checks)
  const validation = asRecord(checks?.validation)
  const issues = Array.isArray(validation?.issues) ? validation.issues : []

  for (const issue of issues) {
    const message = asString(asRecord(issue)?.message)

    if (message) {
      return message
    }
  }

  return null
}

function pickWorkflowResultSummary(workflow: WorkflowResponse): WorkflowResultSummary {
  const result = asRecord(workflow.result)

  return {
    outcome: asString(result?.outcome) ?? undefined,
    message: asString(result?.message) ?? undefined,
  }
}

function mapBeneficiaryTypeLabel(type: string | undefined): string {
  switch (type) {
    case 'FL_RESIDENT':
      return 'Физлицо-резидент'
    case 'FL_NON_RESIDENT':
      return 'Физлицо-нерезидент'
    case 'IP_RESIDENT':
      return 'ИП-резидент'
    case 'UL_RESIDENT':
      return 'Юрлицо-резидент'
    case 'UL_NON_RESIDENT':
      return 'Юрлицо-нерезидент'
    default:
      return 'Тип не определен'
  }
}

function formatPersonName(person: BeneficiaryInput['fl'] | BeneficiaryInput['ip']) {
  if (!person) {
    return null
  }

  const parts = [person.lastName, person.firstName, person.middleName].filter(
    (part): part is string => Boolean(part && part.trim()),
  )

  return parts.length > 0 ? parts.join(' ') : null
}

function formatBeneficiaryName(beneficiary: BeneficiaryInput | null): string {
  if (!beneficiary) {
    return 'Бенефициар'
  }

  const naturalPersonName =
    formatPersonName(beneficiary.fl) ?? formatPersonName(beneficiary.ip)

  if (naturalPersonName) {
    return naturalPersonName
  }

  const legalEntityName =
    beneficiary.ul?.shortNameRu ??
    beneficiary.ul?.fullNameRu ??
    beneficiary.ul?.shortName ??
    beneficiary.ul?.fullName ??
    beneficiary.ul?.name

  return legalEntityName && legalEntityName.trim().length > 0
    ? legalEntityName.trim()
    : 'Бенефициар без имени'
}

function mapTerminalStagePresentation(
  workflow: WorkflowResponse,
): StagePresentation | null {
  const { outcome, message } = pickWorkflowResultSummary(workflow)
  const validationIssueMessage = pickValidationIssueMessage(workflow)

  switch (outcome) {
    case 'BENEFICIARY_REGISTERED':
      return {
        label: 'Регистрация завершена',
        summary: 'Бенефициар зарегистрирован и привязан к номинальному счету.',
      }
    case 'VALIDATION_REJECT':
      return {
        label: 'Отклонена проверкой анкеты',
        summary:
          validationIssueMessage ??
          'Анкета не прошла обязательные проверки полноты и ограничений.',
      }
    case 'ADDRESS_NOT_VERIFIED':
      return {
        label: 'Отклонена проверкой адреса',
        summary: 'Адрес бенефициара не прошел проверку или не был подтвержден.',
      }
    case 'TECHNICAL_FAILURE':
      return {
        label: 'Остановлена технической ошибкой',
        summary:
          message ??
          'Во время исполнения процесса произошла техническая ошибка.',
      }
    case 'POC_SCENARIO_NOT_SUPPORTED':
      return {
        label: 'Сценарий не поддержан',
        summary:
          message ??
          'В текущем PoC поддержан не весь набор сценариев регистрации.',
      }
    default:
      return null
  }
}

function mapRootStagePresentation(workflow: WorkflowResponse): StagePresentation {
  const terminalStage = mapTerminalStagePresentation(workflow)

  if (terminalStage) {
    return terminalStage
  }

  switch (workflow.currentStepId) {
    case 'route_by_supported_scenario':
    case 'validate_fl_resident_request':
    case 'derive_validation_facts':
    case 'choose_validation_outcome':
    case 'switch_validation_outcome':
      return {
        label: 'Проверка анкеты',
        summary:
          'Проверяем полноту данных, регуляторные ограничения и причину возможного отклонения.',
      }
    case 'validate_registration_address':
    case 'wait_validate_registration_address':
    case 'extract_address_validation_result':
    case 'route_after_address_validation':
      return {
        label: 'Проверка адреса',
        summary:
          'Проверяем и нормализуем адрес регистрации бенефициара.',
      }
    case 'run_abs_ensure_fl_resident_beneficiary':
    case 'wait_abs_ensure_fl_resident_beneficiary':
      return {
        label: 'Регистрация в АБС',
        summary:
          'Выполняем поиск, создание и привязку бенефициара в АБС.',
      }
    default:
      return {
        label: 'Обработка заявки',
        summary: 'Процесс выполняется и ожидает следующего действия.',
      }
  }
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
  const beneficiary =
    (asRecord(workflow.context?.input?.application)?.beneficiary as BeneficiaryInput | undefined) ??
    null
  const stagePresentation = mapRootStagePresentation(workflow)
  const beneficiaryTypeLabel = mapBeneficiaryTypeLabel(beneficiary?.type)
  const inn = beneficiary?.inn?.trim()
  const participationId = beneficiary?.participationId?.trim()
  const beneficiaryMetaParts = [
    inn ? `ИНН ${inn}` : null,
    beneficiaryTypeLabel,
  ].filter(Boolean)
  const requestMeta = participationId
    ? `Participation ID: ${participationId}`
    : `Process ID: ${workflow.processId}`
  const searchableText = [
    workflow.applicationRequestId,
    workflow.processId,
    formatBeneficiaryName(beneficiary),
    beneficiaryTypeLabel,
    inn,
    participationId,
    beneficiary?.contacts?.email,
    beneficiary?.contacts?.phone,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return {
    processId: workflow.processId,
    applicationRequestId: workflow.applicationRequestId,
    beneficiaryName: formatBeneficiaryName(beneficiary),
    beneficiaryMeta: beneficiaryMetaParts.join(' • '),
    requestMeta,
    stageLabel: stagePresentation.label,
    stageSummary: stagePresentation.summary,
    createdAt: formatWorkflowTimestamp(workflow.createdAt),
    updatedAt: formatWorkflowTimestamp(workflow.updatedAt),
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    searchableText,
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
