import { PRIORITY_LABELS } from '../utils/format'

const STYLES = {
  low: 'text-ink-600',
  medium: 'text-accent-dark',
  high: 'text-amber',
  urgent: 'text-rose',
}

const ICONS = {
  low: '▽',
  medium: '◇',
  high: '△',
  urgent: '▲',
}

export default function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium font-mono ${STYLES[priority] || STYLES.medium}`}>
      <span aria-hidden="true">{ICONS[priority]}</span>
      {PRIORITY_LABELS[priority] || priority}
    </span>
  )
}
