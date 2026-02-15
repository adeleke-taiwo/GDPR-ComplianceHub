import api from './api';

export const userService = {
  getAll: (params?: { search?: string; role?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    query.set('page', String(params?.page || 1));
    query.set('limit', String(params?.limit || 20));
    return api.get(`/users?${query}`);
  },

  getById: (id: string) => api.get(`/users/${id}`),

  update: (id: string, data: { firstName?: string; lastName?: string; email?: string; isActive?: boolean }) =>
    api.patch(`/users/${id}`, data),

  changeRole: (id: string, role: string) =>
    api.patch(`/users/${id}/role`, { role }),

  deactivate: (id: string) => api.delete(`/users/${id}`),
};
