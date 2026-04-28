import { useState, type MouseEvent } from 'react'
import copyIcon from './icon-copy.svg'

type CopyableValueProps = {
  value: string
  className?: string
}

export function CopyableValue({ value, className }: CopyableValueProps) {
  const [isCopied, setIsCopied] = useState(false)

  async function handleCopy(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    event.stopPropagation()

    try {
      await navigator.clipboard.writeText(value)
      setIsCopied(true)
      window.setTimeout(() => setIsCopied(false), 1200)
    } catch {
      setIsCopied(false)
    }
  }

  return (
    <span className={className ? `app-copyable ${className}` : 'app-copyable'}>
      <button
        className={isCopied ? 'app-copyable__button app-copyable__button--copied' : 'app-copyable__button'}
        type="button"
        aria-label={`Скопировать ${value}`}
        title={isCopied ? 'Скопировано' : 'Скопировать'}
        onClick={handleCopy}
      >
        <img
          alt=""
          aria-hidden="true"
          className="app-copyable__icon"
          src={copyIcon}
        />
      </button>
      <span className="app-copyable__value" title={value}>
        {value}
      </span>
    </span>
  )
}
