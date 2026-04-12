import { Link } from 'react-router-dom'
import type { ProcessListItem } from '../types'
import { ProcessMeta } from './ProcessMeta'
import { ProcessStatusBadge } from './ProcessStatusBadge'

type ProcessRowProps = {
  process: ProcessListItem
}

export function ProcessRow({ process }: ProcessRowProps) {
  return (
    <Link
      className="process-row"
      to={`/processes/${process.processId}`}
      aria-label={`Открыть процесс ${process.processId}`}
    >
      <ProcessMeta
        label="ID заявки"
        value={process.applicationRequestId}
        className="process-row__meta--id"
      />
      <ProcessMeta label="Создана" value={process.createdAt} />
      <ProcessMeta label="Последнее изменение" value={process.updatedAt} />
      <ProcessMeta
        label="Текущий шаг"
        value={process.currentStep}
        className="process-row__meta--step"
      />
      <ProcessStatusBadge label={process.statusLabel} tone={process.statusTone} />
    </Link>
  )
}
