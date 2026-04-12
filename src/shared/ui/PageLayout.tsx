import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

type PageLayoutProps = {
  children: ReactNode
  className?: string
  shellClassName?: string
  labelledBy?: string
}

export function PageLayout({
  children,
  className,
  shellClassName,
  labelledBy,
}: PageLayoutProps) {
  return (
    <main className={cn('app-page', className)}>
      <section className={cn('app-shell', shellClassName)} aria-labelledby={labelledBy}>
        {children}
      </section>
    </main>
  )
}
