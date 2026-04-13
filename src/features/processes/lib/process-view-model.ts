import type {
  ProcessDetails,
  ProcessHistoryItem,
  ProcessListItem,
  ProcessOverviewItem,
  ProcessStageItem,
  ProcessStageState,
  ProcessStatusTone,
  SubprocessListItem,
  WorkflowContextStepState,
  WorkflowResponse,
} from '../types'

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

type StepMap = Record<string, WorkflowContextStepState>

type EffectResult = {
  requestId: string | null
  accepted: boolean | null
  status: string | null
  errorMessage: string | null
  result: Record<string, unknown> | null
}

const ROOT_VALIDATION_STEPS = [
  'route_by_supported_scenario',
  'validate_fl_resident_request',
  'derive_validation_facts',
  'choose_validation_outcome',
  'switch_validation_outcome',
  'finish_reject_validation',
  'finish_fail_poc_scenario_not_supported',
] as const

const ROOT_ADDRESS_STEPS = [
  'validate_registration_address',
  'wait_validate_registration_address',
  'extract_address_validation_result',
  'route_after_address_validation',
  'finish_reject_address',
] as const

const ROOT_ABS_STEPS = [
  'run_abs_ensure_fl_resident_beneficiary',
  'wait_abs_ensure_fl_resident_beneficiary',
] as const

const ROOT_RESULT_STEPS = [
  'finish_success',
  'finish_reject_validation',
  'finish_reject_address',
  'finish_fail_poc_scenario_not_supported',
  'finish_fail_technical',
] as const

const SUBPROCESS_FIND_STEPS = [
  'send_find_client',
  'wait_find_client',
  'choose_find_client_scenario',
  'switch_find_client_scenario',
] as const

const SUBPROCESS_CREATE_STEPS = [
  'send_create_client',
  'wait_create_client',
]

const SUBPROCESS_BIND_STEPS = [
  'send_bind_client',
  'wait_bind_client',
]

const SUBPROCESS_RESULT_STEPS = ['finish_success', 'finish_fail'] as const

const STAGE_STATE_LABELS: Record<ProcessStageState, string> = {
  completed: 'Завершен',
  active: 'В работе',
  error: 'Требует внимания',
  pending: 'Ожидает',
  skipped: 'Пропущен',
}

const HISTORY_KIND_LABELS: Record<string, string> = {
  STEP_COMPLETED: 'Шаг завершен',
  STEP_WAITING: 'Ожидание ответа',
  STEP_RESUMED: 'Шаг возобновлен',
  STEP_FAILED: 'Шаг завершился ошибкой',
}

const STEP_LABELS: Record<string, string> = {
  route_by_supported_scenario: 'Определение сценария',
  validate_fl_resident_request: 'Первичная валидация заявки',
  derive_validation_facts: 'Сбор фактов проверки',
  choose_validation_outcome: 'Определение результата валидации',
  switch_validation_outcome: 'Переход по результату валидации',
  finish_reject_validation: 'Завершение с отказом по валидации',
  finish_fail_poc_scenario_not_supported: 'Завершение из-за неподдержанного сценария',
  validate_registration_address: 'Запуск проверки адреса',
  wait_validate_registration_address: 'Ожидание проверки адреса',
  extract_address_validation_result: 'Разбор результата проверки адреса',
  route_after_address_validation: 'Переход после проверки адреса',
  finish_reject_address: 'Завершение с отказом по адресу',
  run_abs_ensure_fl_resident_beneficiary: 'Запуск регистрации в АБС',
  wait_abs_ensure_fl_resident_beneficiary: 'Ожидание результата АБС',
  finish_success: 'Успешное завершение',
  finish_fail_technical: 'Завершение с технической ошибкой',
  send_find_client: 'Поиск клиента в АБС',
  wait_find_client: 'Ожидание ответа поиска клиента',
  choose_find_client_scenario: 'Выбор сценария после поиска',
  switch_find_client_scenario: 'Переход по сценарию поиска',
  send_create_client: 'Создание клиента в АБС',
  wait_create_client: 'Ожидание создания клиента',
  send_bind_client: 'Привязка клиента',
  wait_bind_client: 'Ожидание привязки клиента',
  finish_fail: 'Завершение подпроцесса с ошибкой',
}

