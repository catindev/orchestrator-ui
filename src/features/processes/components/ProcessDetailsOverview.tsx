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
        {process.overviewPrimary.map((item) => (
          <ProcessDetailMeta
            key={item.label}
            label={item.label}
            value={item.value}
            description={item.description}
          />
        ))}
      </div>

      <div className="process-detail-summary__secondary">
        {process.overviewSecondary.map((item) => (
          <ProcessDetailMeta
            key={item.label}
            label={item.label}
            value={item.value}
            description={item.description}
            compact={item.compact}
          />
        ))}
      </div>
    </section>
  )
}
