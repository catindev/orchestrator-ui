import type {
  ProcessDetails,
  ProcessHistoryItem,
  ProcessListItem,
  ProcessOverviewItem,
  ProcessStageItem,
  ProcessStageState,
  ProcessStatusTone,
  StepEvidenceItem,
  StepKind,
  SubprocessListItem,
  WorkflowContextStepState,
  WorkflowResponse,
} from "../types";
import {
  HISTORY_KIND_LABELS,
  ROOT_ABS_STEPS,
  ROOT_ADDRESS_STEPS,
  ROOT_RESULT_STEPS,
  ROOT_VALIDATION_STEPS,
  STEP_LABELS,
  SUBPROCESS_BIND_STEPS,
  SUBPROCESS_CREATE_STEPS,
  SUBPROCESS_FIND_STEPS,
  SUBPROCESS_RESULT_STEPS,
  TECHNICAL_FAILURE_STEP_PRESENTATIONS,
} from "./flow-registry";
import { getStepEvidencePanels } from "./step-evidence-registry";

const HUMAN_DATE_FORMATTER = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

type BeneficiaryInput = {
  type?: string;
  inn?: string;
  participationId?: string;
  account?: {
    number?: string;
    accountNumber?: string;
  };
  contacts?: {
    email?: string;
    phone?: string;
  };
  fl?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
  ip?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
  };
  ul?: {
    fullNameRu?: string;
    shortNameRu?: string;
    fullName?: string;
    shortName?: string;
    name?: string;
  };
};

type WorkflowResultSummary = {
  outcome?: string;
  message?: string;
};

type StagePresentation = {
  label: string;
  summary: string;
};

type StepMap = Record<string, WorkflowContextStepState>;

type EffectResult = {
  requestId: string | null;
  accepted: boolean | null;
  status: string | null;
  errorMessage: string | null;
  result: Record<string, unknown> | null;
};

const STAGE_STATE_LABELS: Record<ProcessStageState, string> = {
  completed: "Завершен",
  active: "В работе",
  error: "Требует внимания",
  pending: "Ожидает",
  skipped: "Пропущен",
};


export function isWorkflowResponse(value: unknown): value is WorkflowResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.processId === "string" &&
    typeof candidate.applicationRequestId === "string" &&
    typeof candidate.rootProcessId === "string" &&
    typeof candidate.id === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.currentStepId === "string" &&
    typeof candidate.currentStepType === "string" &&
    typeof candidate.version === "string" &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.updatedAt === "string"
  );
}