export function isWorkflowResponse(value: unknown): value is WorkflowResponse {
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

export function formatWorkflowTimestamp(value: string) {
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

function asBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function getBeneficiary(workflow: WorkflowResponse): BeneficiaryInput | null {
  const application = asRecord(workflow.context?.input?.application)
  const beneficiary = asRecord(application?.beneficiary)

  return beneficiary as BeneficiaryInput | null
}

function getStepMap(workflow: WorkflowResponse): StepMap {
  const rawSteps = asRecord(workflow.context?.steps)

  if (!rawSteps) {
    return {}
  }

  return rawSteps as StepMap
}

function getStepLabel(stepId: string): string {
  return STEP_LABELS[stepId] ?? stepId
}

function getHistoryKindLabel(kind: string): string {
  return HISTORY_KIND_LABELS[kind] ?? kind
}

function getTerminalOutcome(workflow: WorkflowResponse): string | null {
  return asString(asRecord(workflow.result)?.outcome)
}

function getValidationIssues(workflow: WorkflowResponse): Record<string, unknown>[] {
  const checks = asRecord(workflow.context?.checks)
  const validation = asRecord(checks?.validation)
  const issues = Array.isArray(validation?.issues) ? validation.issues : []

  return issues.map((issue) => asRecord(issue)).filter(Boolean) as Record<string, unknown>[]
}

function getValidationIssueMessages(workflow: WorkflowResponse): string[] {
  return getValidationIssues(workflow)
    .map((issue) => asString(issue.message))
    .filter((message): message is string => Boolean(message))
}

function pickValidationIssueMessage(workflow: WorkflowResponse): string | null {
  return getValidationIssueMessages(workflow)[0] ?? null
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

function formatBeneficiaryMeta(beneficiary: BeneficiaryInput | null): string {
  const beneficiaryTypeLabel = mapBeneficiaryTypeLabel(beneficiary?.type)
  const inn = beneficiary?.inn?.trim()

  return [inn ? `ИНН ${inn}` : null, beneficiaryTypeLabel]
    .filter(Boolean)
    .join(' • ')
}

function formatRequestMeta(beneficiary: BeneficiaryInput | null, processId: string): string {
  const participationId = beneficiary?.participationId?.trim()

  return participationId
    ? `Participation ID: ${participationId}`
    : `Process ID: ${processId}`
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
    case 'ABS_ENSURE_BENEFICIARY_DONE':
      return {
        label: 'Регистрация в АБС завершена',
        summary: 'Клиент обработан в АБС и привязан к номинальному счету.',
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
        summary: 'Проверяем и нормализуем адрес регистрации бенефициара.',
      }
    case 'run_abs_ensure_fl_resident_beneficiary':
    case 'wait_abs_ensure_fl_resident_beneficiary':
      return {
        label: 'Регистрация в АБС',
        summary: 'Выполняем поиск, создание и привязку бенефициара в АБС.',
      }
    default:
      return {
        label: 'Обработка заявки',
        summary: 'Процесс выполняется и ожидает следующего действия.',
      }
  }
}

function mapSubprocessStagePresentation(workflow: WorkflowResponse): StagePresentation {
  const terminalStage = mapTerminalStagePresentation(workflow)

  if (terminalStage) {
    return terminalStage
  }

  switch (workflow.currentStepId) {
    case 'send_find_client':
    case 'wait_find_client':
    case 'choose_find_client_scenario':
    case 'switch_find_client_scenario':
      return {
        label: 'Поиск клиента',
        summary: 'Проверяем, есть ли клиент в АБС и нужен ли сценарий создания.',
      }
    case 'send_create_client':
    case 'wait_create_client':
      return {
        label: 'Создание клиента',
        summary: 'Создаем карточку клиента в АБС, если поиск не дал результата.',
      }
    case 'send_bind_client':
    case 'wait_bind_client':
      return {
        label: 'Привязка клиента',
        summary: 'Связываем найденного или созданного клиента с номинальным счетом.',
      }
    default:
      return {
        label: 'Выполнение подпроцесса',
        summary: 'Подпроцесс выполняется и ожидает следующего действия.',
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

function getSearchableText(workflow: WorkflowResponse, beneficiary: BeneficiaryInput | null) {
  const beneficiaryTypeLabel = mapBeneficiaryTypeLabel(beneficiary?.type)
  const inn = beneficiary?.inn?.trim()
  const participationId = beneficiary?.participationId?.trim()

  return [
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
}

export function mapWorkflowToListItem(workflow: WorkflowResponse): ProcessListItem {
  const statusPresentation = mapStatusPresentation(workflow.status)
  const beneficiary = getBeneficiary(workflow)
  const stagePresentation = mapRootStagePresentation(workflow)

  return {
    processId: workflow.processId,
    applicationRequestId: workflow.applicationRequestId,
    beneficiaryName: formatBeneficiaryName(beneficiary),
    beneficiaryMeta: formatBeneficiaryMeta(beneficiary),
    requestMeta: formatRequestMeta(beneficiary, workflow.processId),
    stageLabel: stagePresentation.label,
    stageSummary: stagePresentation.summary,
    createdAt: formatWorkflowTimestamp(workflow.createdAt),
    updatedAt: formatWorkflowTimestamp(workflow.updatedAt),
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    searchableText: getSearchableText(workflow, beneficiary),
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
    kindLabel: getHistoryKindLabel(event.kind),
    stepId: event.stepId,
    stepLabel: getStepLabel(event.stepId),
    details: formatHistoryDetails(event.details),
  }))
}

function mapWorkflowToSubprocessListItem(
  workflow: WorkflowResponse,
): SubprocessListItem {
  const statusPresentation = mapStatusPresentation(workflow.status)
  const stagePresentation = mapSubprocessStagePresentation(workflow)

  return {
    processId: workflow.processId,
    title: 'Регистрация в АБС',
    stageLabel: stagePresentation.label,
    summary: stagePresentation.summary,
    createdAt: formatWorkflowTimestamp(workflow.createdAt),
    updatedAt: formatWorkflowTimestamp(workflow.updatedAt),
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
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

function getEffectResult(workflow: WorkflowResponse, effectKey: string): EffectResult {
  const effects = asRecord(workflow.context?.effects)
  const effect = asRecord(effects?.[effectKey])
  const result = asRecord(effect?.result)
  const waitResult = asRecord(effect?.waitResult)
  const waitResultResult = asRecord(waitResult?.result)
  const waitResultError = asRecord(waitResult?.error)
  const error = asRecord(effect?.error)

  return {
    requestId:
      asString(effect?.requestId) ??
      asString(waitResult?.requestId),
    accepted: typeof result?.accepted === 'boolean' ? (result.accepted as boolean) : null,
    status: asString(waitResultResult?.status) ?? asString(error?.status),
    errorMessage:
      asString(waitResultError?.message) ??
      asString(error?.message) ??
      asString(waitResult?.errorCode) ??
      asString(effect?.errorCode),
    result: waitResultResult ?? result,
  }
}

function getStepTiming(steps: StepMap, stepIds: readonly string[]) {
  const startedDates = stepIds
    .map((stepId) => asString(steps[stepId]?.startedAt))
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))

  const finishedDates = stepIds
    .map((stepId) => asString(steps[stepId]?.finishedAt))
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))

  const startedAt =
    startedDates.length > 0
      ? formatWorkflowTimestamp(
          new Date(Math.min(...startedDates.map((date) => date.getTime()))).toISOString(),
        )
      : null
  const finishedAt =
    finishedDates.length > 0
      ? formatWorkflowTimestamp(
          new Date(Math.max(...finishedDates.map((date) => date.getTime()))).toISOString(),
        )
      : null

  return { startedAt, finishedAt }
}

function hasStartedStep(steps: StepMap, stepIds: readonly string[]) {
  return stepIds.some((stepId) => Boolean(steps[stepId]))
}

function isCurrentStep(workflow: WorkflowResponse, stepIds: readonly string[]) {
  return stepIds.includes(workflow.currentStepId)
}

function hasFailedStep(steps: StepMap, stepIds: readonly string[]) {
  return stepIds.some((stepId) => steps[stepId]?.status === 'FAILED')
}

function isInProgressStatus(status: string) {
  return status !== 'COMPLETE' && status !== 'FAIL'
}

function buildStage(
  id: string,
  title: string,
  state: ProcessStageState,
  summary: string,
  details: string[],
  timing: { startedAt: string | null; finishedAt: string | null },
): ProcessStageItem {
  return {
    id,
    title,
    state,
    stateLabel: STAGE_STATE_LABELS[state],
    summary,
    details,
    startedAt: timing.startedAt,
    finishedAt: timing.finishedAt,
  }
}

function appendIfPresent(target: string[], label: string, value: string | null) {
  if (value) {
    target.push(`${label}: ${value}`)
  }
}

function getValidationStage(workflow: WorkflowResponse, steps: StepMap): ProcessStageItem {
  const timing = getStepTiming(steps, ROOT_VALIDATION_STEPS)
  const issues = getValidationIssueMessages(workflow)
  const facts = asRecord(asRecord(workflow.context?.facts)?.validation)
  const decision = asRecord(asRecord(workflow.context?.decisions)?.validation)
  const outcome = getTerminalOutcome(workflow)
  const details: string[] = []
  const resolutionClass = asString(facts?.resolutionClass)
  const engineOutcome = asString(decision?.outcome)
  const decisionReason = asString(decision?.reason)

  appendIfPresent(details, 'Класс резолюции', resolutionClass)
  appendIfPresent(details, 'Решение движка', engineOutcome)
  appendIfPresent(details, 'Причина решения', decisionReason)
  issues.slice(0, 3).forEach((message) => details.push(message))

  if (outcome === 'VALIDATION_REJECT') {
    return buildStage(
      'validation',
      'Проверка анкеты',
      'error',
      issues[0] ?? 'Анкета не прошла обязательные проверки и была отклонена.',
      details,
      timing,
    )
  }

  if (outcome === 'POC_SCENARIO_NOT_SUPPORTED') {
    return buildStage(
      'validation',
      'Проверка анкеты',
      'error',
      'Сценарий заявки не поддержан в текущем PoC.',
      details,
      timing,
    )
  }

  if (hasFailedStep(steps, ROOT_VALIDATION_STEPS)) {
    return buildStage(
      'validation',
      'Проверка анкеты',
      'error',
      'Во время проверки анкеты произошла техническая ошибка.',
      details,
      timing,
    )
  }

  if (isCurrentStep(workflow, ROOT_VALIDATION_STEPS) && isInProgressStatus(workflow.status)) {
    return buildStage(
      'validation',
      'Проверка анкеты',
      'active',
      'Проверяем анкету, ограничения и причины возможного отклонения.',
      details,
      timing,
    )
  }

  if (
    hasStartedStep(steps, ROOT_VALIDATION_STEPS) ||
    hasStartedStep(steps, ROOT_ADDRESS_STEPS) ||
    hasStartedStep(steps, ROOT_ABS_STEPS) ||
    !isInProgressStatus(workflow.status)
  ) {
    return buildStage(
      'validation',
      'Проверка анкеты',
      'completed',
      issues.length > 0
        ? 'Проверка завершена, ограничения и замечания учтены.'
        : 'Проверка анкеты пройдена, можно продолжать обработку.',
      details,
      timing,
    )
  }

  return buildStage(
    'validation',
    'Проверка анкеты',
    'pending',
    'Этап еще не начался.',
    details,
    timing,
  )
}

function getAddressStage(workflow: WorkflowResponse, steps: StepMap): ProcessStageItem {
  const timing = getStepTiming(steps, ROOT_ADDRESS_STEPS)
  const outcome = getTerminalOutcome(workflow)
  const addressCheck = asRecord(asRecord(workflow.context?.facts)?.address_check)
  const validationResult = getEffectResult(workflow, 'validate_registration_address')
  const normalizedAddress = asString(
    asRecord(asRecord(validationResult.result?.address)?.normalized)?.addressStr,
  )
  const addressValid = asBoolean(addressCheck?.valid)
  const details: string[] = []

  appendIfPresent(details, 'Request ID', validationResult.requestId)
  appendIfPresent(details, 'Статус сервиса', validationResult.status)
  appendIfPresent(details, 'Нормализованный адрес', normalizedAddress)

  if (
    outcome === 'VALIDATION_REJECT' ||
    outcome === 'POC_SCENARIO_NOT_SUPPORTED'
  ) {
    return buildStage(
      'address',
      'Проверка адреса',
      'skipped',
      'До проверки адреса дело не дошло, процесс завершился на более раннем этапе.',
      details,
      timing,
    )
  }

  if (outcome === 'ADDRESS_NOT_VERIFIED') {
    return buildStage(
      'address',
      'Проверка адреса',
      'error',
      validationResult.errorMessage ??
        'Адрес не прошел проверку или не был подтвержден внешним сервисом.',
      details,
      timing,
    )
  }

  if (hasFailedStep(steps, ROOT_ADDRESS_STEPS)) {
    return buildStage(
      'address',
      'Проверка адреса',
      'error',
      'Во время проверки адреса произошла техническая ошибка.',
      details,
      timing,
    )
  }

  if (isCurrentStep(workflow, ROOT_ADDRESS_STEPS) && isInProgressStatus(workflow.status)) {
    return buildStage(
      'address',
      'Проверка адреса',
      'active',
      validationResult.accepted
        ? 'Запрос на проверку адреса отправлен, ожидаем результат.'
        : 'Проверяем и нормализуем адрес регистрации бенефициара.',
      details,
      timing,
    )
  }

  if (hasStartedStep(steps, ROOT_ADDRESS_STEPS) || hasStartedStep(steps, ROOT_ABS_STEPS)) {
    return buildStage(
      'address',
      'Проверка адреса',
      'completed',
      addressValid === false
        ? 'Адрес проверен, но не подтвержден.'
        : normalizedAddress
          ? 'Адрес подтвержден и нормализован внешним сервисом.'
          : 'Проверка адреса завершена успешно.',
      details,
      timing,
    )
  }

  return buildStage(
    'address',
    'Проверка адреса',
    'pending',
    'Этап еще не начался.',
    details,
    timing,
  )
}

function describeAbsOutcome(subprocesses: WorkflowResponse[]): { summary: string; details: string[] } {
  const child = subprocesses[0]

  if (!child) {
    return {
      summary: 'Подпроцесс регистрации в АБС еще не стартовал.',
      details: [],
    }
  }

  const findClientResult = getEffectResult(child, 'send_find_client')
  const createClientResult = getEffectResult(child, 'send_create_client')
  const bindClientResult = getEffectResult(child, 'send_bind_client')
  const createPayload = asRecord(createClientResult.result?.payload)
  const createdClient = asRecord(createPayload?.client)
  const createClientId = asString(createdClient?.id)
  const bindPayload = asRecord(bindClientResult.result?.payload)
  const link = asRecord(bindPayload?.link)
  const bindingId = asString(link?.bindingId)
  const clientId = asString(link?.clientId) ?? createClientId
  const details: string[] = []

  appendIfPresent(details, 'Подпроцесс', child.processId)
  appendIfPresent(details, 'Client ID', clientId)
  appendIfPresent(details, 'Binding ID', bindingId)

  if (findClientResult.errorMessage) {
    details.push(`Поиск клиента: ${findClientResult.errorMessage}`)
  }

  if (createClientId) {
    details.push('В АБС создана новая карточка клиента.')
  }

  if (bindingId) {
    details.push('Клиент привязан к номинальному счету.')
  }

  if (findClientResult.errorMessage) {
    return {
      summary:
        'Клиент не найден в АБС, поэтому была создана новая карточка и выполнена привязка.',
      details,
    }
  }

  if (bindClientResult.status === 'SUCCESS') {
    return {
      summary: 'Клиент найден в АБС и привязан к номинальному счету.',
      details,
    }
  }

  if (isInProgressStatus(child.status)) {
    return {
      summary: 'Выполняем операции в АБС: поиск, создание карточки и привязку.',
      details,
    }
  }

  return {
    summary: 'Подпроцесс регистрации в АБС завершен.',
    details,
  }
}

function getAbsStage(
  workflow: WorkflowResponse,
  steps: StepMap,
  subprocesses: WorkflowResponse[],
): ProcessStageItem {
  const timing = getStepTiming(steps, ROOT_ABS_STEPS)
  const outcome = getTerminalOutcome(workflow)
  const absOutcome = describeAbsOutcome(subprocesses)

  if (
    outcome === 'VALIDATION_REJECT' ||
    outcome === 'POC_SCENARIO_NOT_SUPPORTED' ||
    outcome === 'ADDRESS_NOT_VERIFIED'
  ) {
    return buildStage(
      'abs',
      'Регистрация в АБС',
      'skipped',
      'До операций в АБС дело не дошло, процесс завершился раньше.',
      absOutcome.details,
      timing,
    )
  }

  if (subprocesses.some((subprocess) => subprocess.status === 'FAIL')) {
    return buildStage(
      'abs',
      'Регистрация в АБС',
      'error',
      'Подпроцесс в АБС завершился ошибкой и требует проверки.',
      absOutcome.details,
      timing,
    )
  }

  if (
    isCurrentStep(workflow, ROOT_ABS_STEPS) ||
    subprocesses.some((subprocess) => isInProgressStatus(subprocess.status))
  ) {
    return buildStage(
      'abs',
      'Регистрация в АБС',
      'active',
      absOutcome.summary,
      absOutcome.details,
      timing,
    )
  }

  if (
    hasStartedStep(steps, ROOT_ABS_STEPS) ||
    subprocesses.some((subprocess) => subprocess.status === 'COMPLETE') ||
    outcome === 'BENEFICIARY_REGISTERED'
  ) {
    return buildStage(
      'abs',
      'Регистрация в АБС',
      'completed',
      absOutcome.summary,
      absOutcome.details,
      timing,
    )
  }

  return buildStage(
    'abs',
    'Регистрация в АБС',
    'pending',
    'Этап еще не начался.',
    absOutcome.details,
    timing,
  )
}

function getResultStage(workflow: WorkflowResponse, steps: StepMap): ProcessStageItem {
  const timing = getStepTiming(steps, ROOT_RESULT_STEPS)
  const terminalStage = mapTerminalStagePresentation(workflow)
  const details: string[] = []
  const outcome = getTerminalOutcome(workflow)

  appendIfPresent(details, 'Outcome', outcome)

  if (workflow.status === 'COMPLETE') {
    return buildStage(
      'result',
      'Итог обработки',
      'completed',
      terminalStage?.summary ?? 'Процесс завершен успешно.',
      details,
      timing,
    )
  }

  if (workflow.status === 'FAIL') {
    return buildStage(
      'result',
      'Итог обработки',
      'error',
      terminalStage?.summary ?? 'Процесс завершен с ошибкой.',
      details,
      timing,
    )
  }

  return buildStage(
    'result',
    'Итог обработки',
    'pending',
    'Финальный результат пока не сформирован.',
    details,
    timing,
  )
}

function getFindClientStage(workflow: WorkflowResponse, steps: StepMap): ProcessStageItem {
  const timing = getStepTiming(steps, SUBPROCESS_FIND_STEPS)
  const findResult = getEffectResult(workflow, 'send_find_client')
  const details: string[] = []

  appendIfPresent(details, 'Request ID', findResult.requestId)
  appendIfPresent(details, 'Статус ответа', findResult.status)

  if (findResult.errorMessage) {
    details.push(findResult.errorMessage)
  }

  if (isCurrentStep(workflow, SUBPROCESS_FIND_STEPS) && isInProgressStatus(workflow.status)) {
    return buildStage(
      'find_client',
      'Поиск клиента',
      'active',
      'Ищем клиента в АБС и определяем, нужен ли сценарий создания.',
      details,
      timing,
    )
  }

  if (findResult.errorMessage) {
    return buildStage(
      'find_client',
      'Поиск клиента',
      'completed',
      'Клиент в АБС не найден, поэтому запускаем создание новой карточки.',
      details,
      timing,
    )
  }

  if (hasStartedStep(steps, SUBPROCESS_FIND_STEPS)) {
    return buildStage(
      'find_client',
      'Поиск клиента',
      'completed',
      'Клиент найден в АБС, можно переходить к привязке.',
      details,
      timing,
    )
  }

  return buildStage(
    'find_client',
    'Поиск клиента',
    'pending',
    'Этап еще не начался.',
    details,
    timing,
  )
}

function getCreateClientStage(workflow: WorkflowResponse, steps: StepMap): ProcessStageItem {
  const timing = getStepTiming(steps, SUBPROCESS_CREATE_STEPS)
  const findResult = getEffectResult(workflow, 'send_find_client')
  const createResult = getEffectResult(workflow, 'send_create_client')
  const clientPayload = asRecord(asRecord(createResult.result?.payload)?.client)
  const createdClientId = asString(clientPayload?.id)
  const details: string[] = []

  appendIfPresent(details, 'Request ID', createResult.requestId)
  appendIfPresent(details, 'Client ID', createdClientId)

  if (findResult.errorMessage == null && !hasStartedStep(steps, SUBPROCESS_CREATE_STEPS)) {
    return buildStage(
      'create_client',
      'Создание клиента',
      'skipped',
      'Создание карточки не понадобилось: клиент уже существовал в АБС.',
      details,
      timing,
    )
  }

  if (isCurrentStep(workflow, SUBPROCESS_CREATE_STEPS) && isInProgressStatus(workflow.status)) {
    return buildStage(
      'create_client',
      'Создание клиента',
      'active',
      'Создаем новую карточку клиента в АБС.',
      details,
      timing,
    )
  }

  if (hasFailedStep(steps, SUBPROCESS_CREATE_STEPS)) {
    return buildStage(
      'create_client',
      'Создание клиента',
      'error',
      'Во время создания клиента произошла ошибка.',
      details,
      timing,
    )
  }

  if (hasStartedStep(steps, SUBPROCESS_CREATE_STEPS)) {
    return buildStage(
      'create_client',
      'Создание клиента',
      'completed',
      createdClientId
        ? 'Новая карточка клиента в АБС создана.'
        : 'Создание клиента завершено.',
      details,
      timing,
    )
  }

  return buildStage(
    'create_client',
    'Создание клиента',
    'pending',
    'Этап еще не начался.',
    details,
    timing,
  )
}

function getBindClientStage(workflow: WorkflowResponse, steps: StepMap): ProcessStageItem {
  const timing = getStepTiming(steps, SUBPROCESS_BIND_STEPS)
  const bindResult = getEffectResult(workflow, 'send_bind_client')
  const bindPayload = asRecord(bindResult.result?.payload)
  const link = asRecord(bindPayload?.link)
  const clientId = asString(link?.clientId)
  const bindingId = asString(link?.bindingId)
  const details: string[] = []

  appendIfPresent(details, 'Request ID', bindResult.requestId)
  appendIfPresent(details, 'Client ID', clientId)
  appendIfPresent(details, 'Binding ID', bindingId)

  if (isCurrentStep(workflow, SUBPROCESS_BIND_STEPS) && isInProgressStatus(workflow.status)) {
    return buildStage(
      'bind_client',
      'Привязка клиента',
      'active',
      'Привязываем клиента к номинальному счету.',
      details,
      timing,
    )
  }

  if (hasFailedStep(steps, SUBPROCESS_BIND_STEPS)) {
    return buildStage(
      'bind_client',
      'Привязка клиента',
      'error',
      'Во время привязки клиента произошла ошибка.',
      details,
      timing,
    )
  }

  if (hasStartedStep(steps, SUBPROCESS_BIND_STEPS)) {
    return buildStage(
      'bind_client',
      'Привязка клиента',
      'completed',
      bindingId
        ? 'Клиент успешно привязан к номинальному счету.'
        : 'Привязка клиента завершена.',
      details,
      timing,
    )
  }

  return buildStage(
    'bind_client',
    'Привязка клиента',
    'pending',
    'Этап еще не начался.',
    details,
    timing,
  )
}

function getSubprocessResultStage(workflow: WorkflowResponse, steps: StepMap): ProcessStageItem {
  const timing = getStepTiming(steps, SUBPROCESS_RESULT_STEPS)
  const terminalStage = mapTerminalStagePresentation(workflow)
  const outcome = getTerminalOutcome(workflow)
  const details: string[] = []

  appendIfPresent(details, 'Outcome', outcome)

  if (workflow.status === 'COMPLETE') {
    return buildStage(
      'result',
      'Итог подпроцесса',
      'completed',
      terminalStage?.summary ?? 'Подпроцесс завершен успешно.',
      details,
      timing,
    )
  }

  if (workflow.status === 'FAIL') {
    return buildStage(
      'result',
      'Итог подпроцесса',
      'error',
      terminalStage?.summary ?? 'Подпроцесс завершен с ошибкой.',
      details,
      timing,
    )
  }

  return buildStage(
    'result',
    'Итог подпроцесса',
    'pending',
    'Финальный результат пока не сформирован.',
    details,
    timing,
  )
}

function buildRootStages(
  workflow: WorkflowResponse,
  subprocesses: WorkflowResponse[],
): ProcessStageItem[] {
  const steps = getStepMap(workflow)

  return [
    getValidationStage(workflow, steps),
    getAddressStage(workflow, steps),
    getAbsStage(workflow, steps, subprocesses),
    getResultStage(workflow, steps),
  ]
}

function buildSubprocessStages(workflow: WorkflowResponse): ProcessStageItem[] {
  const steps = getStepMap(workflow)

  return [
    getFindClientStage(workflow, steps),
    getCreateClientStage(workflow, steps),
    getBindClientStage(workflow, steps),
    getSubprocessResultStage(workflow, steps),
  ]
}

function buildOverviewPrimary(
  workflow: WorkflowResponse,
  beneficiary: BeneficiaryInput | null,
  stagePresentation: StagePresentation,
  statusPresentation: { label: string; tone: ProcessStatusTone },
): ProcessOverviewItem[] {
  return [
    {
      label: 'Бенефициар',
      value: formatBeneficiaryName(beneficiary),
      description: formatBeneficiaryMeta(beneficiary),
    },
    {
      label: 'Текущий этап',
      value: stagePresentation.label,
      description: stagePresentation.summary,
    },
    {
      label: 'Статус',
      value: statusPresentation.label,
      description: asString(asRecord(workflow.result)?.outcome) ?? 'Промежуточный статус процесса',
    },
    {
      label: 'Обновлено',
      value: formatWorkflowTimestamp(workflow.updatedAt),
      description: `Создан ${formatWorkflowTimestamp(workflow.createdAt)}`,
    },
  ]
}

function buildOverviewSecondary(
  workflow: WorkflowResponse,
  beneficiary: BeneficiaryInput | null,
): ProcessOverviewItem[] {
  const participationId = beneficiary?.participationId?.trim()

  return [
    {
      label: 'ID заявки',
      value: workflow.applicationRequestId,
      compact: true,
    },
    {
      label: 'Participation ID',
      value: participationId ?? 'Не указан',
      compact: true,
    },
    {
      label: 'ID процесса',
      value: workflow.processId,
      compact: true,
    },
    {
      label: 'Код процесса',
      value: workflow.id,
      compact: true,
    },
    {
      label: 'Версия',
      value: workflow.version,
      compact: true,
    },
  ]
}

export function mapWorkflowToDetails(
  workflow: WorkflowResponse,
  allWorkflows: WorkflowResponse[],
): ProcessDetails {
  const subprocessWorkflows = allWorkflows.filter(
    (candidate) => candidate.parentProcessId === workflow.processId,
  )
  const subprocesses = subprocessWorkflows.map(mapWorkflowToSubprocessListItem)
  const beneficiary = getBeneficiary(workflow)
  const statusPresentation = mapStatusPresentation(workflow.status)
  const isSubprocess = workflow.parentProcessId != null
  const stagePresentation = isSubprocess
    ? mapSubprocessStagePresentation(workflow)
    : mapRootStagePresentation(workflow)
  const stages = isSubprocess
    ? buildSubprocessStages(workflow)
    : buildRootStages(workflow, subprocessWorkflows)

  return {
    processId: workflow.processId,
    parentProcessId: workflow.parentProcessId ?? null,
    applicationRequestId: workflow.applicationRequestId,
    kind: isSubprocess ? 'subprocess' : 'root',
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    overviewPrimary: buildOverviewPrimary(
      workflow,
      beneficiary,
      stagePresentation,
      statusPresentation,
    ),
    overviewSecondary: buildOverviewSecondary(workflow, beneficiary),
    inputApplication: workflow.context?.input?.application ?? null,
    contextSummary: pickProcessContextSummary(workflow),
    resultData: workflow.result ?? null,
    history: mapWorkflowHistory(workflow.history),
    subprocesses,
    stages,
  }
}
