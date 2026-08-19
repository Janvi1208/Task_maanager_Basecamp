import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Table from '../components/Table'
import Pagination from '../components/Pagination'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import Modal from '../components/Modal'
import TaskForm from '../components/TaskForm'
import LoadingState from '../components/LoadingState'
import ErrorState from '../components/ErrorState'
import EmptyState from '../components/EmptyState'
import { taskService } from '../services/taskService'
import { userService } from '../services/userService'
import { useDebounce } from '../hooks/useDebounce'
import { useToast } from '../hooks/useToast.jsx'
import { formatDate } from '../utils/format'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
]
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

export default function TaskList() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [params, setParams] = useSearchParams()

  const [searchInput, setSearchInput] = useState(params.get('search') || '')
  const debouncedSearch = useDebounce(searchInput, 350)

  const status = params.get('status') || ''
  const priority = params.get('priority') || ''
  const assignee = params.get('assignee') || ''
  const sortBy = params.get('sort_by') || 'created_at'
  const sortDir = params.get('sort_dir') || 'desc'
  const page = Number(params.get('page') || 1)

  const [data, setData] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const updateParams = (patch) => {
    const next = new URLSearchParams(params)
    Object.entries(patch).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    if (!('page' in patch)) next.set('page', '1')
    setParams(next)
  }

  useEffect(() => {
    updateParams({ search: debouncedSearch })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  useEffect(() => {
    userService.list().then(setUsers).catch(() => {})
  }, [])

  const load = () => {
    setLoading(true)
    setError(null)
    taskService
      .list({ status, priority, assignee, search: params.get('search') || '', sortBy, sortDir, page, limit: 10 })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(load, [status, priority, assignee, sortBy, sortDir, page, params])

  const toggleSort = (field) => {
    if (sortBy === field) {
      updateParams({ sort_by: field, sort_dir: sortDir === 'asc' ? 'desc' : 'asc' })
    } else {
      updateParams({ sort_by: field, sort_dir: 'asc' })
    }
  }

  const sortIndicator = (field) => (sortBy === field ? (sortDir === 'asc' ? '↑' : '↓') : '')

  const handleCreate = async (payload) => {
    setSubmitting(true)
    try {
      await taskService.create(payload)
      notify('Task created.')
      setCreateOpen(false)
      load()
    } catch (err) {
      notify(err.message, { type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { key: 'title', label: 'Task', onSort: () => toggleSort('title'), sortIndicator: sortIndicator('title') },
    { key: 'assignee', label: 'Assignee' },
    { key: 'priority', label: 'Priority', onSort: () => toggleSort('priority'), sortIndicator: sortIndicator('priority') },
    { key: 'status', label: 'Status', onSort: () => toggleSort('status'), sortIndicator: sortIndicator('status') },
    { key: 'due_date', label: 'Due', onSort: () => toggleSort('due_date'), sortIndicator: sortIndicator('due_date') },
    { key: 'created_at', label: 'Created', onSort: () => toggleSort('created_at'), sortIndicator: sortIndicator('created_at') },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ink-900">Tasks</h1>
          <p className="text-sm text-ink-600 mt-1">Search, filter, and manage every task in one place.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>+ New task</Button>
      </div>

      <div className="bg-white border border-ink-200 rounded-xl shadow-card p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Input
          placeholder="Search tasks…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search tasks"
        />
        <Select
          placeholder="All statuses"
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => updateParams({ status: e.target.value })}
          aria-label="Filter by status"
        />
        <Select
          placeholder="All priorities"
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={(e) => updateParams({ priority: e.target.value })}
          aria-label="Filter by priority"
        />
        <Select
          placeholder="All assignees"
          options={users.map((u) => ({ value: u.id, label: u.name }))}
          value={assignee}
          onChange={(e) => updateParams({ assignee: e.target.value })}
          aria-label="Filter by assignee"
        />
      </div>

      {loading && <LoadingState label="Loading tasks…" />}
      {!loading && error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && data && data.items.length === 0 && (
        <EmptyState
          title="No tasks match your filters"
          message="Try clearing a filter, or create a new task to get started."
          action={<Button onClick={() => setCreateOpen(true)}>+ New task</Button>}
        />
      )}
      {!loading && !error && data && data.items.length > 0 && (
        <>
          <Table columns={columns}>
            {data.items.map((task) => (
              <tr
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="hover:bg-slate-50 cursor-pointer"
              >
                <td className="px-4 py-3 max-w-xs">
                  <Link
                    to={`/tasks/${task.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm font-medium text-ink-900 hover:text-accent-dark truncate block"
                  >
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-ink-700">{task.assignee_name || 'Unassigned'}</td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={task.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-4 py-3 text-sm font-mono text-ink-700">
                  {formatDate(task.due_date)}
                  {task.is_overdue && <span className="text-rose ml-1">●</span>}
                </td>
                <td className="px-4 py-3 text-sm font-mono text-ink-600">{formatDate(task.created_at)}</td>
              </tr>
            ))}
          </Table>
          <Pagination
            page={data.page}
            totalPages={data.total_pages}
            total={data.total}
            limit={data.limit}
            onPageChange={(p) => updateParams({ page: String(p) })}
          />
        </>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create task" size="lg">
        <TaskForm users={users} onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} submitting={submitting} />
      </Modal>
    </div>
  )
}
