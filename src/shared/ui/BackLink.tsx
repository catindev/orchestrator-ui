import { Link } from 'react-router-dom'
import backIcon from './icon-back.svg'

type BackLinkProps = {
  to: string
  label: string
}

export function BackLink({ to, label }: BackLinkProps) {
  return (
    <Link className="app-back-link" to={to}>
      <img
        alt=""
        aria-hidden="true"
        className="app-back-link__icon"
        src={backIcon}
      />
      <span>{label}</span>
    </Link>
  )
}
