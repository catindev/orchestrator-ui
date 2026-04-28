import { cn } from '../../../shared/lib/cn'
import { CopyableValue } from '../../../shared/ui/CopyableValue'

type ProcessMetaProps = {
  label: string
  value: string
  description?: string
  className?: string
  copyValue?: string
}

export function ProcessMeta({
  label,
  value,
  description,
  className,
  copyValue,
}: ProcessMetaProps) {
  return (
    <div className={cn('process-row__meta', className)}>
      <span className="process-row__label">{label}</span>
      {copyValue ? (
        <CopyableValue className="process-row__value process-row__copyable" value={copyValue} />
      ) : (
        <span className="process-row__value" title={value}>
          {value}
        </span>
      )}
      {description ? (
        <span className="process-row__description" title={description}>
          {description}
        </span>
      ) : null}
    </div>
  )
}
