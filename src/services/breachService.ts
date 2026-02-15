import api from './api';

export const breachService = {
  getAll: (params?: { status?: string; severity?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.severity) query.set('severity', params.severity);
    query.set('page', String(params?.page || 1));
    query.set('limit', String(params?.limit || 20));
    return api.get(`/breaches?${query}`);
  },

  create: (data: {
    title: string;
    description: string;
    severity: string;
    affectedDataTypes: string;
    affectedUserCount?: number;
  }) => api.post('/breaches', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/breaches/${id}`, data),

  notifyUsers: (id: string) => api.post(`/breaches/${id}/notify-users`),

  getMyNotifications: (page = 1, limit = 20) =>
    api.get(`/breaches/my-notifications?page=${page}&limit=${limit}`),

  acknowledge: (id: string) =>
    api.patch(`/breaches/notifications/${id}/acknowledge`),
};
