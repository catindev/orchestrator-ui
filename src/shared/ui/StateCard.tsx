type StateCardProps = {
  title: string
  text: string
  actionLabel?: string
  onAction?: () => void
}

export function StateCard({
  title,
  text,
  actionLabel,
  onAction,
}: StateCardProps) {
  return (
    <div className="app-state-card">
      <p className="app-state-card__title">{title}</p>
      <p className="app-state-card__text">{text}</p>

      {actionLabel && onAction ? (
        <button className="app-state-card__action" type="button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
