import type { ProcessHistoryItem } from '../types'

type ProcessHistoryListProps = {
  history: ProcessHistoryItem[]
}

export function ProcessHistoryList({ history }: ProcessHistoryListProps) {
  if (history.length === 0) {
    return (
      <p className="app-empty-text">
        История выполнения для этого процесса отсутствует.
      </p>
    )
  }

  return (
    <div className="process-tab-list">
      {history.map((item) => (
        <article
          className="process-tab-list__row process-tab-list__row--history"
          key={`${item.at}-${item.kind}-${item.stepId}-${item.details ?? 'no-details'}`}
        >
          <div className="process-tab-list__meta process-tab-list__meta--wide">
            <span className="process-tab-list__label">Время</span>
            <span className="process-tab-list__value" title={item.at}>
              {item.at}
            </span>
          </div>

          <div className="process-tab-list__meta">
            <span className="process-tab-list__label">Событие</span>
            <span className="process-tab-list__value" title={item.kind}>
              {item.kindLabel}
            </span>
          </div>

          <div className="process-tab-list__meta">
            <span className="process-tab-list__label">Шаг</span>
            <span className="process-tab-list__value" title={item.stepId}>
              {item.stepLabel}
            </span>
          </div>

          <div className="process-tab-list__meta process-tab-list__meta--details">
            <span className="process-tab-list__label">Детали</span>
            <span
              className="process-tab-list__value"
              title={item.details ?? 'Без дополнительных деталей'}
            >
              {item.details ?? 'Без дополнительных деталей'}
            </span>
          </div>
        </article>
      ))}
    </div>
  )
}
