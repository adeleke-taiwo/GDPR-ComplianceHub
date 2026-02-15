import api from './api';

export const auditService = {
  getLogs: (params?: {
    action?: string;
    resource?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.action) query.set('action', params.action);
    if (params?.resource) query.set('resource', params.resource);
    if (params?.actorId) query.set('actorId', params.actorId);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    query.set('page', String(params?.page || 1));
    query.set('limit', String(params?.limit || 30));
    return api.get(`/audit-logs?${query}`);
  },
};
