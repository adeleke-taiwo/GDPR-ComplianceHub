import api from './api';

export const consentService = {
  getMyConsent: () => api.get('/consent/my'),

  updateConsent: (consents: Record<string, boolean>) =>
    api.patch('/consent/my', { consents }),

  getHistory: (page = 1, limit = 20) =>
    api.get(`/consent/history?page=${page}&limit=${limit}`),
};
