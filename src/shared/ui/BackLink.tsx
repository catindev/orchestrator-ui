import { Link } from 'react-router-dom'

type BackLinkProps = {
  to: string
  label: string
}

export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link className="app-back-link" to={to}>
      {label}
    </Link>
  )
}
