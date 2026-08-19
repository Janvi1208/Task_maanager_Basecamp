const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent-dark disabled:bg-accent/50',
  secondary: 'bg-white text-ink-800 border border-ink-200 hover:bg-slate-100 disabled:opacity-50',
  ghost: 'bg-transparent text-ink-700 hover:bg-slate-100 disabled:opacity-50',
  danger: 'bg-rose text-white hover:bg-rose/90 disabled:bg-rose/50',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon,
  loading = false,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium font-body transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  )
}
