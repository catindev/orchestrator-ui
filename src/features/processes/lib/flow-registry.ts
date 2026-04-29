export const ROOT_VALIDATION_STEPS = [
  "route_by_supported_scenario",
  "validate_fl_resident_request",
  "derive_validation_facts",
  "choose_validation_outcome",
  "switch_validation_outcome",
  "build_validation_reject_terminal_result",
  "finish_reject_validation",
  "finish_fail_poc_scenario_not_supported",
] as const;

export const ROOT_ADDRESS_STEPS = [
  "prepare_validate_address_request",
  "validate_registration_address",
  "wait_validate_registration_address",
  "extract_address_validation_result",
  "route_after_address_validation",
  "finish_reject_address",
] as const;

export const ROOT_ABS_STEPS = [
  "prepare_abs_ensure_fl_resident_beneficiary_input",
  "run_abs_ensure_fl_resident_beneficiary",
  "wait_abs_ensure_fl_resident_beneficiary",
  "extract_abs_ensure_subflow_result",
  "choose_abs_ensure_outcome",
  "switch_abs_ensure_outcome",
] as const;

export const ROOT_RESULT_STEPS = [
  "finish_success",
  "finish_reject_validation",
  "finish_reject_address",
  "finish_reject_already_bound",
  "finish_reject_ambiguous_clients",
  "finish_fail_poc_scenario_not_supported",
  "finish_fail_address_wait_error",
  "finish_fail_abs_subflow_wait_error",
  "finish_fail_technical",
] as const;

export const SUBPROCESS_FIND_STEPS = [
  "prepare_find_client_request",
  "send_find_client",
  "wait_find_client",
  "extract_find_client_result",
  "derive_client_candidates_facts",
  "choose_find_client_scenario",
  "switch_find_client_scenario",
] as const;

export const SUBPROCESS_CREATE_STEPS = [
  "prepare_create_client_request",
  "send_create_client",
  "wait_create_client",
] as const;

export const SUBPROCESS_BIND_STEPS = [
  "prepare_bind_client_request",
  "send_bind_client",
  "wait_bind_client",
  "extract_bind_client_result",
  "choose_bind_client_outcome",
  "switch_bind_client_outcome",
  "finish_already_bound",
  "finish_fail_bind_client_wait_error",
  "finish_fail_bind_client_wait_timeout",
] as const;

export const SUBPROCESS_RESULT_STEPS = [
  "finish_success",
  "finish_already_bound",
  "finish_reject_ambiguous_clients",
  "finish_fail_create_client_wait_error",
  "finish_fail",
] as const;

export const HISTORY_KIND_LABELS: Record<string, string> = {
  STEP_COMPLETED: "Шаг завершен",
  STEP_WAITING: "Ожидание ответа",
  STEP_RESUMED: "Шаг возобновлен",
  STEP_FAILED: "Шаг завершился ошибкой",
};

