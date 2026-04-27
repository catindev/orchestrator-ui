export const ROOT_VALIDATION_STEPS = [
  'route_by_supported_scenario',
  'validate_fl_resident_request',
  'derive_validation_facts',
  'choose_validation_outcome',
  'switch_validation_outcome',
  'finish_reject_validation',
  'finish_fail_poc_scenario_not_supported',
] as const

export const ROOT_ADDRESS_STEPS = [
  'prepare_validate_address_request',
  'validate_registration_address',
  'wait_validate_registration_address',
  'extract_address_validation_result',
  'route_after_address_validation',
  'finish_reject_address',
] as const

export const ROOT_ABS_STEPS = [
  'run_abs_ensure_fl_resident_beneficiary',
  'wait_abs_ensure_fl_resident_beneficiary',
] as const

export const ROOT_RESULT_STEPS = [
  'finish_success',
  'finish_reject_validation',
  'finish_reject_address',
  'finish_fail_poc_scenario_not_supported',
  'finish_fail_address_wait_error',
  'finish_fail_abs_subflow_wait_error',
  'finish_fail_technical',
] as const

export const SUBPROCESS_FIND_STEPS = [
  'prepare_find_client_request',
  'send_find_client',
  'wait_find_client',
  'extract_find_client_result',
  'choose_find_client_scenario',
  'switch_find_client_scenario',
] as const

export const SUBPROCESS_CREATE_STEPS = [
  'prepare_create_client_request',
  'send_create_client',
  'wait_create_client',
] as const

export const SUBPROCESS_BIND_STEPS = [
  'prepare_bind_client_request',
  'send_bind_client',
  'wait_bind_client',
] as const

export const SUBPROCESS_RESULT_STEPS = [
  'finish_success',
  'finish_fail_bind_client_wait_error',
  'finish_fail_bind_client_wait_timeout',
  'finish_fail_create_client_wait_error',
  'finish_fail',
] as const

export const HISTORY_KIND_LABELS: Record<string, string> = {
  STEP_COMPLETED: 'Шаг завершен',
  STEP_WAITING: 'Ожидание ответа',
  STEP_RESUMED: 'Шаг возобновлен',
  STEP_FAILED: 'Шаг завершился ошибкой',
}

export const STEP_LABELS: Record<string, string> = {
  route_by_supported_scenario: 'Определение сценария',
  validate_fl_resident_request: 'Первичная валидация заявки',
  derive_validation_facts: 'Сбор фактов проверки',
  choose_validation_outcome: 'Определение результата валидации',
  switch_validation_outcome: 'Переход по результату валидации',
  finish_reject_validation: 'Завершение с отказом по валидации',
  finish_fail_poc_scenario_not_supported:
    'Завершение из-за неподдержанного сценария',
  prepare_validate_address_request: 'Подготовка запроса проверки адреса',
  validate_registration_address: 'Запуск проверки адреса',
  wait_validate_registration_address: 'Ожидание проверки адреса',
  extract_address_validation_result: 'Разбор результата проверки адреса',
  route_after_address_validation: 'Переход после проверки адреса',
  finish_reject_address: 'Завершение с отказом по адресу',
  finish_fail_address_wait_error: 'Ошибка ожидания проверки адреса',
  run_abs_ensure_fl_resident_beneficiary: 'Запуск регистрации в АБС',
  wait_abs_ensure_fl_resident_beneficiary: 'Ожидание результата АБС',
  finish_success: 'Успешное завершение',
  finish_fail_technical: 'Завершение с технической ошибкой',
  finish_fail_abs_subflow_wait_error: 'Ошибка ожидания подпроцесса АБС',
  prepare_find_client_request: 'Подготовка запроса поиска клиента',
  send_find_client: 'Поиск клиента в АБС',
  wait_find_client: 'Ожидание ответа поиска клиента',
  extract_find_client_result: 'Разбор результата поиска клиента',
  choose_find_client_scenario: 'Выбор сценария после поиска',
  switch_find_client_scenario: 'Переход по сценарию поиска',
  prepare_create_client_request: 'Подготовка запроса создания клиента',
  send_create_client: 'Создание клиента в АБС',
  wait_create_client: 'Ожидание создания клиента',
  finish_fail_create_client_wait_error: 'Ошибка ожидания создания клиента',
  prepare_bind_client_request: 'Подготовка запроса привязки клиента',
  send_bind_client: 'Привязка клиента',
  wait_bind_client: 'Ожидание привязки клиента',
  finish_fail_bind_client_wait_error: 'Ошибка ожидания привязки клиента',
  finish_fail_bind_client_wait_timeout: 'Таймаут ожидания привязки клиента',
  finish_fail: 'Завершение подпроцесса с ошибкой',
}

export const TECHNICAL_FAILURE_STEP_PRESENTATIONS: Record<
  string,
  { label: string; summary: string }
> = {
  finish_fail_abs_subflow_wait_error: {
    label: 'Ошибка ожидания подпроцесса АБС',
    summary:
      'Подпроцесс регистрации в АБС завершился ошибкой или не вернул ожидаемый результат.',
  },
  finish_fail_bind_client_wait_error: {
    label: 'Ошибка ожидания привязки клиента',
    summary:
      'Во время ожидания результата привязки клиента произошла техническая ошибка.',
  },
  finish_fail_bind_client_wait_timeout: {
    label: 'Таймаут ожидания привязки клиента',
    summary:
      'Привязка клиента не завершилась за ожидаемое время и была остановлена по таймауту.',
  },
  finish_fail_create_client_wait_error: {
    label: 'Ошибка ожидания создания клиента',
    summary:
      'Во время ожидания результата создания клиента произошла техническая ошибка.',
  },
  finish_fail_address_wait_error: {
    label: 'Ошибка ожидания проверки адреса',
    summary:
      'Во время ожидания результата проверки адреса произошла техническая ошибка.',
  },
}
