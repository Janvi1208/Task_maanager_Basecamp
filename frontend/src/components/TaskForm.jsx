import { useState } from 'react'
import Input from './Input'
import Textarea from './Textarea'
import Select from './Select'
import Button from './Button'
import { toDateInputValue } from '../utils/format'

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

export default function TaskForm({ initialTask, users, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    status: initialTask?.status || 'pending',
    priority: initialTask?.priority || 'medium',
    assigned_to: initialTask?.assigned_to || '',
    due_date: toDateInputValue(initialTask?.due_date),
  })
  const [errors, setErrors] = useState({})

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Title is required.'
    else if (form.title.length > 255) next.title = 'Title must be under 255 characters.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} id="task-form" className="space-y-4">
      <Input
        label="Task name"
        name="title"
        value={form.title}
        onChange={update('title')}
        error={errors.title}
        placeholder="e.g. Fix pagination bug on tasks table"
        maxLength={255}
        autoFocus
      />
      <Textarea
        label="Description"
        name="description"
        rows={4}
        value={form.description}
        onChange={update('description')}
        placeholder="Add context, acceptance criteria, or links…"
      />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Status" options={STATUS_OPTIONS} value={form.status} onChange={update('status')} />
        <Select label="Priority" options={PRIORITY_OPTIONS} value={form.priority} onChange={update('priority')} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Assignee"
          placeholder="Unassigned"
          options={users.map((u) => ({ value: u.id, label: u.name }))}
          value={form.assigned_to}
          onChange={update('assigned_to')}
        />
        <Input label="Due date" type="date" name="due_date" value={form.due_date} onChange={update('due_date')} />
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          {initialTask ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  )
}
