import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import './processes-page.css'
import { ProcessHistoryList } from './components/ProcessHistoryList'
import { ProcessDetailsOverview } from './components/ProcessDetailsOverview'
import { SubprocessesList } from './components/SubprocessesList'
import { useProcessDetails } from './hooks/useProcessDetails'
import type { ProcessTabId } from './types'
import { BackLink } from '../../shared/ui/BackLink'
import { JsonPanel } from '../../shared/ui/JsonPanel'
import { PageHeader } from '../../shared/ui/PageHeader'
import { PageLayout } from '../../shared/ui/PageLayout'
import { StateCard } from '../../shared/ui/StateCard'
import { Tabs, type TabOption } from '../../shared/ui/Tabs'

const PROCESS_TABS: TabOption<ProcessTabId>[] = [
  { id: 'input', label: 'Входные данные' },
  { id: 'history', label: 'История выполнения' },
  { id: 'context', label: 'Контекст' },
  { id: 'subprocesses', label: 'Подпроцессы' },
  { id: 'result', label: 'Результат' },
]

const SUBPROCESS_TABS: TabOption<ProcessTabId>[] = [
  { id: 'history', label: 'История выполнения' },
  { id: 'context', label: 'Контекст' },
  { id: 'result', label: 'Результат' },
]

export function ProcessDetailsPage() {
  const { processId, parentProcessId, subprocessId } = useParams()
  const targetProcessId = subprocessId ?? processId
  const isSubprocessRoute = Boolean(subprocessId)
  const tabs = useMemo(
    () => (isSubprocessRoute ? SUBPROCESS_TABS : PROCESS_TABS),
    [isSubprocessRoute],
  )
  const defaultTab: ProcessTabId = isSubprocessRoute ? 'history' : 'input'
  const routeScope = `${isSubprocessRoute ? 'subprocess' : 'process'}:${targetProcessId ?? 'unknown'}`
  const [tabState, setTabState] = useState<{
    scope: string
    tab: ProcessTabId
  }>({
    scope: routeScope,
    tab: defaultTab,
  })
  const { process, isLoading, errorMessage, refetch } =
    useProcessDetails(targetProcessId)
  const activeTab =
    tabState.scope === routeScope &&
    tabs.some((tab) => tab.id === tabState.tab)
      ? tabState.tab
      : defaultTab

  const subtitle = process
    ? `Заявка ${process.applicationRequestId}`
    : targetProcessId
      ? `Процесс ${targetProcessId}`
      : 'Процесс'

  const resolvedParentProcessId = process?.parentProcessId ?? parentProcessId ?? null
  const backLinkTarget = resolvedParentProcessId
    ? `/processes/${resolvedParentProcessId}`
    : '/'
  const backLinkLabel = resolvedParentProcessId ? '< К процессу' : '< Все заявки'

  function renderActiveTabContent() {
    if (!process) {
      return null
    }

    if (activeTab === 'input') {
      return (
        <JsonPanel
          value={process.inputApplication}
          emptyMessage="У процесса нет входных данных в context.input.application."
        />
      )
    }

    if (activeTab === 'history') {
      return <ProcessHistoryList history={process.history} />
    }

    if (activeTab === 'context') {
      return (
        <JsonPanel
          value={process.contextSummary}
          emptyMessage="У процесса нет данных в context.facts/checks/effects/decisions."
        />
      )
    }

    if (activeTab === 'subprocesses') {
      return (
        <SubprocessesList
          parentProcessId={process.processId}
          subprocesses={process.subprocesses}
        />
      )
    }

    if (activeTab === 'result') {
      return (
        <JsonPanel
          value={process.resultData}
          emptyMessage="У процесса нет данных в поле result."
        />
      )
    }

    return (
      <p className="app-empty-text">
        Контент вкладки появится, когда дособерем макет этой секции.
      </p>
    )
  }

  return (
    <PageLayout>
      <BackLink to={backLinkTarget} label={backLinkLabel} />

      <PageHeader
        title="Бенефициары ном. счетов"
        subtitle={subtitle}
        detail
      />

      {isLoading ? (
        <StateCard
          title="Загружаем процесс"
          text="Получаем детали процесса и входные данные orchestration backend."
        />
      ) : errorMessage ? (
        <StateCard
          title="Не удалось загрузить процесс"
          text={errorMessage}
          actionLabel="Повторить"
          onAction={refetch}
        />
      ) : process ? (
        <div className="process-detail-layout">
          <ProcessDetailsOverview process={process} />

          <section className="process-detail-tabs-section">
            <Tabs
              activeTab={activeTab}
              tabs={tabs}
              ariaLabel="Секции процесса"
              onChange={(tab) => setTabState({ scope: routeScope, tab })}
            />
            <div className="app-tab-panel">{renderActiveTabContent()}</div>
          </section>
        </div>
      ) : (
        <StateCard
          title="Процесс не найден"
          text="Проверь идентификатор процесса и попробуй открыть страницу снова."
        />
      )}
    </PageLayout>
  )
}
