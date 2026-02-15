import api from './api';

export const cookieService = {
  getAll: (params?: { category?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    query.set('page', String(params?.page || 1));
    query.set('limit', String(params?.limit || 50));
    return api.get(`/cookies?${query}`);
  },

  create: (data: {
    name: string;
    category: string;
    domain: string;
    path?: string;
    description: string;
    purpose: string;
    duration: string;
    isFirstParty?: boolean;
    vendorId?: string;
    isActive?: boolean;
  }) => api.post('/cookies', data),

  update: (id: string, data: Partial<{
    name: string;
    category: string;
    domain: string;
    path: string;
    description: string;
    purpose: string;
    duration: string;
    isFirstParty: boolean;
    vendorId: string;
    isActive: boolean;
  }>) => api.patch(`/cookies/${id}`, data),

  remove: (id: string) => api.delete(`/cookies/${id}`),

  recordConsent: (preferences: Record<string, boolean>, sessionId?: string) =>
    api.post('/cookies/consent', { preferences, sessionId }),

  getUserConsent: () => api.get('/cookies/consent/me'),

  scanDomain: (domain: string) => api.post('/cookies/scan', { domain }),
};
