import { Link } from 'react-router-dom'
import type { SubprocessListItem } from '../types'

type SubprocessesListProps = {
  parentProcessId: string
  subprocesses: SubprocessListItem[]
}

export function SubprocessesList({
  parentProcessId,
  subprocesses,
}: SubprocessesListProps) {
  if (subprocesses.length === 0) {
    return (
      <p className="app-empty-text">
        У этого процесса пока нет подпроцессов.
      </p>
    )
  }

  return (
    <div className="process-tab-list">
      {subprocesses.map((subprocess) => (
        <Link
          className="process-tab-list__row process-tab-list__row--subprocess process-tab-list__row--link"
          key={subprocess.processId}
          to={`/processes/${parentProcessId}/subprocesses/${subprocess.processId}`}
        >
          <div className="process-tab-list__meta process-tab-list__meta--wide">
            <span className="process-tab-list__label">ID процесса</span>
            <span className="process-tab-list__value" title={subprocess.processId}>
              {subprocess.processId}
            </span>
          </div>

          <div className="process-tab-list__meta">
            <span className="process-tab-list__label">Создан</span>
            <span className="process-tab-list__value" title={subprocess.createdAt}>
              {subprocess.createdAt}
            </span>
          </div>

          <div className="process-tab-list__meta">
            <span className="process-tab-list__label">Последнее изменение</span>
            <span className="process-tab-list__value" title={subprocess.updatedAt}>
              {subprocess.updatedAt}
            </span>
          </div>

          <div className="process-tab-list__meta">
            <span className="process-tab-list__label">Текущий шаг</span>
            <span
              className="process-tab-list__value"
              title={subprocess.currentStepType}
            >
              {subprocess.currentStepType}
            </span>
          </div>

          <div className="process-tab-list__meta">
            <span className="process-tab-list__label">Статус</span>
            <span className="process-tab-list__value" title={subprocess.status}>
              {subprocess.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
