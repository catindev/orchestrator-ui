import { cn } from '../../../shared/lib/cn'
import {
  LONGEST_PROCESS_STATUS_LABEL,
  type ProcessListItem,
} from '../types'

const STATUS_TONE_CLASS: Record<ProcessListItem['statusTone'], string> = {
  success: 'process-status-badge--success',
  error: 'process-status-badge--error',
  neutral: 'process-status-badge--neutral',
}

type ProcessStatusBadgeProps = {
  label: ProcessListItem['statusLabel']
  tone: ProcessListItem['statusTone']
}

export function ProcessStatusBadge({
  label,
  tone,
}: ProcessStatusBadgeProps) {
  return (
    <div className={cn('process-status-badge', STATUS_TONE_CLASS[tone])}>
      <span className="process-row__label">Статус</span>
      <span className="process-status-badge__track">
        <span
          className="process-row__value process-status-badge__measure"
          aria-hidden="true"
        >
          {LONGEST_PROCESS_STATUS_LABEL}
        </span>
        <span className="process-row__value process-status-badge__value">
          {label}
        </span>
      </span>
    </div>
  )
}
