import { useId } from 'react'

type SearchInputProps = {
  label: string
  name: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}

export function SearchInput({
  label,
  name,
  placeholder,
  value,
  onChange,
}: SearchInputProps) {
  const inputId = useId()

  return (
    <div className="app-search">
      <label className="app-visually-hidden" htmlFor={inputId}>
        {label}
      </label>
      <div className="app-search__field">
        <span className="app-search__icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" fill="none">
            <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </span>
        <input
          className="app-search__input"
          id={inputId}
          type="search"
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>
    </div>
  )
}
