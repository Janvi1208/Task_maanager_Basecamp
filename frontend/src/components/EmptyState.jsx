export default function EmptyState({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-12 w-12 rounded-full bg-slate-100 border border-ink-200 flex items-center justify-center text-ink-600 font-mono text-lg mb-4">
        ∅
      </div>
      <h3 className="font-display font-semibold text-ink-900">{title}</h3>
      {message && <p className="text-sm text-ink-600 mt-1 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
