import { useState } from 'react'
import './processes-page.css'
import { ProcessesList } from './components/ProcessesList'
import { useRootProcesses } from './hooks/useRootProcesses'
import { PageHeader } from '../../shared/ui/PageHeader'
import { PageLayout } from '../../shared/ui/PageLayout'
import { SearchInput } from '../../shared/ui/SearchInput'

export function ProcessesPage() {
  const [query, setQuery] = useState('')
  const { processes, isLoading, errorMessage, refetch } = useRootProcesses()

  const normalizedQuery = query.trim().toLowerCase()
  const visibleProcesses = processes.filter(
    ({ searchableText }) => searchableText.includes(normalizedQuery),
  )

  return (
    <PageLayout labelledBy="page-title">
      <PageHeader
        title="Бенефициары ном. счетов"
        subtitle="Заявки на регистрацию"
      />
      <SearchInput
        label="Поиск по заявке, ИНН, participation ID или имени бенефициара"
        name="application-search"
        placeholder="ID заявки, ИНН, ФИО, participation ID"
        value={query}
        onChange={setQuery}
      />
      <ProcessesList
        processes={visibleProcesses}
        isLoading={isLoading}
        errorMessage={errorMessage}
        hasQuery={normalizedQuery.length > 0}
        onRetry={refetch}
      />
    </PageLayout>
  )
}
