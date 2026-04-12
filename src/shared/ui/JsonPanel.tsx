type JsonPanelProps = {
  value: unknown
  emptyMessage: string
}

export function JsonPanel({ value, emptyMessage }: JsonPanelProps) {
  const jsonValue = value == null ? null : JSON.stringify(value, null, 2)

  if (!jsonValue) {
    return <p className="app-empty-text">{emptyMessage}</p>
  }

  return (
    <pre className="app-json-panel">
      <code>{jsonValue}</code>
    </pre>
  )
}
