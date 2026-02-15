import api from './api';

export const dataRequestService = {
  create: (type: 'access' | 'erasure') =>
    api.post('/data-requests', { type }),

  getMyRequests: (page = 1, limit = 20) =>
    api.get(`/data-requests/my?page=${page}&limit=${limit}`),

  getAll: (params?: { status?: string; type?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    query.set('page', String(params?.page || 1));
    query.set('limit', String(params?.limit || 20));
    return api.get(`/data-requests?${query}`);
  },

  process: (id: string, data: { status: string; notes?: string }) =>
    api.patch(`/data-requests/${id}/process`, data),

  exportMyData: () => api.get('/data-export/my'),
};
