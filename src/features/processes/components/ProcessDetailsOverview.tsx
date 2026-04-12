import type { ProcessDetails } from '../types'
import { ProcessDetailMeta } from './ProcessDetailMeta'

type ProcessDetailsOverviewProps = {
  process: ProcessDetails
}

export function ProcessDetailsOverview({
  process,
}: ProcessDetailsOverviewProps) {
  return (
    <section className="process-detail-summary" aria-label="Сводка по процессу">
      <div className="process-detail-summary__primary">
        <ProcessDetailMeta label="ID процесса" value={process.processId} />
        <ProcessDetailMeta label="Создан" value={process.createdAt} />
        <ProcessDetailMeta
          label="Последнее изменение"
          value={process.updatedAt}
        />
        <ProcessDetailMeta
          label="Текущий шаг"
          value={process.currentStepType}
        />
        <ProcessDetailMeta label="Статус" value={process.status} />
      </div>

      <div className="process-detail-summary__secondary">
        <ProcessDetailMeta
          label="ID заявки"
          value={process.applicationRequestId}
          compact
        />
        <ProcessDetailMeta
          label="ID шага в процессе"
          value={process.currentStepId}
          compact
        />
        <ProcessDetailMeta
          label="Версия процесса"
          value={process.version}
          compact
        />
        <ProcessDetailMeta
          label="Код процесса"
          value={process.workflowId}
          compact
        />
        <ProcessDetailMeta
          label="Trace-режим"
          value={process.traceMode}
          compact
        />
      </div>
    </section>
  )
}
