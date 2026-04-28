import { cn } from '../../../shared/lib/cn'
import { CopyableValue } from '../../../shared/ui/CopyableValue'

type ProcessDetailMetaProps = {
  label: string
  value: string
  description?: string
  compact?: boolean
  copyValue?: string
}

export function ProcessDetailMeta({
  label,
  value,
  description,
  compact = false,
  copyValue,
}: ProcessDetailMetaProps) {
  return (
    <div className={cn('process-detail-meta', compact && 'process-detail-meta--compact')}>
      <span className="process-detail-meta__label">{label}</span>
      {copyValue ? (
        <CopyableValue
          className="process-detail-meta__value process-detail-meta__copyable"
          value={copyValue}
        />
      ) : (
        <span className="process-detail-meta__value" title={value}>
          {value}
        </span>
      )}
      {description ? (
        <span className="process-detail-meta__description" title={description}>
          {description}
        </span>
      ) : null}
    </div>
  )
}
