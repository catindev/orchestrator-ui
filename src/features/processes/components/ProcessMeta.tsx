import { cn } from '../../../shared/lib/cn'

type ProcessMetaProps = {
  label: string
  value: string
  className?: string
}

export function ProcessMeta({ label, value, className }: ProcessMetaProps) {
  return (
    <div className={cn('process-row__meta', className)}>
      <span className="process-row__label">{label}</span>
      <span className="process-row__value" title={value}>
        {value}
      </span>
    </div>
  )
}
