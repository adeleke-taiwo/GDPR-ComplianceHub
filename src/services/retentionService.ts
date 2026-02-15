import api from './api';

export const retentionService = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/retention-policies?page=${page}&limit=${limit}`),

  create: (data: {
    dataCategory: string;
    retentionPeriodDays: number;
    action: string;
  }) => api.post('/retention-policies', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/retention-policies/${id}`, data),

  remove: (id: string) => api.delete(`/retention-policies/${id}`),
};
