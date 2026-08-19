import { STATUS_LABELS } from '../utils/format'

const STYLES = {
  pending: 'bg-slate-100 text-ink-700 border-ink-200',
  in_progress: 'bg-accent/10 text-accent-dark border-accent/30',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blocked: 'bg-rose/10 text-rose border-rose/30',
}

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STYLES[status] || STYLES.pending}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status] || status}
    </span>
  )
}
