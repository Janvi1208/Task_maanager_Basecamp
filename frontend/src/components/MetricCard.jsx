const EDGE_COLORS = {
  ink: 'before:bg-ink-700',
  accent: 'before:bg-accent',
  amber: 'before:bg-amber',
  rose: 'before:bg-rose',
  emerald: 'before:bg-emerald-500',
}

/**
 * The dashboard's signature element: a metric card with a colored left
 * edge and the value set in monospace, like a status ticker / control
 * room readout — a deliberate nod to this being an internal ops tool
 * that people scan quickly for numbers, not a marketing surface.
 */
export default function MetricCard({ label, value, tone = 'ink', suffix }) {
  return (
    <div
      className={`relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-xl bg-white border border-ink-200 rounded-xl shadow-card pl-5 pr-4 py-4 ${EDGE_COLORS[tone]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-ink-600">{label}</p>
      <p className="mt-1 font-mono text-3xl font-medium text-ink-900">
        {value}
        {suffix && <span className="text-base text-ink-600 ml-1">{suffix}</span>}
      </p>
    </div>
  )
}
