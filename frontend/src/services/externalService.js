import { api } from './api'

export const externalService = {
  getDailyTip: () => api.get('/external/daily-tip'),
}
