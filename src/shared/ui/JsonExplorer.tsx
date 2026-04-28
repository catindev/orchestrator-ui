import type { CSSProperties } from 'react'
import JsonView, { type ShouldExpandNodeInitially } from '@uiw/react-json-view'

type JsonExplorerProps = {
  data: unknown
  defaultExpanded?: string[]
  collapsed?: boolean | number
  className?: string
}

const JSON_EXPLORER_THEME = {
  '--w-rjv-background-color': 'transparent',
  '--w-rjv-font-family': 'var(--font-mono)',
  '--w-rjv-color': 'var(--text-medium)',
  '--w-rjv-line-color': 'rgba(29, 31, 53, 0.08)',
  '--w-rjv-arrow-color': 'var(--text-faint)',
  '--w-rjv-curlybraces-color': 'var(--text-faint)',
  '--w-rjv-brackets-color': 'var(--text-faint)',
  '--w-rjv-colon-color': 'var(--text-faint)',
  '--w-rjv-quotes-color': 'var(--text-faint)',
  '--w-rjv-quotes-string-color': 'var(--text-medium)',
  '--w-rjv-ellipsis-color': 'var(--text-faint)',
  '--w-rjv-type-string-color': 'var(--accent-color)',
  '--w-rjv-type-int-color': '#2563eb',
  '--w-rjv-type-float-color': '#2563eb',
  '--w-rjv-type-bigint-color': '#2563eb',
  '--w-rjv-type-boolean-color': '#7c3aed',
  '--w-rjv-type-date-color': '#0f766e',
  '--w-rjv-type-url-color': '#0369a1',
  '--w-rjv-type-null-color': 'var(--text-faint)',
  '--w-rjv-type-nan-color': '#b45309',
  '--w-rjv-type-undefined-color': 'var(--text-faint)',
  '--w-rjv-key-string': 'var(--text-strong)',
  '--w-rjv-key-number': 'var(--text-strong)',
} as CSSProperties

function shouldExpandPath(
  defaultExpanded: string[],
): ShouldExpandNodeInitially<object> {
  return (_isExpanded, { keys }) => {
    if (keys.length === 0) {
      return true
    }

    const path = keys.join('.')

    if (
      defaultExpanded.some(
        (expectedPath) =>
          path === expectedPath ||
          path.startsWith(`${expectedPath}.`) ||
          expectedPath.startsWith(`${path}.`),
      )
    ) {
      return true
    }

    return false
  }
}

export function JsonExplorer({
  data,
  defaultExpanded = [],
  collapsed = 2,
  className,
}: JsonExplorerProps) {
  if (data == null) {
    return <p className="app-empty-text">Нет данных для отображения.</p>
  }

  return (
    <div className={className}>
      <JsonView
        value={data as object}
        collapsed={collapsed}
        shouldExpandNodeInitially={
          defaultExpanded.length > 0
            ? shouldExpandPath(defaultExpanded)
            : undefined
        }
        displayDataTypes={false}
        shortenTextAfterLength={80}
        enableClipboard
        style={JSON_EXPLORER_THEME}
      />
    </div>
  )
}
