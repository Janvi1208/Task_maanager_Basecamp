export default function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-ink-600 gap-3">
      <span className="h-8 w-8 border-2 border-ink-200 border-t-accent rounded-full animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
