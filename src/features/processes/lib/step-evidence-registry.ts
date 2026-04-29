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

function getChecks(workflow: WorkflowResponse) {
  return asRecord(workflow.context?.checks)
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
  validate_fl_resident_request: (workflow) => ({
    facts: {
      title: 'Результат проверки rules',
      data: asRecord(getChecks(workflow)?.validation),
    },
  }),
  derive_validation_facts: (workflow) => ({
    facts: {
      title: 'Собранные факты проверки',
      data: asRecord(getFacts(workflow)?.validation),
    },
  }),
  build_validation_reject_terminal_result: (workflow) => ({
    facts: {
      title: 'Собранный финальный результат',
      data: getFacts(workflow)?.terminalResult,
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
  finish_fail_address_wait_error: (workflow) => ({
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
  prepare_abs_ensure_fl_resident_beneficiary_input: (workflow) => ({
    request: {
      title: 'Подготовленный вход подпроцесса',
      data: getFacts(workflow)?.abs_ensure_subflow_input,
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
  extract_abs_ensure_subflow_result: (workflow) => ({
    facts: {
      title: 'Результат подпроцесса АБС',
      data: getFacts(workflow)?.abs_ensure_subflow_result,
    },
    response: {
      title: 'Raw-результат подпроцесса',
      data: getWaitResult(workflow, 'run_abs_ensure_fl_resident_beneficiary'),
    },
  }),
  choose_abs_ensure_outcome: (workflow) => ({
    decision: {
      title: 'Итоговое решение по результату АБС',
      data: asRecord(getDecisions(workflow)?.abs_ensure_outcome),
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
  derive_client_candidates_facts: (workflow) => ({
    facts: {
      title: 'Факты по найденным карточкам',
      data: getFacts(workflow)?.client_candidates,
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
  finish_fail_create_client_wait_error: (workflow) => ({
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
  extract_bind_client_result: (workflow) => ({
    facts: {
      title: 'Нормализованный результат привязки',
      data: getFacts(workflow)?.bind_client_result,
    },
    response: {
      title: 'Ответ адаптера АБС',
      data: getWaitResult(workflow, 'send_bind_client'),
    },
  }),
  choose_bind_client_outcome: (workflow) => ({
    decision: {
      title: 'Принятое решение по привязке',
      data: asRecord(getDecisions(workflow)?.bind_client_outcome),
    },
  }),
  finish_fail_bind_client_wait_error: (workflow) => ({
    response: {
      title: 'Ответ адаптера АБС',
      data: getWaitResult(workflow, 'send_bind_client'),
    },
  }),
  finish_fail_bind_client_wait_timeout: (workflow) => ({
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