export const STEP_LABELS: Record<string, string> = {
  route_by_supported_scenario: "Выбор поддерживаемого сценария",
  validate_fl_resident_request: "Проверка заявки ФЛ-резидента",
  derive_validation_facts: "Сбор фактов по результатам проверки",
  choose_validation_outcome: "Выбор исхода после проверки",
  switch_validation_outcome: "Маршрутизация по исходу проверки",
  build_validation_reject_terminal_result:
    "Сбор финального результата отказа по ошибкам",
  finish_reject_validation: "Отклонение из-за ошибок данных",
  finish_fail_poc_scenario_not_supported: "Неподдерживаемый сценарий",
  finish_reject_compliance: "Отклонение по регуляторной причине",
  finish_fail_validation_outcome_default:
    "Техническая ошибка выбора исхода проверки",
  prepare_validate_address_request: "Подготовка запроса проверки адреса",
  validate_registration_address: "Проверка адреса регистрации",
  wait_validate_registration_address: "Ожидание результата проверки адреса",
  extract_address_validation_result: "Извлечение результата проверки адреса",
  route_after_address_validation: "Маршрутизация после проверки адреса",
  finish_reject_address: "Отклонение из-за проверки адреса",
  finish_fail_address_call: "Техническая ошибка вызова проверки адреса",
  finish_fail_address_wait_error: "Техническая ошибка ожидания проверки адреса",
  finish_fail_address_wait_timeout: "Таймаут ожидания проверки адреса",
  prepare_abs_ensure_fl_resident_beneficiary_input:
    "Подготовка входа подпроцесса ABS",
  run_abs_ensure_fl_resident_beneficiary: "Запуск подпроцесса работы с ABS",
  wait_abs_ensure_fl_resident_beneficiary:
    "Ожидание завершения подпроцесса ABS",
  extract_abs_ensure_subflow_result: "Нормализация результата подпроцесса АБС",
  choose_abs_ensure_outcome: "Выбор итогового исхода АБС",
  switch_abs_ensure_outcome: "Маршрутизация результата АБС",
  finish_reject_already_bound: "Бенефициар уже привязан",
  finish_reject_ambiguous_clients: "Неоднозначный результат поиска клиента",
  finish_success: "Успешное завершение",
  finish_fail_technical: "Завершение с технической ошибкой",
  finish_fail_abs_subflow_call: "Техническая ошибка запуска подпроцесса ABS",
  finish_fail_abs_subflow_wait_error:
    "Техническая ошибка ожидания подпроцесса ABS",
  finish_fail_abs_subflow_wait_timeout: "Таймаут ожидания подпроцесса ABS",
  prepare_find_client_request: "Подготовка запроса поиска клиента",
  send_find_client: "Поиск клиента в ЦФТ",
  wait_find_client: "Ожидание результата поиска клиента",
  extract_find_client_result: "Нормализация результата поиска клиента",
  derive_client_candidates_facts: "Анализ найденных карточек клиента",
  choose_find_client_scenario: "Выбор сценария по результату поиска",
  switch_find_client_scenario: "Маршрутизация по результату поиска",
  prepare_create_client_request: "Подготовка запроса создания клиента",
  send_create_client: "Создание клиента в ЦФТ",
  wait_create_client: "Ожидание создания клиента",
  finish_fail_find_client_call_error:
    "Техническая ошибка вызова поиска клиента",
  finish_fail_find_client_wait_timeout: "Таймаут ожидания поиска клиента",
  finish_fail_find_client_decision_error:
    "Техническая ошибка определения сценария поиска",
  finish_fail_create_client_call_error:
    "Техническая ошибка вызова создания клиента",
  finish_fail_create_client_wait_error:
    "Техническая ошибка ожидания создания клиента",
  finish_fail_create_client_wait_timeout: "Таймаут ожидания создания клиента",
  prepare_bind_client_request: "Подготовка запроса привязки клиента",
  send_bind_client: "Привязка клиента",
  wait_bind_client: "Ожидание результата привязки",
  extract_bind_client_result: "Нормализация результата привязки",
  choose_bind_client_outcome: "Выбор исхода привязки",
  switch_bind_client_outcome: "Маршрутизация результата привязки",
  finish_already_bound: "Бенефициар уже привязан",
  finish_fail_bind_client_call_error:
    "Техническая ошибка вызова привязки клиента",
  finish_fail_bind_client_wait_error:
    "Техническая ошибка ожидания привязки клиента",
  finish_fail_bind_client_wait_timeout: "Таймаут ожидания привязки клиента",
  finish_fail: "Завершение подпроцесса с ошибкой",
};

export const TECHNICAL_FAILURE_STEP_PRESENTATIONS: Record<
  string,
  { label: string; summary: string }
> = {
  finish_fail_abs_subflow_wait_error: {
    label: "Техническая ошибка ожидания подпроцесса ABS",
    summary:
      "Подпроцесс регистрации в АБС завершился ошибкой или не вернул ожидаемый результат.",
  },
  finish_fail_bind_client_wait_error: {
    label: "Техническая ошибка ожидания привязки клиента",
    summary:
      "Во время ожидания результата привязки клиента произошла техническая ошибка.",
  },
  finish_fail_bind_client_wait_timeout: {
    label: "Таймаут ожидания привязки клиента",
    summary:
      "Привязка клиента не завершилась за ожидаемое время и была остановлена по таймауту.",
  },
  finish_fail_create_client_wait_error: {
    label: "Техническая ошибка ожидания создания клиента",
    summary:
      "Во время ожидания результата создания клиента произошла техническая ошибка.",
  },
  finish_fail_address_wait_error: {
    label: "Техническая ошибка ожидания проверки адреса",
    summary:
      "Во время ожидания результата проверки адреса произошла техническая ошибка.",
  },
};
