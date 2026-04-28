import { JsonExplorer } from '../../../../shared/ui/JsonExplorer'
import type { ProcessSubflowHandoff } from '../../types'

type SubflowHandoffPanelProps = {
  handoff: ProcessSubflowHandoff
}

export function SubflowHandoffPanel({ handoff }: SubflowHandoffPanelProps) {
  if (!handoff.isDifferent) {
    return null
  }

  return (
    <section className="handoff-panel" aria-label="Передача данных в подпроцесс">
      <div className="handoff-panel__header">
        <div className="handoff-panel__heading">
          <span className="handoff-panel__eyebrow">Передача данных</span>
          <h3 className="handoff-panel__title">Вход в подпроцесс АБС</h3>
        </div>
        <p className="handoff-panel__text">
          Слева данные, которые родитель передал в подпроцесс, справа входные
          данные, с которыми подпроцесс реально стартовал.
        </p>
      </div>

      <div className="handoff-panel__grid">
        <section className="handoff-panel__section">
          <h4 className="handoff-panel__section-title">Родительский процесс</h4>
          <JsonExplorer
            data={handoff.parentInput}
            collapsed={2}
            defaultExpanded={['beneficiary', 'beneficiary.address', 'beneficiary.account']}
            className="handoff-panel__json"
          />
        </section>

        <section className="handoff-panel__section">
          <h4 className="handoff-panel__section-title">Подпроцесс</h4>
          <JsonExplorer
            data={handoff.childInput}
            collapsed={2}
            defaultExpanded={['beneficiary', 'beneficiary.address', 'beneficiary.account']}
            className="handoff-panel__json"
          />
        </section>
      </div>
    </section>
  )
}
