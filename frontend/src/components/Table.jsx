export default function Table({ columns, children }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-ink-200 bg-white shadow-card">
      <table className="min-w-full divide-y divide-ink-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                onClick={col.onSort}
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-600 ${
                  col.onSort ? 'cursor-pointer select-none hover:text-ink-900' : ''
                }`}
              >
                <span className="inline-flex items-center gap-1">
                  {col.label}
                  {col.sortIndicator}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">{children}</tbody>
      </table>
    </div>
  )
}
