import api from './api';

export const authService = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    consents?: Record<string, boolean>;
  }) => api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  refresh: () => api.post('/auth/refresh'),

  logout: () => api.post('/auth/logout'),

  getMe: () => api.get('/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
};