export function formatWorkflowTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const parts = HUMAN_DATE_FORMATTER.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const day = getPart("day");
  const month = getPart("month").replace(".", "").toLowerCase();
  const year = getPart("year");
  const hour = getPart("hour");
  const minute = getPart("minute");

  return `${day} ${month} ${year} в ${hour}:${minute}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function getBeneficiary(workflow: WorkflowResponse): BeneficiaryInput | null {
  const application = asRecord(workflow.context?.input?.application);
  const beneficiary = asRecord(application?.beneficiary);

  return beneficiary as BeneficiaryInput | null;
}

function getStepMap(workflow: WorkflowResponse): StepMap {
  const rawSteps = asRecord(workflow.context?.steps);

  if (!rawSteps) {
    return {};
  }

  return rawSteps as StepMap;
}

function getStepLabel(
  stepId: string,
  workflowOrFlowId?: WorkflowResponse | string,
): string {
  const flowId =
    typeof workflowOrFlowId === "string"
      ? workflowOrFlowId
      : workflowOrFlowId?.id;

  if (stepId === "finish_success") {
    return flowId === "abs.ensure_fl_resident_beneficiary"
      ? "Подпроцесс завершён успешно"
      : "Успешное завершение";
  }

  return STEP_LABELS[stepId] ?? stepId;
}

function hasStep(stepIds: readonly string[], stepId: string) {
  return stepIds.some((candidateStepId) => candidateStepId === stepId);
}

function getHistoryKindLabel(kind: string): string {
  return HISTORY_KIND_LABELS[kind] ?? kind;
}

function getTerminalOutcome(workflow: WorkflowResponse): string | null {
  return asString(asRecord(workflow.result)?.outcome);
}

function getDecisionOutcome(decision: Record<string, unknown> | null): string | null {
  return asString(decision?.outcome) ?? asString(decision?.decision);
}

function isManagedAbsBusinessOutcome(outcome: string | null): boolean {
  return outcome === "ALREADY_BOUND" || outcome === "AMBIGUOUS_CLIENTS_REJECT";
}

function getValidationIssues(
  workflow: WorkflowResponse,
): Record<string, unknown>[] {
  const checks = asRecord(workflow.context?.checks);
  const validation = asRecord(checks?.validation);
  const issues = Array.isArray(validation?.issues) ? validation.issues : [];

  return issues.map((issue) => asRecord(issue)).filter(Boolean) as Record<
    string,
    unknown
  >[];
}

function getValidationIssueMessages(workflow: WorkflowResponse): string[] {
  return getValidationIssues(workflow)
    .map((issue) => asString(issue.message))
    .filter((message): message is string => Boolean(message));
}

function getValidationRejectSummary(workflow: WorkflowResponse): string | null {
  const issueMessages = getValidationIssueMessages(workflow);

  if (issueMessages.length > 1) {
    return "Найдено несколько ошибок при проверке анкеты";
  }

  return issueMessages[0] ?? null;
}

function pickWorkflowResultSummary(
  workflow: WorkflowResponse,
): WorkflowResultSummary {
  const result = asRecord(workflow.result);

  return {
    outcome: asString(result?.outcome) ?? undefined,
    message:
      asString(result?.merchantMessage) ??
      asString(result?.message) ??
      undefined,
  };
}

function mapBeneficiaryTypeLabel(type: string | undefined): string {
  switch (type) {
    case "FL_RESIDENT":
      return "Физлицо-резидент";
    case "FL_NON_RESIDENT":
      return "Физлицо-нерезидент";
    case "IP_RESIDENT":
      return "ИП-резидент";
    case "UL_RESIDENT":
      return "Юрлицо-резидент";
    case "UL_NON_RESIDENT":
      return "Юрлицо-нерезидент";
    default:
      return "Тип не определен";
  }
}

function formatPersonName(
  person: BeneficiaryInput["fl"] | BeneficiaryInput["ip"],
) {
  if (!person) {
    return null;
  }

  const parts = [person.lastName, person.firstName, person.middleName].filter(
    (part): part is string => Boolean(part && part.trim()),
  );

  return parts.length > 0 ? parts.join(" ") : null;
}

function formatBeneficiaryName(beneficiary: BeneficiaryInput | null): string {
  if (!beneficiary) {
    return "Бенефициар";
  }

  const naturalPersonName =
    formatPersonName(beneficiary.fl) ?? formatPersonName(beneficiary.ip);

  if (naturalPersonName) {
    return naturalPersonName;
  }

  const legalEntityName =
    beneficiary.ul?.shortNameRu ??
    beneficiary.ul?.fullNameRu ??
    beneficiary.ul?.shortName ??
    beneficiary.ul?.fullName ??
    beneficiary.ul?.name;

  return legalEntityName && legalEntityName.trim().length > 0
    ? legalEntityName.trim()
    : "Бенефициар без имени";
}

function getAccountNumber(beneficiary: BeneficiaryInput | null): string | null {
  return (
    asString(beneficiary?.account?.number) ??
    asString(beneficiary?.account?.accountNumber)
  );
}

function formatBeneficiaryOverviewMeta(
  beneficiary: BeneficiaryInput | null,
): string {
  const beneficiaryTypeLabel = mapBeneficiaryTypeLabel(beneficiary?.type);
  const inn = beneficiary?.inn?.trim();

  return [inn ? `ИНН ${inn}` : null, beneficiaryTypeLabel]
    .filter(Boolean)
    .join(" • ");
}

function formatBeneficiaryListMeta(beneficiary: BeneficiaryInput | null): string {
  const accountNumber = getAccountNumber(beneficiary);

  return [
    formatBeneficiaryOverviewMeta(beneficiary),
    accountNumber ? `Счет ${accountNumber}` : null,
  ]
    .filter(Boolean)
    .join(" • ");
}

function formatRequestMeta(
  beneficiary: BeneficiaryInput | null,
  processId: string,
): string {
  const participationId = beneficiary?.participationId?.trim();

  return participationId
    ? `ID в системе мерчанта: ${participationId}`
    : `ID процесса: ${processId}`;
}

function mapTerminalStagePresentation(
  workflow: WorkflowResponse,
): StagePresentation | null {
  const { outcome, message } = pickWorkflowResultSummary(workflow);
  const validationIssueMessage = getValidationRejectSummary(workflow);

  switch (outcome) {
    case "BENEFICIARY_REGISTERED":
      return {
        label: "Регистрация завершена",
        summary: "Бенефициар зарегистрирован и привязан к номинальному счету.",
      };
    case "VALIDATION_REJECT":
      return {
        label: "Заявка отклонена на проверке анкеты",
        summary:
          validationIssueMessage ??
          "Анкета не прошла обязательные проверки полноты и ограничений.",
      };
    case "COMPLIANCE_REJECT":
      return {
        label: "Заявка отклонена по регуляторной причине",
        summary:
          validationIssueMessage ??
          message ??
          "Заявка отклонена по регуляторной причине.",
      };
    case "ADDRESS_NOT_VERIFIED":
      return {
        label: "Отклонена проверкой адреса",
        summary: "Адрес бенефициара не прошел проверку или не был подтвержден.",
      };
    case "ALREADY_BOUND":
      return {
        label: "Бенефициар уже привязан",
        summary:
          message ??
          "Бенефициар уже привязан к указанному номинальному счёту.",
      };
    case "AMBIGUOUS_CLIENTS_REJECT":
      return {
        label: "Неоднозначный результат поиска клиента",
        summary:
          message ??
          "В АБС найдено несколько карточек, и безопасно выбрать одну из них невозможно.",
      };
    case "TECHNICAL_FAILURE":
      // presentation depends on currentStepId at failure time, not on outcome variant
      if (TECHNICAL_FAILURE_STEP_PRESENTATIONS[workflow.currentStepId]) {
        return {
          label: TECHNICAL_FAILURE_STEP_PRESENTATIONS[workflow.currentStepId]
            .label,
          summary:
            message ??
            TECHNICAL_FAILURE_STEP_PRESENTATIONS[workflow.currentStepId]
              .summary,
        };
      }

      return {
        label: "Остановлена технической ошибкой",
        summary:
          message ??
          "Во время исполнения процесса произошла техническая ошибка.",
      };
    case "POC_SCENARIO_NOT_SUPPORTED":
      return {
        label: "Сценарий не поддержан",
        summary:
          message ??
          "В текущем PoC поддержан не весь набор сценариев регистрации.",
      };
    case "ABS_ENSURE_BENEFICIARY_DONE":
      return {
        label: "Регистрация в АБС завершена",
        summary: "Клиент обработан в АБС и привязан к номинальному счету.",
      };
    default:
      return null;
  }
}

function mapRootStagePresentation(
  workflow: WorkflowResponse,
): StagePresentation {
  const terminalStage = mapTerminalStagePresentation(workflow);

  if (terminalStage) {
    return terminalStage;
  }

  if (hasStep(ROOT_VALIDATION_STEPS, workflow.currentStepId)) {
    return {
      label: "Проверка анкеты",
      summary:
        "Проверяем полноту данных, регуляторные ограничения и причину возможного отклонения.",
    };
  }

  if (hasStep(ROOT_ADDRESS_STEPS, workflow.currentStepId)) {
    return {
      label: "Проверка адреса",
      summary: "Проверяем и нормализуем адрес регистрации бенефициара.",
    };
  }

  if (hasStep(ROOT_ABS_STEPS, workflow.currentStepId)) {
    return {
      label: "Регистрация в АБС",
      summary: "Выполняем поиск, создание и привязку бенефициара в АБС.",
    };
  }

  return {
    label: "Обработка заявки",
    summary: "Процесс выполняется и ожидает следующего действия.",
  };
}

function mapSubprocessStagePresentation(
  workflow: WorkflowResponse,
): StagePresentation {
  const terminalStage = mapTerminalStagePresentation(workflow);

  if (terminalStage) {
    return terminalStage;
  }

  if (hasStep(SUBPROCESS_FIND_STEPS, workflow.currentStepId)) {
    return {
      label: "Поиск клиента",
      summary:
        "Проверяем, есть ли клиент в АБС и нужен ли сценарий создания.",
    };
  }

  if (hasStep(SUBPROCESS_CREATE_STEPS, workflow.currentStepId)) {
    return {
      label: "Создание клиента",
      summary:
        "Создаем карточку клиента в АБС, если поиск не дал результата.",
    };
  }

  if (hasStep(SUBPROCESS_BIND_STEPS, workflow.currentStepId)) {
    return {
      label: "Привязка клиента",
      summary:
        "Связываем найденного или созданного клиента с номинальным счетом.",
    };
  }

  return {
    label: "Выполнение подпроцесса",
    summary: "Подпроцесс выполняется и ожидает следующего действия.",
  };
}

function mapStatusPresentation(status: string): {
  label: string;
  tone: ProcessStatusTone;
} {
  switch (status) {
    case "COMPLETE":
      return { label: "ВЫПОЛНЕНА", tone: "success" };
    case "FAIL":
      return { label: "ОШИБКА", tone: "error" };
    default:
      return { label: "В ПРОЦЕССЕ", tone: "neutral" };
  }
}

function getSearchableText(
  workflow: WorkflowResponse,
  beneficiary: BeneficiaryInput | null,
) {
  const beneficiaryTypeLabel = mapBeneficiaryTypeLabel(beneficiary?.type);
  const inn = beneficiary?.inn?.trim();
  const participationId = beneficiary?.participationId?.trim();
  const accountNumber = getAccountNumber(beneficiary);

  return [
    workflow.applicationRequestId,
    workflow.processId,
    formatBeneficiaryName(beneficiary),
    beneficiaryTypeLabel,
    inn,
    participationId,
    accountNumber,
    beneficiary?.contacts?.email,
    beneficiary?.contacts?.phone,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function mapWorkflowToListItem(
  workflow: WorkflowResponse,
): ProcessListItem {
  const statusPresentation = mapStatusPresentation(workflow.status);
  const beneficiary = getBeneficiary(workflow);
  const stagePresentation = mapRootStagePresentation(workflow);

  return {
    processId: workflow.processId,
    applicationRequestId: workflow.applicationRequestId,
    beneficiaryName: formatBeneficiaryName(beneficiary),
    beneficiaryMeta: formatBeneficiaryListMeta(beneficiary),
    requestMeta: formatRequestMeta(beneficiary, workflow.processId),
    stageLabel: stagePresentation.label,
    stageSummary: stagePresentation.summary,
    createdAt: formatWorkflowTimestamp(workflow.createdAt),
    updatedAt: formatWorkflowTimestamp(workflow.updatedAt),
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
    searchableText: getSearchableText(workflow, beneficiary),
  };
}

function formatHistoryDetails(details: Record<string, unknown> | undefined) {
  if (!details || Object.keys(details).length === 0) {
    return null;
  }

  return Object.entries(details)
    .map(([key, value]) => {
      const formattedValue =
        typeof value === "string" ? value : JSON.stringify(value);

      return `${key}: ${formattedValue}`;
    })
    .join(", ");
}

function mapWorkflowHistory(
  history: WorkflowResponse["history"],
  flowId: string,
): ProcessHistoryItem[] {
  return (history ?? []).map((event) => ({
    at: formatWorkflowTimestamp(event.at),
    kind: event.kind,
    kindLabel: getHistoryKindLabel(event.kind),
    stepId: event.stepId,
    stepLabel: getStepLabel(event.stepId, flowId),
    details: formatHistoryDetails(event.details),
  }));
}

function mapWorkflowToSubprocessListItem(
  workflow: WorkflowResponse,
): SubprocessListItem {
  const statusPresentation = mapStatusPresentation(workflow.status);
  const stagePresentation = mapSubprocessStagePresentation(workflow);

  return {
    processId: workflow.processId,
    title: "Регистрация в АБС",
    stageLabel: stagePresentation.label,
    summary: stagePresentation.summary,
    createdAt: formatWorkflowTimestamp(workflow.createdAt),
    updatedAt: formatWorkflowTimestamp(workflow.updatedAt),
    statusLabel: statusPresentation.label,
    statusTone: statusPresentation.tone,
  };
}

function pickProcessContextSummary(workflow: WorkflowResponse) {
  const nextSummary: Record<string, unknown> = {};

  if (workflow.context?.facts !== undefined) {
    nextSummary.facts = workflow.context.facts;
  }

  if (workflow.context?.checks !== undefined) {
    nextSummary.checks = workflow.context.checks;
  }

  if (workflow.context?.effects !== undefined) {
    nextSummary.effects = workflow.context.effects;
  }

  if (workflow.context?.decisions !== undefined) {
    nextSummary.decisions = workflow.context.decisions;
  }

  return Object.keys(nextSummary).length > 0 ? nextSummary : null;
}

function getEffectResult(
  workflow: WorkflowResponse,
  effectKey: string,
): EffectResult {
  const effects = asRecord(workflow.context?.effects);
  const effect = asRecord(effects?.[effectKey]);
  const result = asRecord(effect?.result);
  const waitResult = asRecord(effect?.waitResult);
  const waitResultResult = asRecord(waitResult?.result);
  const waitResultError = asRecord(waitResult?.error);
  const error = asRecord(effect?.error);

  return {
    requestId: asString(effect?.requestId) ?? asString(waitResult?.requestId),
    accepted:
      typeof result?.accepted === "boolean"
        ? (result.accepted as boolean)
        : null,
    status: asString(waitResultResult?.status) ?? asString(error?.status),
    errorMessage:
      asString(waitResultError?.message) ??
      asString(error?.message) ??
      asString(waitResult?.errorCode) ??
      asString(effect?.errorCode),
    result: waitResultResult ?? result,
  };
}

function getStepTiming(steps: StepMap, stepIds: readonly string[]) {
  const startedDates = stepIds
    .map((stepId) => asString(steps[stepId]?.startedAt))
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  const finishedDates = stepIds
    .map((stepId) => asString(steps[stepId]?.finishedAt))
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()));

  const startedAt =
    startedDates.length > 0
      ? formatWorkflowTimestamp(
          new Date(
            Math.min(...startedDates.map((date) => date.getTime())),
          ).toISOString(),
        )
      : null;
  const finishedAt =
    finishedDates.length > 0
      ? formatWorkflowTimestamp(
          new Date(
            Math.max(...finishedDates.map((date) => date.getTime())),
          ).toISOString(),
        )
      : null;

  return { startedAt, finishedAt };
}

function hasStartedStep(steps: StepMap, stepIds: readonly string[]) {
  return stepIds.some((stepId) => Boolean(steps[stepId]));
}

function isCurrentStep(workflow: WorkflowResponse, stepIds: readonly string[]) {
  return stepIds.includes(workflow.currentStepId);
}

function hasFailedStep(steps: StepMap, stepIds: readonly string[]) {
  return stepIds.some((stepId) => steps[stepId]?.status === "FAILED");
}

function isInProgressStatus(status: string) {
  return status !== "COMPLETE" && status !== "FAIL";
}

function parseJsonRecord(value: string | null): Record<string, unknown> | null {
  if (!value) {
    return null;
  }

  try {
    return asRecord(JSON.parse(value));
  } catch {
    return null;
  }
}

function getReasonMessage(reason: string | null): string | null {
  if (!reason) {
    return null;
  }

  const parsedReason = parseJsonRecord(reason);

  if (!parsedReason) {
    return reason;
  }

  const details = asRecord(parsedReason.details);

  return (
    asString(details?.reason) ??
    asString(parsedReason.message) ??
    asString(parsedReason.code) ??
    reason
  );
}

function getStepKind(stepId: string): StepKind {
  if (stepId === "validate_fl_resident_request") {
    return "rules";
  }

  if (stepId.startsWith("prepare_")) {
    return "prepare";
  }

  if (stepId.startsWith("send_") || stepId.startsWith("run_") || stepId === "validate_registration_address") {
    return "send";
  }

  if (stepId.startsWith("wait_")) {
    return "wait";
  }

  if (
    stepId.startsWith("extract_") ||
    stepId.startsWith("derive_") ||
    stepId.startsWith("build_")
  ) {
    return "extract";
  }

  if (stepId.startsWith("choose_") || stepId.startsWith("switch_") || stepId.startsWith("route_")) {
    return "decision";
  }

  return "finish";
}

function mapStepExecutionStatus(status: string | null): string | null {
  switch (status) {
    case "COMPLETED":
      return "Завершен";
    case "FAILED":
      return "Ошибка";
    case "WAITING":
      return "Ожидание";
    case "RUNNING":
      return "Выполняется";
    case "PENDING":
      return "Не начат";
    default:
      return status;
  }
}

function buildStepSummary(
  workflow: WorkflowResponse,
  stepId: string,
  stepState: WorkflowContextStepState | undefined,
): string | null {
  const kind = getStepKind(stepId);
  const selectedNextStepId = asString(stepState?.selectedNextStepId);

  if (kind === "prepare") {
    return "Подготовлены данные для следующего вызова.";
  }

  if (kind === "rules") {
    return "Заявка проверена по бизнес- и регуляторным правилам.";
  }

  if (kind === "send") {
    const requestId = asString(stepState?.requestId);
    return requestId
      ? `Запрос отправлен во внешний сервис. Request ID: ${requestId}.`
      : "Команда отправлена на исполнение.";
  }

  if (kind === "wait") {
    if (stepState?.status === "FAILED") {
      return "Во время ожидания ответа шаг завершился ошибкой.";
    }

    return "Получен ответ внешнего сервиса и возобновлено выполнение процесса.";
  }

  if (kind === "extract") {
    return "Результат вызова разобран и сохранен в фактах процесса.";
  }

  if (kind === "decision") {
    return selectedNextStepId
      ? `Выбран следующий шаг: ${getStepLabel(selectedNextStepId, workflow)}.`
      : "Принято решение о следующем переходе.";
  }

  if (stepId === workflow.currentStepId && workflow.status === "FAIL") {
    return "Этот шаг завершил процесс ошибкой.";
  }

  return "Шаг завершил исполнение текущей ветки процесса.";
}

function getStepError(
  workflow: WorkflowResponse,
  stepId: string,
  stepState: WorkflowContextStepState | undefined,
): string | null {
  if (stepId === "wait_find_client") {
    const decision = asRecord(asRecord(workflow.context?.decisions)?.find_client_scenario);
    const decisionOutcome = asString(decision?.outcome);

    if (decisionOutcome === "NOT_FOUND") {
      return null;
    }
  }

  return (
    getReasonMessage(asString(stepState?.reason)) ??
    asString(stepState?.failureCode) ??
    null
  );
}

function buildStepEvidence(
  workflow: WorkflowResponse,
  steps: StepMap,
  stepIds: readonly string[],
): StepEvidenceItem[] {
  return stepIds
    .filter((stepId) => Boolean(steps[stepId]))
    .map((stepId) => {
      const stepState = steps[stepId];

      return {
        stepId,
        title: getStepLabel(stepId, workflow),
        kind: getStepKind(stepId),
        status: mapStepExecutionStatus(asString(stepState?.status)),
        summary: buildStepSummary(workflow, stepId, stepState),
        error: getStepError(workflow, stepId, stepState),
        startedAt: asString(stepState?.startedAt)
          ? formatWorkflowTimestamp(stepState.startedAt!)
          : null,
        finishedAt: asString(stepState?.finishedAt)
          ? formatWorkflowTimestamp(stepState.finishedAt!)
          : null,
        panels: getStepEvidencePanels(workflow, stepId),
      };
    });
}

function buildStage(
  id: string,
  title: string,
  state: ProcessStageState,
  summary: string,
  details: string[],
  timing: { startedAt: string | null; finishedAt: string | null },
  steps: StepEvidenceItem[] = [],
  actionLink?: ProcessStageItem["actionLink"],
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
    steps,
    actionLink,
  };
}

function appendIfPresent(
  target: string[],
  label: string,
  value: string | null,
) {
  if (value) {
    target.push(`${label}: ${value}`);
  }
}

function getValidationStage(
  workflow: WorkflowResponse,
  steps: StepMap,
): ProcessStageItem {
  const timing = getStepTiming(steps, ROOT_VALIDATION_STEPS);
  const stageSteps = buildStepEvidence(workflow, steps, ROOT_VALIDATION_STEPS);
  const issues = getValidationIssueMessages(workflow);
  const validationRejectSummary = getValidationRejectSummary(workflow);
  const decision = asRecord(asRecord(workflow.context?.decisions)?.validation);
  const outcome = getTerminalOutcome(workflow);
  const details: string[] = [];
  const decisionReason = asString(decision?.reason);

  if (outcome === "VALIDATION_REJECT" || outcome === "COMPLIANCE_REJECT") {
    appendIfPresent(details, "Причина отклонения", decisionReason);
  }
  issues.slice(0, 3).forEach((message) => details.push(message));

  if (outcome === "VALIDATION_REJECT") {
    return buildStage(
      "validation",
      "Проверка анкеты",
      "error",
      validationRejectSummary ??
        "Анкета не прошла обязательные проверки и была отклонена.",
      details,
      timing,
      stageSteps,
    );
  }

  if (outcome === "COMPLIANCE_REJECT") {
    return buildStage(
      "validation",
      "Проверка анкеты",
      "error",
      validationRejectSummary ??
        "Заявка отклонена по регуляторной причине.",
      details,
      timing,
      stageSteps,
    );
  }

  if (outcome === "POC_SCENARIO_NOT_SUPPORTED") {
    return buildStage(
      "validation",
      "Проверка анкеты",
      "error",
      "Сценарий заявки не поддержан в текущем PoC.",
      details,
      timing,
      stageSteps,
    );
  }

  if (hasFailedStep(steps, ROOT_VALIDATION_STEPS)) {
    return buildStage(
      "validation",
      "Проверка анкеты",
      "error",
      "Во время проверки анкеты произошла техническая ошибка.",
      details,
      timing,
      stageSteps,
    );
  }

  if (
    isCurrentStep(workflow, ROOT_VALIDATION_STEPS) &&
    isInProgressStatus(workflow.status)
  ) {
    return buildStage(
      "validation",
      "Проверка анкеты",
      "active",
      "Проверяем анкету, ограничения и причины возможного отклонения.",
      details,
      timing,
      stageSteps,
    );
  }

  if (
    hasStartedStep(steps, ROOT_VALIDATION_STEPS) ||
    hasStartedStep(steps, ROOT_ADDRESS_STEPS) ||
    hasStartedStep(steps, ROOT_ABS_STEPS) ||
    !isInProgressStatus(workflow.status)
  ) {
    return buildStage(
      "validation",
      "Проверка анкеты",
      "completed",
      issues.length > 0
        ? "Проверка завершена, ограничения и замечания учтены."
        : "Проверка анкеты пройдена, можно продолжать обработку.",
      details,
      timing,
      stageSteps,
    );
  }

  return buildStage(
    "validation",
    "Проверка анкеты",
    "pending",
    "Этап еще не начался.",
    details,
    timing,
    stageSteps,
  );
}

function getAddressStage(
  workflow: WorkflowResponse,
  steps: StepMap,
): ProcessStageItem {
  const timing = getStepTiming(steps, ROOT_ADDRESS_STEPS);
  const stageSteps = buildStepEvidence(workflow, steps, ROOT_ADDRESS_STEPS);
  const outcome = getTerminalOutcome(workflow);
  const addressCheck = asRecord(
    asRecord(workflow.context?.facts)?.address_check,
  );
  const validationResult = getEffectResult(
    workflow,
    "validate_registration_address",
  );
  const normalizedAddress = asString(
    asRecord(asRecord(validationResult.result?.address)?.normalized)
      ?.addressStr,
  );
  const addressValid = asBoolean(addressCheck?.valid);
  const details: string[] = [];

  appendIfPresent(details, "Request ID", validationResult.requestId);
  appendIfPresent(details, "Статус сервиса", validationResult.status);
  appendIfPresent(details, "Нормализованный адрес", normalizedAddress);

  if (
    outcome === "VALIDATION_REJECT" ||
    outcome === "COMPLIANCE_REJECT" ||
    outcome === "POC_SCENARIO_NOT_SUPPORTED"
  ) {
    return buildStage(
      "address",
      "Проверка адреса",
      "skipped",
      "До проверки адреса процесс не дошел и завершился на более раннем этапе.",
      details,
      timing,
      stageSteps,
    );
  }

  if (outcome === "ADDRESS_NOT_VERIFIED") {
    return buildStage(
      "address",
      "Проверка адреса",
      "error",
      validationResult.errorMessage ??
        "Адрес не прошел проверку или не был подтвержден внешним сервисом.",
      details,
      timing,
      stageSteps,
    );
  }

  if (hasFailedStep(steps, ROOT_ADDRESS_STEPS)) {
    return buildStage(
      "address",
      "Проверка адреса",
      "error",
      "Во время проверки адреса произошла техническая ошибка.",
      details,
      timing,
      stageSteps,
    );
  }

  if (
    isCurrentStep(workflow, ROOT_ADDRESS_STEPS) &&
    isInProgressStatus(workflow.status)
  ) {
    return buildStage(
      "address",
      "Проверка адреса",
      "active",
      validationResult.accepted
        ? "Запрос на проверку адреса отправлен, ожидаем результат."
        : "Проверяем и нормализуем адрес регистрации бенефициара.",
      details,
      timing,
      stageSteps,
    );
  }

  if (
    hasStartedStep(steps, ROOT_ADDRESS_STEPS) ||
    hasStartedStep(steps, ROOT_ABS_STEPS)
  ) {
    return buildStage(
      "address",
      "Проверка адреса",
      "completed",
      addressValid === false
        ? "Адрес проверен, но не подтвержден."
        : normalizedAddress
          ? "Адрес подтвержден и нормализован внешним сервисом."
          : "Проверка адреса завершена успешно.",
      details,
      timing,
      stageSteps,
    );
  }

  return buildStage(
    "address",
    "Проверка адреса",
    "pending",
    "Этап еще не начался.",
    details,
    timing,
    stageSteps,
  );
}

function pickRelevantSubprocess(
  subprocesses: WorkflowResponse[],
): WorkflowResponse | null {
  return (
    subprocesses.find((subprocess) => subprocess.status === "FAIL") ??
    subprocesses.find((subprocess) => isInProgressStatus(subprocess.status)) ??
    subprocesses[0] ??
    null
  );
}

function mapSubprocessBusinessStageLabel(workflow: WorkflowResponse): string {
  const stepId = workflow.currentStepId;

  if (hasStep(SUBPROCESS_FIND_STEPS, stepId) || stepId.includes("find_client")) {
    return "Поиск клиента";
  }

  if (
    hasStep(SUBPROCESS_CREATE_STEPS, stepId) ||
    stepId.includes("create_client")
  ) {
    return "Создание клиента";
  }

  if (hasStep(SUBPROCESS_BIND_STEPS, stepId) || stepId.includes("bind_client")) {
    return "Привязка клиента";
  }

  return "Итог подпроцесса";
}

function describeAbsOutcome(subprocesses: WorkflowResponse[]): {
  summary: string;
  details: string[];
  hasSubprocess: boolean;
  actionLink?: ProcessStageItem["actionLink"];
} {
  const child = pickRelevantSubprocess(subprocesses);

  if (!child) {
    return {
      summary: "Подпроцесс регистрации в АБС еще не стартовал.",
      details: [],
      hasSubprocess: false,
    };
  }
  const businessStageLabel = mapSubprocessBusinessStageLabel(child);
  const terminalPresentation = mapTerminalStagePresentation(child);
  const details: string[] = [];
  const actionLink = {
    label: "Открыть подпроцесс",
    to: `/processes/${child.rootProcessId}/subprocesses/${child.processId}`,
  };

  appendIfPresent(details, "Подпроцесс", child.processId);

  if (child.status === "FAIL") {
    appendIfPresent(details, "Этап подпроцесса", businessStageLabel);
    appendIfPresent(
      details,
      "Ошибка подпроцесса",
      terminalPresentation?.label ?? child.currentStepId,
    );

    return {
      summary: `Ошибка возникла внутри подпроцесса АБС на этапе «${businessStageLabel}».`,
      details,
      hasSubprocess: true,
      actionLink,
    };
  }

  if (isInProgressStatus(child.status)) {
    appendIfPresent(details, "Этап подпроцесса", businessStageLabel);

    return {
      summary: `Подпроцесс АБС выполняется на этапе «${businessStageLabel}».`,
      details,
      hasSubprocess: true,
      actionLink,
    };
  }

  const childOutcome = getTerminalOutcome(child);

  if (isManagedAbsBusinessOutcome(childOutcome)) {
    appendIfPresent(details, "Этап подпроцесса", businessStageLabel);
    appendIfPresent(details, "Outcome", childOutcome);

    return {
      summary:
        terminalPresentation?.summary ??
        "Подпроцесс АБС завершился управляемым бизнес-исходом.",
      details,
      hasSubprocess: true,
      actionLink,
    };
  }

  return {
    summary: "Подпроцесс АБС выполнен успешно.",
    details,
    hasSubprocess: true,
    actionLink,
  };
}

function getAbsStage(
  workflow: WorkflowResponse,
  steps: StepMap,
  subprocesses: WorkflowResponse[],
): ProcessStageItem {
  const timing = getStepTiming(steps, ROOT_ABS_STEPS);
  const outcome = getTerminalOutcome(workflow);
  const absOutcome = describeAbsOutcome(subprocesses);
  const stageSteps = absOutcome.hasSubprocess
    ? []
    : buildStepEvidence(workflow, steps, ROOT_ABS_STEPS);

  if (
    outcome === "VALIDATION_REJECT" ||
    outcome === "COMPLIANCE_REJECT" ||
    outcome === "POC_SCENARIO_NOT_SUPPORTED" ||
    outcome === "ADDRESS_NOT_VERIFIED"
  ) {
    return buildStage(
      "abs",
      "Регистрация в АБС",
      "skipped",
      "До операций в АБС процесс не дошел и завершился раньше.",
      absOutcome.details,
      timing,
      stageSteps,
      absOutcome.actionLink,
    );
  }

  if (isManagedAbsBusinessOutcome(outcome)) {
    return buildStage(
      "abs",
      "Регистрация в АБС",
      "error",
      absOutcome.summary,
      absOutcome.details,
      timing,
      stageSteps,
      absOutcome.actionLink,
    );
  }

  if (subprocesses.some((subprocess) => subprocess.status === "FAIL")) {
    return buildStage(
      "abs",
      "Регистрация в АБС",
      "error",
      absOutcome.summary,
      absOutcome.details,
      timing,
      stageSteps,
      absOutcome.actionLink,
    );
  }

  if (
    isCurrentStep(workflow, ROOT_ABS_STEPS) ||
    subprocesses.some((subprocess) => isInProgressStatus(subprocess.status))
  ) {
    return buildStage(
      "abs",
      "Регистрация в АБС",
      "active",
      absOutcome.summary,
      absOutcome.details,
      timing,
      stageSteps,
      absOutcome.actionLink,
    );
  }

  if (
    hasStartedStep(steps, ROOT_ABS_STEPS) ||
    subprocesses.some((subprocess) => subprocess.status === "COMPLETE") ||
    outcome === "BENEFICIARY_REGISTERED"
  ) {
    return buildStage(
      "abs",
      "Регистрация в АБС",
      "completed",
      absOutcome.summary,
      absOutcome.details,
      timing,
      stageSteps,
      absOutcome.actionLink,
    );
  }

  return buildStage(
    "abs",
    "Регистрация в АБС",
    "pending",
    "Этап еще не начался.",
    absOutcome.details,
    timing,
    stageSteps,
    absOutcome.actionLink,
  );
}

function getResultStage(
  workflow: WorkflowResponse,
  steps: StepMap,
): ProcessStageItem {
  const timing = getStepTiming(steps, ROOT_RESULT_STEPS);
  const stageSteps = buildStepEvidence(workflow, steps, ROOT_RESULT_STEPS);
  const terminalStage = mapTerminalStagePresentation(workflow);
  const details: string[] = [];
  const outcome = getTerminalOutcome(workflow);

  appendIfPresent(details, "Outcome", outcome);

  if (workflow.status === "COMPLETE") {
    return buildStage(
      "result",
      "Итог обработки",
      "completed",
      terminalStage?.summary ?? "Процесс завершен успешно.",
      details,
      timing,
      stageSteps,
    );
  }

  if (workflow.status === "FAIL") {
    return buildStage(
      "result",
      "Итог обработки",
      "error",
      terminalStage?.summary ?? "Процесс завершен с ошибкой.",
      details,
      timing,
      stageSteps,
    );
  }

  return buildStage(
    "result",
    "Итог обработки",
    "pending",
    "Финальный результат пока не сформирован.",
    details,
    timing,
    stageSteps,
  );
}

function getFindClientStage(
  workflow: WorkflowResponse,
  steps: StepMap,
): ProcessStageItem {
  const timing = getStepTiming(steps, SUBPROCESS_FIND_STEPS);
  const stageSteps = buildStepEvidence(workflow, steps, SUBPROCESS_FIND_STEPS);
  const findResult = getEffectResult(workflow, "send_find_client");
  const candidateFacts = asRecord(
    asRecord(workflow.context?.facts)?.client_candidates,
  );
  const decision = asRecord(
    asRecord(workflow.context?.decisions)?.find_client_scenario,
  );
  const hasMatches = asBoolean(candidateFacts?.hasMatches);
  const decisionOutcome = getDecisionOutcome(decision);
  const ownServiceClientCount = candidateFacts?.ownServiceClientCount;
  const clientMatchCount = candidateFacts?.clientMatchCount;
  const details: string[] = [];

  appendIfPresent(details, "Request ID", findResult.requestId);
  appendIfPresent(details, "Статус ответа", findResult.status);
  appendIfPresent(
    details,
    "Найдено карточек",
    typeof clientMatchCount === "number"
      ? String(clientMatchCount)
      : asString(clientMatchCount),
  );
  appendIfPresent(
    details,
    "Карточек сервиса",
    typeof ownServiceClientCount === "number"
      ? String(ownServiceClientCount)
      : asString(ownServiceClientCount),
  );

  if (findResult.errorMessage) {
    details.push(findResult.errorMessage);
  }

  if (
    isCurrentStep(workflow, SUBPROCESS_FIND_STEPS) &&
    isInProgressStatus(workflow.status)
  ) {
    return buildStage(
      "find_client",
      "Поиск клиента",
      "active",
      "Ищем клиента в АБС и определяем, нужен ли сценарий создания.",
      details,
      timing,
      stageSteps,
    );
  }

  if (decisionOutcome === "AMBIGUOUS_CLIENTS_REJECT") {
    return buildStage(
      "find_client",
      "Поиск клиента",
      "error",
      "В АБС найдено несколько карточек, и безопасно выбрать одну из них невозможно.",
      details,
      timing,
      stageSteps,
    );
  }

  if (decisionOutcome === "FOUND_OWN_SERVICE") {
    return buildStage(
      "find_client",
      "Поиск клиента",
      "completed",
      "В АБС найдена карточка, ранее созданная сервисом номинальных бенефициаров. Используем её для привязки.",
      details,
      timing,
      stageSteps,
    );
  }

  if (decisionOutcome === "CREATE_OWN_CLIENT") {
    return buildStage(
      "find_client",
      "Поиск клиента",
      "completed",
      "В АБС найдены карточки клиента, но среди них нет карточки, созданной сервисом номинальных бенефициаров. Будет создана новая карточка для текущего продукта.",
      details,
      timing,
      stageSteps,
    );
  }

  if (decisionOutcome === "NOT_FOUND" || hasMatches === false) {
    return buildStage(
      "find_client",
      "Поиск клиента",
      "completed",
      "Клиент в АБС не найден, поэтому запускаем создание новой карточки.",
      details,
      timing,
      stageSteps,
    );
  }

  if (hasStartedStep(steps, SUBPROCESS_FIND_STEPS)) {
    return buildStage(
      "find_client",
      "Поиск клиента",
      "completed",
      "Клиент найден в АБС, можно переходить к привязке.",
      details,
      timing,
      stageSteps,
    );
  }

  return buildStage(
    "find_client",
    "Поиск клиента",
    "pending",
    "Этап еще не начался.",
    details,
    timing,
    stageSteps,
  );
}

function getCreateClientStage(
  workflow: WorkflowResponse,
  steps: StepMap,
): ProcessStageItem {
  const timing = getStepTiming(steps, SUBPROCESS_CREATE_STEPS);
  const stageSteps = buildStepEvidence(workflow, steps, SUBPROCESS_CREATE_STEPS);
  const createResult = getEffectResult(workflow, "send_create_client");
  const clientPayload = asRecord(
    asRecord(createResult.result?.payload)?.client,
  );
  const createdClientId = asString(clientPayload?.id);
  const details: string[] = [];

  appendIfPresent(details, "Request ID", createResult.requestId);
  appendIfPresent(details, "Client ID", createdClientId);

  if (
    isCurrentStep(workflow, SUBPROCESS_CREATE_STEPS) &&
    isInProgressStatus(workflow.status)
  ) {
    return buildStage(
      "create_client",
      "Создание клиента",
      "active",
      "Создаем новую карточку клиента в АБС.",
      details,
      timing,
      stageSteps,
    );
  }

  if (hasFailedStep(steps, SUBPROCESS_CREATE_STEPS)) {
    return buildStage(
      "create_client",
      "Создание клиента",
      "error",
      "Во время создания клиента произошла ошибка.",
      details,
      timing,
      stageSteps,
    );
  }

  if (hasStartedStep(steps, SUBPROCESS_CREATE_STEPS)) {
    return buildStage(
      "create_client",
      "Создание клиента",
      "completed",
      createdClientId
        ? "Новая карточка клиента в АБС создана."
        : "Создание клиента завершено.",
      details,
      timing,
      stageSteps,
    );
  }

  if (
    hasStartedStep(steps, SUBPROCESS_FIND_STEPS) ||
    hasStartedStep(steps, SUBPROCESS_BIND_STEPS) ||
    !isInProgressStatus(workflow.status)
  ) {
    return buildStage(
      "create_client",
      "Создание клиента",
      "skipped",
      "Создание карточки не понадобилось: клиент уже существовал в АБС.",
      details,
      timing,
      stageSteps,
    );
  }

  return buildStage(
    "create_client",
    "Создание клиента",
    "pending",
    "Этап еще не начался.",
    details,
    timing,
    stageSteps,
  );
}

function getBindClientStage(
  workflow: WorkflowResponse,
  steps: StepMap,
): ProcessStageItem {
  const timing = getStepTiming(steps, SUBPROCESS_BIND_STEPS);
  const stageSteps = buildStepEvidence(workflow, steps, SUBPROCESS_BIND_STEPS);
  const bindResult = getEffectResult(workflow, "send_bind_client");
  const bindPayload = asRecord(bindResult.result?.payload);
  const bindFacts = asRecord(asRecord(workflow.context?.facts)?.bind_client_result);
  const bindDecision = asRecord(
    asRecord(workflow.context?.decisions)?.bind_client_outcome,
  );
  const link = asRecord(bindPayload?.link);
  const clientId = asString(link?.clientId);
  const bindingId = asString(link?.bindingId);
  const bindOutcome = getDecisionOutcome(bindDecision);
  const isAlreadyBound = asBoolean(bindFacts?.isAlreadyBound);
  const details: string[] = [];

  appendIfPresent(details, "Request ID", bindResult.requestId);
  appendIfPresent(details, "Client ID", clientId);
  appendIfPresent(details, "Binding ID", bindingId);
  appendIfPresent(details, "Outcome", bindOutcome);

  if (
    isCurrentStep(workflow, SUBPROCESS_BIND_STEPS) &&
    isInProgressStatus(workflow.status)
  ) {
    return buildStage(
      "bind_client",
      "Привязка клиента",
      "active",
      "Привязываем клиента к номинальному счету.",
      details,
      timing,
      stageSteps,
    );
  }

  if (bindOutcome === "ALREADY_BOUND" || isAlreadyBound) {
    return buildStage(
      "bind_client",
      "Привязка клиента",
      "error",
      "АБС сообщает, что бенефициар уже привязан к указанному номинальному счёту.",
      details,
      timing,
      stageSteps,
    );
  }

  if (hasFailedStep(steps, SUBPROCESS_BIND_STEPS)) {
    return buildStage(
      "bind_client",
      "Привязка клиента",
      "error",
      "Во время привязки клиента произошла ошибка.",
      details,
      timing,
      stageSteps,
    );
  }

  if (workflow.status === "FAIL" && hasStep(SUBPROCESS_BIND_STEPS, workflow.currentStepId)) {
    return buildStage(
      "bind_client",
      "Привязка клиента",
      "error",
      bindResult.errorMessage ?? "Во время привязки клиента произошла ошибка.",
      details,
      timing,
      stageSteps,
    );
  }

  if (hasStartedStep(steps, SUBPROCESS_BIND_STEPS)) {
    return buildStage(
      "bind_client",
      "Привязка клиента",
      "completed",
      bindingId
        ? "Клиент успешно привязан к номинальному счету."
        : "Привязка клиента завершена.",
      details,
      timing,
      stageSteps,
    );
  }

  return buildStage(
    "bind_client",
    "Привязка клиента",
    "pending",
    "Этап еще не начался.",
    details,
    timing,
    stageSteps,
  );
}

function getSubprocessResultStage(
  workflow: WorkflowResponse,
  steps: StepMap,
): ProcessStageItem {
  const timing = getStepTiming(steps, SUBPROCESS_RESULT_STEPS);
  const stageSteps = buildStepEvidence(workflow, steps, SUBPROCESS_RESULT_STEPS);
  const terminalStage = mapTerminalStagePresentation(workflow);
  const outcome = getTerminalOutcome(workflow);
  const details: string[] = [];

  appendIfPresent(details, "Outcome", outcome);

  if (workflow.status === "COMPLETE") {
    return buildStage(
      "result",
      "Итог подпроцесса",
      isManagedAbsBusinessOutcome(outcome) ? "error" : "completed",
      terminalStage?.summary ?? "Подпроцесс завершен успешно.",
      details,
      timing,
      stageSteps,
    );
  }

  if (workflow.status === "FAIL") {
    return buildStage(
      "result",
      "Итог подпроцесса",
      "error",
      terminalStage?.summary ?? "Подпроцесс завершен с ошибкой.",
      details,
      timing,
      stageSteps,
    );
  }

  return buildStage(
    "result",
    "Итог подпроцесса",
    "pending",
    "Финальный результат пока не сформирован.",
    details,
    timing,
    stageSteps,
  );
}

function buildRootStages(
  workflow: WorkflowResponse,
  subprocesses: WorkflowResponse[],
): ProcessStageItem[] {
  const steps = getStepMap(workflow);

  return [
    getValidationStage(workflow, steps),
    getAddressStage(workflow, steps),
    getAbsStage(workflow, steps, subprocesses),
    getResultStage(workflow, steps),
  ];
}

function buildSubprocessStages(workflow: WorkflowResponse): ProcessStageItem[] {
  const steps = getStepMap(workflow);

  return [
    getFindClientStage(workflow, steps),
    getCreateClientStage(workflow, steps),
    getBindClientStage(workflow, steps),
    getSubprocessResultStage(workflow, steps),
  ];
}

function buildOverviewPrimary(
  workflow: WorkflowResponse,
  beneficiary: BeneficiaryInput | null,
  stagePresentation: StagePresentation,
  statusPresentation: { label: string; tone: ProcessStatusTone },
): ProcessOverviewItem[] {
  return [
    {
      label: "Бенефициар",
      value: formatBeneficiaryName(beneficiary),
      description: formatBeneficiaryOverviewMeta(beneficiary),
    },
    {
      label: "Текущий этап",
      value: stagePresentation.label,
      description: stagePresentation.summary,
    },
    {
      label: "Статус",
      value: statusPresentation.label,
      description:
        asString(asRecord(workflow.result)?.outcome) ??
        "Промежуточный статус процесса",
    },
    {
      label: "Обновлено",
      value: formatWorkflowTimestamp(workflow.updatedAt),
      description: `Создан ${formatWorkflowTimestamp(workflow.createdAt)}`,
    },
  ];
}

function buildOverviewSecondary(
  workflow: WorkflowResponse,
  beneficiary: BeneficiaryInput | null,
): ProcessOverviewItem[] {
  const participationId = beneficiary?.participationId?.trim();
  const accountNumber = getAccountNumber(beneficiary);
  const isSubprocess = workflow.parentProcessId != null;
  const mainProcessId = isSubprocess
    ? workflow.rootProcessId
    : workflow.processId;
  const overviewItems: ProcessOverviewItem[] = [
    {
      label: "ID в системе мерчанта",
      value: participationId ?? "Не указан",
      compact: true,
      copyValue: participationId ?? undefined,
    },
    {
      label: "Номер счета",
      value: accountNumber ?? "Не указан",
      compact: true,
      copyValue: accountNumber ?? undefined,
    },
  ];

  if (!isSubprocess || workflow.applicationRequestId !== mainProcessId) {
    overviewItems.push({
      label: "ID заявки",
      value: workflow.applicationRequestId,
      compact: true,
      copyValue: workflow.applicationRequestId,
    });
  }

  if (isSubprocess || workflow.applicationRequestId !== mainProcessId) {
    overviewItems.push({
      label: isSubprocess ? "ID основного процесса" : "ID процесса",
      value: mainProcessId,
      compact: true,
      copyValue: mainProcessId,
    });
  }

  overviewItems.push(
    {
      label: "Бизнес-процесс",
      value: workflow.id,
      compact: true,
    },
    {
      label: "Версия",
      value: workflow.version,
      compact: true,
    },
  );

  return overviewItems;
}

function buildSubflowHandoff(
  workflow: WorkflowResponse,
  subprocessWorkflows: WorkflowResponse[],
) {
  if (workflow.parentProcessId != null) {
    return null;
  }

  const childWorkflow = subprocessWorkflows[0];

  if (!childWorkflow) {
    return null;
  }

  const parentFacts = asRecord(workflow.context?.facts);
  const parentInput = parentFacts?.abs_ensure_subflow_input;
  const childInput = childWorkflow.context?.input?.application ?? null;

  if (parentInput == null && childInput == null) {
    return null;
  }

  const isDifferent =
    JSON.stringify(parentInput ?? null) !== JSON.stringify(childInput ?? null);

  return {
    parentInput,
    childInput,
    isDifferent,
  };
}

export function mapWorkflowToDetails(
  workflow: WorkflowResponse,
  allWorkflows: WorkflowResponse[],
): ProcessDetails {
  const subprocessWorkflows = allWorkflows.filter(
    (candidate) => candidate.parentProcessId === workflow.processId,
  );
  const subprocesses = subprocessWorkflows.map(mapWorkflowToSubprocessListItem);
  const beneficiary = getBeneficiary(workflow);
  const statusPresentation = mapStatusPresentation(workflow.status);
  const isSubprocess = workflow.parentProcessId != null;
  const stagePresentation = isSubprocess
    ? mapSubprocessStagePresentation(workflow)
    : mapRootStagePresentation(workflow);
  const stages = isSubprocess
    ? buildSubprocessStages(workflow)
    : buildRootStages(workflow, subprocessWorkflows);

  return {
    processId: workflow.processId,
    parentProcessId: workflow.parentProcessId ?? null,
    applicationRequestId: workflow.applicationRequestId,
    kind: isSubprocess ? "subprocess" : "root",
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
    history: mapWorkflowHistory(workflow.history, workflow.id),
    subprocesses,
    subflowHandoff: buildSubflowHandoff(workflow, subprocessWorkflows),
    stages,
  };
}
