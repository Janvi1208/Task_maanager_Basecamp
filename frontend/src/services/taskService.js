import { api } from './api'

export const taskService = {
  list: ({ status, priority, assignee, search, sortBy, sortDir, page, limit }) =>
    api.get('/tasks', {
      status,
      priority,
      assignee,
      search,
      sort_by: sortBy,
      sort_dir: sortDir,
      page,
      limit,
    }),

  get: (id) => api.get(`/tasks/${id}`),

  create: (payload) => api.post('/tasks', payload),

  update: (id, payload) => api.put(`/tasks/${id}`, payload),

  remove: (id) => api.del(`/tasks/${id}`),

  addComment: (taskId, payload) => api.post(`/tasks/${taskId}/comments`, payload),
}
