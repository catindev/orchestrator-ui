import { cn } from '../../../shared/lib/cn'

type ProcessDetailMetaProps = {
  label: string
  value: string
  compact?: boolean
}

export function ProcessDetailMeta({
  label,
  value,
  compact = false,
}: ProcessDetailMetaProps) {
  return (
    <div className={cn('process-detail-meta', compact && 'process-detail-meta--compact')}>
      <span className="process-detail-meta__label">{label}</span>
      <span className="process-detail-meta__value" title={value}>
        {value}
      </span>
    </div>
  )
}
