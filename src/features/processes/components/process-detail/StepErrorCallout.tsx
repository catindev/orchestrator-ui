type StepErrorCalloutProps = {
  error: string
}

export function StepErrorCallout({ error }: StepErrorCalloutProps) {
  return (
    <p className="step-evidence__error">
      <code className="step-evidence__error-code">{error}</code>
    </p>
  )
}
