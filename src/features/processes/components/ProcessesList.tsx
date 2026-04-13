import type { ProcessListItem } from '../types'
import { StateCard } from '../../../shared/ui/StateCard'
import { ProcessRow } from './ProcessRow'

type ProcessesListProps = {
  processes: ProcessListItem[]
  isLoading: boolean
  errorMessage: string | null
  hasQuery: boolean
  onRetry: () => void
}

export function ProcessesList({
  processes,
  isLoading,
  errorMessage,
  hasQuery,
  onRetry,
}: ProcessesListProps) {
  const announcement = isLoading
    ? 'Загружаем процессы'
    : errorMessage
      ? 'Не удалось загрузить процессы'
      : processes.length > 0
        ? `Найдено процессов: ${processes.length}`
        : 'Процессы не найдены'

  return (
    <div className="processes-list">
      <p className="app-visually-hidden" role="status">
        {announcement}
      </p>

      {isLoading ? (
        <StateCard
          title="Загружаем процессы"
          text="Получаем список процессов из orchestration backend."
        />
      ) : errorMessage ? (
        <StateCard
          title="Не удалось загрузить процессы"
          text={errorMessage}
          actionLabel="Повторить"
          onAction={onRetry}
        />
      ) : processes.length > 0 ? (
        processes.map((process) => (
          <ProcessRow key={process.processId} process={process} />
        ))
      ) : (
        <StateCard
          title={hasQuery ? 'Ничего не найдено' : 'Нет корневых процессов'}
          text={
            hasQuery
              ? 'Попробуй искать по ID заявки, ИНН, ФИО бенефициара или participation ID.'
              : 'Бэкенд пока не вернул ни одного корневого процесса.'
          }
        />
      )}
    </div>
  )
}
