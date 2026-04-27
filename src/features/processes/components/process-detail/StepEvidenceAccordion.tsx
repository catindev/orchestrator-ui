import { JsonExplorer } from '../../../../shared/ui/JsonExplorer'
import type {
  StepEvidenceItem,
  StepEvidencePanel,
  StepKind,
} from '../../types'
import { StepErrorCallout } from './StepErrorCallout'

type StepEvidenceAccordionProps = {
  items: StepEvidenceItem[]
}

const STEP_KIND_LABELS: Record<StepKind, string> = {
  prepare: 'Подготовка',
  send: 'Отправка',
  wait: 'Ожидание',
  extract: 'Разбор',
  decision: 'Решение',
  finish: 'Завершение',
}

function getPanelExpansion(panelKey: string) {
  switch (panelKey) {
    case 'response':
      return {
        collapsed: false as const,
        defaultExpanded: ['error', 'result.payload', 'payload'],
      }
    case 'decision':
      return {
        collapsed: false as const,
        defaultExpanded: ['outcome', 'reason'],
      }
    default:
      return {
        collapsed: 2 as const,
        defaultExpanded: [] as string[],
      }
  }
}

function renderPanel(
  panelKey: string,
  panel: StepEvidencePanel,
  stepId: string,
) {
  const expansion = getPanelExpansion(panelKey)

  return (
    <section className="step-evidence__panel" key={`${stepId}:${panelKey}`}>
      <h5 className="step-evidence__panel-title">{panel.title}</h5>
      <div className="step-evidence__panel-body">
        <JsonExplorer
          data={panel.data}
          collapsed={expansion.collapsed}
          defaultExpanded={expansion.defaultExpanded}
          className="step-evidence__json"
        />
      </div>
    </section>
  )
}

export function StepEvidenceAccordion({
  items,
}: StepEvidenceAccordionProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="step-evidence-list">
      {items.map((step) => {
        const panels = Object.entries(step.panels).filter(
          ([, panel]) => panel?.data != null,
        ) as Array<[string, StepEvidencePanel]>

        return (
          <details
            className="step-evidence"
            key={step.stepId}
            open={step.error != null}
          >
            <summary className="step-evidence__summary">
              <div className="step-evidence__summary-main">
                <div className="step-evidence__heading">
                  <span className="step-evidence__kind">
                    {STEP_KIND_LABELS[step.kind]}
                  </span>
                  <h4 className="step-evidence__title">{step.title}</h4>
                </div>

                {step.summary ? (
                  <p className="step-evidence__text">{step.summary}</p>
                ) : null}

                {step.error ? <StepErrorCallout error={step.error} /> : null}
              </div>

              <div className="step-evidence__summary-side">
                {step.status ? (
                  <span className="step-evidence__status">{step.status}</span>
                ) : null}

                {step.startedAt || step.finishedAt ? (
                  <span className="step-evidence__time">
                    {[step.startedAt, step.finishedAt].filter(Boolean).join(' → ')}
                  </span>
                ) : null}
              </div>
            </summary>

            {panels.length > 0 ? (
              <div className="step-evidence__panels">
                {panels.map(([panelKey, panel]) =>
                  renderPanel(panelKey, panel, step.stepId),
                )}
              </div>
            ) : (
              <p className="step-evidence__empty">
                Для этого шага нет отдельного набора данных.
              </p>
            )}
          </details>
        )
      })}
    </div>
  )
}
