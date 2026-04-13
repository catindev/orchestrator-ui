import { cn } from '../../../shared/lib/cn'
import type { ProcessDetails, ProcessStageItem } from '../types'

type ProcessStageTimelineProps = {
  process: ProcessDetails
}

const STAGE_STATE_CLASS: Record<ProcessStageItem['state'], string> = {
  completed: 'process-stage--completed',
  active: 'process-stage--active',
  error: 'process-stage--error',
  pending: 'process-stage--pending',
  skipped: 'process-stage--skipped',
}

export function ProcessStageTimeline({ process }: ProcessStageTimelineProps) {
  if (process.stages.length === 0) {
    return (
      <p className="app-empty-text">
        Для этого процесса пока нет собранного хода выполнения.
      </p>
    )
  }

  return (
    <div className="process-stage-list">
      {process.stages.map((stage) => (
        <article
          className={cn('process-stage', STAGE_STATE_CLASS[stage.state])}
          key={stage.id}
        >
          <div className="process-stage__header">
            <div className="process-stage__heading">
              <span className="process-stage__eyebrow">Этап</span>
              <h3 className="process-stage__title">{stage.title}</h3>
            </div>

            <span className="process-stage__state">{stage.stateLabel}</span>
          </div>

          <p className="process-stage__summary">{stage.summary}</p>

          {stage.details.length > 0 ? (
            <ul className="process-stage__details">
              {stage.details.map((detail) => (
                <li className="process-stage__detail" key={detail}>
                  {detail}
                </li>
              ))}
            </ul>
          ) : null}

          {stage.startedAt || stage.finishedAt ? (
            <div className="process-stage__timeline">
              {stage.startedAt ? (
                <span className="process-stage__time">
                  <span className="process-stage__time-label">Старт</span>
                  <span className="process-stage__time-value">{stage.startedAt}</span>
                </span>
              ) : null}

              {stage.finishedAt ? (
                <span className="process-stage__time">
                  <span className="process-stage__time-label">Завершение</span>
                  <span className="process-stage__time-value">{stage.finishedAt}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  )
}
