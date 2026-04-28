import { Link } from "react-router-dom";
import { cn } from "../../../shared/lib/cn";
import { CopyableValue } from "../../../shared/ui/CopyableValue";
import type { ProcessDetails, ProcessStageItem } from "../types";
import { StepEvidenceAccordion } from "./process-detail/StepEvidenceAccordion";

type ProcessStageTimelineProps = {
  process: ProcessDetails;
};

const STAGE_STATE_CLASS: Record<ProcessStageItem["state"], string> = {
  completed: "process-stage--completed",
  active: "process-stage--active",
  error: "process-stage--error",
  pending: "process-stage--pending",
  skipped: "process-stage--skipped",
};

const COPYABLE_STAGE_DETAIL_LABELS = new Set([
  "Request ID",
  "Подпроцесс",
  "Client ID",
  "Binding ID",
]);

function renderStageDetail(detail: string) {
  const separatorIndex = detail.indexOf(": ");

  if (separatorIndex < 0) {
    return <span className="process-stage__detail-text">{detail}</span>;
  }

  const label = detail.slice(0, separatorIndex);
  const value = detail.slice(separatorIndex + 2);

  if (!COPYABLE_STAGE_DETAIL_LABELS.has(label) || value.length === 0) {
    return <span className="process-stage__detail-text">{detail}</span>;
  }

  return (
    <span className="process-stage__detail-copyable">
      <span className="process-stage__detail-label">{label}:</span>
      <CopyableValue className="process-stage__detail-value" value={value} />
    </span>
  );
}

export function ProcessStageTimeline({ process }: ProcessStageTimelineProps) {
  if (process.stages.length === 0) {
    return (
      <p className="app-empty-text">
        Для этого процесса пока нет собранного хода выполнения.
      </p>
    );
  }

  return (
    <div className="process-stage-list">
      {process.stages.map((stage) => (
        <article
          className={cn("process-stage", STAGE_STATE_CLASS[stage.state])}
          key={stage.id}
        >
          <div className="process-stage__header">
            <div className="process-stage__heading">
              <span className="process-stage__eyebrow">
                Этап бизнес-процесса
              </span>
              <h3 className="process-stage__title">{stage.title}</h3>
            </div>

            <span className="process-stage__state">{stage.stateLabel}</span>
          </div>

          <p className="process-stage__summary">{stage.summary}</p>

          {stage.details.length > 0 ? (
            <ul className="process-stage__details">
              {stage.details.map((detail) => (
                <li className="process-stage__detail" key={detail}>
                  {renderStageDetail(detail)}
                </li>
              ))}
            </ul>
          ) : null}

          {stage.actionLink ? (
            <Link className="process-stage__action-link" to={stage.actionLink.to}>
              {stage.actionLink.label}
            </Link>
          ) : null}

          {stage.steps.length > 0 ? (
            <details
              className="process-stage__steps-disclosure"
              open={stage.steps.some((step) => step.error != null)}
            >
              <summary className="process-stage__steps-summary">
                <span className="process-stage__steps-title">
                  Шагов в этапе
                </span>
                <span className="process-stage__steps-count">
                  {stage.steps.length}
                </span>
              </summary>
              <StepEvidenceAccordion items={stage.steps} />
            </details>
          ) : null}

          {stage.startedAt || stage.finishedAt ? (
            <div className="process-stage__timeline">
              {stage.startedAt ? (
                <span className="process-stage__time">
                  <span className="process-stage__time-label">Старт</span>
                  <span className="process-stage__time-value">
                    {stage.startedAt}
                  </span>
                </span>
              ) : null}

              {stage.finishedAt ? (
                <span className="process-stage__time">
                  <span className="process-stage__time-label">Завершение</span>
                  <span className="process-stage__time-value">
                    {stage.finishedAt}
                  </span>
                </span>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
