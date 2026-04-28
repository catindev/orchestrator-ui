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
      aria-label={`Открыть заявку ${process.applicationRequestId} для ${process.beneficiaryName}`}
    >
      <ProcessMeta
        label="Бенефициар"
        value={process.beneficiaryName}
        description={process.beneficiaryMeta}
      />
      <ProcessMeta
        label="ID заявки"
        value={process.applicationRequestId}
        description={process.requestMeta}
        copyValue={process.applicationRequestId}
      />
      <ProcessMeta
        label="Текущий этап"
        value={process.stageLabel}
        description={process.stageSummary}
        className="process-row__meta--stage"
      />
      <ProcessMeta
        label="Обновлено"
        value={process.updatedAt}
        description={`Создана ${process.createdAt}`}
        className="process-row__meta--updated"
      />
      <ProcessStatusBadge label={process.statusLabel} tone={process.statusTone} />
    </Link>
  )
}
