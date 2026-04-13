import { cn } from '../../../shared/lib/cn'

type ProcessMetaProps = {
  label: string
  value: string
  description?: string
  className?: string
}

export function ProcessMeta({
  label,
  value,
  description,
  className,
}: ProcessMetaProps) {
  return (
    <div className={cn('process-row__meta', className)}>
      <span className="process-row__label">{label}</span>
      <span className="process-row__value" title={value}>
        {value}
      </span>
      {description ? (
        <span className="process-row__description" title={description}>
          {description}
        </span>
      ) : null}
    </div>
  )
}
