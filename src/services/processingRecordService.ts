import api from './api';

export const processingRecordService = {
  getAll: (page = 1, limit = 20) =>
    api.get(`/processing-records?page=${page}&limit=${limit}`),

  create: (data: {
    purpose: string;
    dataCategories: string;
    legalBasis: string;
    recipientCategories?: string;
    retentionPeriodDays: number;
  }) => api.post('/processing-records', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.patch(`/processing-records/${id}`, data),

  remove: (id: string) => api.delete(`/processing-records/${id}`),
};
