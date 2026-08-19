export default function Select({ label, id, error, options, placeholder, className = '', ...props }) {
  const inputId = id || props.name
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full rounded-lg border px-3 py-2 text-sm font-body text-ink-900 bg-white transition-colors ${
          error ? 'border-rose' : 'border-ink-200 hover:border-ink-600/40'
        }`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-rose">{error}</p>}
    </div>
  )
}
