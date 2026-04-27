import type {
  StepEvidencePanels,
  WorkflowResponse,
} from '../types'

type EvidenceExtractor = (workflow: WorkflowResponse) => StepEvidencePanels

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function getFacts(workflow: WorkflowResponse) {
  return asRecord(workflow.context?.facts)
}

function getDecisions(workflow: WorkflowResponse) {
  return asRecord(workflow.context?.decisions)
}

function getEffects(workflow: WorkflowResponse) {
  return asRecord(workflow.context?.effects)
}

function getEffect(workflow: WorkflowResponse, key: string) {
  return asRecord(getEffects(workflow)?.[key])
}

function getWaitResult(workflow: WorkflowResponse, key: string) {
  return asRecord(getEffect(workflow, key)?.waitResult)
}

const STEP_EVIDENCE: Record<string, EvidenceExtractor> = {
  derive_validation_facts: (workflow) => ({
    facts: {
      title: 'Собранные факты проверки',
      data: asRecord(getFacts(workflow)?.validation),
    },
  }),
  choose_validation_outcome: (workflow) => ({
    decision: {
      title: 'Принятое решение',
      data: asRecord(getDecisions(workflow)?.validation),
    },
  }),
  prepare_validate_address_request: (workflow) => ({
    request: {
      title: 'Подготовленный запрос',
      data: getFacts(workflow)?.validate_address_request,
    },
  }),
  validate_registration_address: (workflow) => ({
    request: {
      title: 'Запрос проверки адреса',
      data: getFacts(workflow)?.validate_address_request,
    },
    meta: {
      title: 'Метаданные вызова',
      data: asRecord(getEffect(workflow, 'validate_registration_address')?.result),
    },
  }),
  wait_validate_registration_address: (workflow) => ({
    response: {
      title: 'Ответ сервиса проверки адреса',
      data: getWaitResult(workflow, 'validate_registration_address'),
    },
  }),
  extract_address_validation_result: (workflow) => ({
    facts: {
      title: 'Нормализованный результат проверки',
      data: getFacts(workflow)?.address_check,
    },
  }),
  run_abs_ensure_fl_resident_beneficiary: (workflow) => ({
    request: {
      title: 'Вход подпроцесса АБС',
      data: getFacts(workflow)?.abs_ensure_subflow_input,
    },
  }),
  wait_abs_ensure_fl_resident_beneficiary: (workflow) => ({
    response: {
      title: 'Результат подпроцесса АБС',
      data: getWaitResult(workflow, 'run_abs_ensure_fl_resident_beneficiary'),
    },
  }),
  prepare_find_client_request: (workflow) => ({
    request: {
      title: 'Подготовленный запрос',
      data: getFacts(workflow)?.find_client_request,
    },
  }),
  send_find_client: (workflow) => ({
    request: {
      title: 'Запрос в адаптер АБС',
      data: getFacts(workflow)?.find_client_request,
    },
    meta: {
      title: 'Метаданные отправки',
      data: asRecord(getEffect(workflow, 'send_find_client')?.result),
    },
  }),
  wait_find_client: (workflow) => ({
    response: {
      title: 'Ответ адаптера АБС',
      data: getWaitResult(workflow, 'send_find_client'),
    },
  }),
  extract_find_client_result: (workflow) => ({
    facts: {
      title: 'Нормализованный результат поиска',
      data: getFacts(workflow)?.find_client_result,
    },
  }),
  choose_find_client_scenario: (workflow) => ({
    decision: {
      title: 'Принятое решение',
      data: asRecord(getDecisions(workflow)?.find_client_scenario),
    },
  }),
  prepare_create_client_request: (workflow) => ({
    request: {
      title: 'Подготовленный запрос',
      data: getFacts(workflow)?.create_client_request,
    },
  }),
  send_create_client: (workflow) => ({
    request: {
      title: 'Запрос в адаптер АБС',
      data: getFacts(workflow)?.create_client_request,
    },
    meta: {
      title: 'Метаданные отправки',
      data: asRecord(getEffect(workflow, 'send_create_client')?.result),
    },
  }),
  wait_create_client: (workflow) => ({
    response: {
      title: 'Ответ адаптера АБС',
      data: getWaitResult(workflow, 'send_create_client'),
    },
  }),
  prepare_bind_client_request: (workflow) => ({
    request: {
      title: 'Подготовленный запрос',
      data: getFacts(workflow)?.bind_client_request,
    },
  }),
  send_bind_client: (workflow) => ({
    request: {
      title: 'Запрос в адаптер АБС',
      data: getFacts(workflow)?.bind_client_request,
    },
    meta: {
      title: 'Метаданные отправки',
      data: asRecord(getEffect(workflow, 'send_bind_client')?.result),
    },
  }),
  wait_bind_client: (workflow) => ({
    response: {
      title: 'Ответ адаптера АБС',
      data: getWaitResult(workflow, 'send_bind_client'),
    },
  }),
}

export function getStepEvidencePanels(
  workflow: WorkflowResponse,
  stepId: string,
): StepEvidencePanels {
  return STEP_EVIDENCE[stepId]?.(workflow) ?? {}
}
