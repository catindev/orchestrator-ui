import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { cn } from '../lib/cn'
import {
  DEFAULT_ORCHESTRATOR_SERVER_URL,
  normalizeOrchestratorServerUrl,
} from '../lib/orchestrator-server'
import { useOrchestratorServer } from '../lib/use-orchestrator-server'

export function OrchestratorServerControl() {
  const { serverUrl, setServerUrl } = useOrchestratorServer()
  const [isEditing, setIsEditing] = useState(false)
  const [draftValue, setDraftValue] = useState(serverUrl)
  const [hasError, setHasError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  function startEditing() {
    setDraftValue(serverUrl)
    setHasError(false)
    setIsEditing(true)
  }

  function stopEditing() {
    setDraftValue(serverUrl)
    setHasError(false)
    setIsEditing(false)
  }

  function saveValue() {
    const normalizedServerUrl = normalizeOrchestratorServerUrl(draftValue)

    if (!normalizedServerUrl) {
      setHasError(true)
      return
    }

    setServerUrl(normalizedServerUrl)
    setHasError(false)
    setIsEditing(false)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveValue()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      stopEditing()
    }
  }

  if (isEditing) {
    return (
      <form className="app-server-control__form" onSubmit={handleSubmit}>
        <label className="app-server-control app-server-control--editing">
          <span className="app-server-control__label">Сервер заявок</span>
          <input
            ref={inputRef}
            className={cn(
              'app-server-control__input',
              hasError && 'app-server-control__input--error',
            )}
            value={draftValue}
            onChange={(event) => {
              setDraftValue(event.target.value)
              if (hasError) {
                setHasError(false)
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={DEFAULT_ORCHESTRATOR_SERVER_URL}
            aria-label="Сервер заявок"
          />
        </label>
      </form>
    )
  }

  return (
    <button
      type="button"
      className="app-server-control"
      onClick={startEditing}
      title={serverUrl}
    >
      <span className="app-server-control__label">Сервер заявок</span>
      <span className="app-server-control__value">{serverUrl}</span>
    </button>
  )
}
