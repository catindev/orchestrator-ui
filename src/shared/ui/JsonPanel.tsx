import { JsonExplorer } from './JsonExplorer'

type JsonPanelProps = {
  value: unknown
  emptyMessage: string
  defaultExpanded?: string[]
  collapsed?: boolean | number
}

export function JsonPanel({
  value,
  emptyMessage,
  defaultExpanded,
  collapsed,
}: JsonPanelProps) {
  if (value == null) {
    return <p className="app-empty-text">{emptyMessage}</p>
  }

  return (
    <div className="app-json-panel">
      <JsonExplorer
        data={value}
        collapsed={collapsed}
        defaultExpanded={defaultExpanded}
      />
    </div>
  )
}
