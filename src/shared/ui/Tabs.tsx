import { cn } from '../lib/cn'

export type TabOption<T extends string> = {
  id: T
  label: string
}

type TabsProps<T extends string> = {
  activeTab: T
  tabs: TabOption<T>[]
  ariaLabel: string
  onChange: (tab: T) => void
}

export function Tabs<T extends string>({
  activeTab,
  tabs,
  ariaLabel,
  onChange,
}: TabsProps<T>) {
  return (
    <div className="app-tabs" role="tablist" aria-label={ariaLabel}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab

        return (
          <button
            key={tab.id}
            className={cn('app-tabs__tab', isActive && 'app-tabs__tab--active')}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
