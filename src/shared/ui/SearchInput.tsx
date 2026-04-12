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
  )
}
