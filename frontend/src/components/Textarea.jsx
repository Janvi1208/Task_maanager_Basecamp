export default function Textarea({ label, id, error, hint, className = '', ...props }) {
  const inputId = id || props.name
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`w-full rounded-lg border px-3 py-2 text-sm font-body text-ink-900 placeholder:text-ink-600/40 bg-white transition-colors ${
          error ? 'border-rose' : 'border-ink-200 hover:border-ink-600/40'
        }`}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-rose">{error}</p>}
      {!error && hint && <p className="mt-1 text-xs text-ink-600">{hint}</p>}
    </div>
  )
}
