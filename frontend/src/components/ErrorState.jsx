import Button from './Button'

export default function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="h-12 w-12 rounded-full bg-rose/10 border border-rose/30 flex items-center justify-center text-rose font-mono text-lg mb-4">
        !
      </div>
      <h3 className="font-display font-semibold text-ink-900">{title}</h3>
      {message && <p className="text-sm text-ink-600 mt-1 max-w-sm">{message}</p>}
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
