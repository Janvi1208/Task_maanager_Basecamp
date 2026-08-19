import { api } from './api'

export const userService = {
  list: () => api.get('/users'),
  create: (payload) => api.post('/users', payload),
}
