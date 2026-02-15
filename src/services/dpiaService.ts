import api from './api';

export const dpiaService = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    query.set('page', String(params?.page || 1));
    query.set('limit', String(params?.limit || 20));
    return api.get(`/dpias?${query}`);
  },

  getById: (id: string) => api.get(`/dpias/${id}`),

  create: (data: {
    title: string;
    description: string;
    processingRecordId?: string;
    dataTypes: string;
    dataSubjects: string;
    processingPurpose: string;
    legalBasis: string;
    necessityJustification: string;
    riskLevel?: string;
    status?: string;
  }) => api.post('/dpias', data),

  update: (id: string, data: Partial<{
    title: string;
    description: string;
    processingRecordId: string;
    dataTypes: string;
    dataSubjects: string;
    processingPurpose: string;
    legalBasis: string;
    necessityJustification: string;
    riskLevel: string;
    status: string;
    reviewedById: string;
    approvedById: string;
    reviewNotes: string;
  }>) => api.patch(`/dpias/${id}`, data),

  remove: (id: string) => api.delete(`/dpias/${id}`),

  addRisk: (dpiaId: string, data: {
    title: string;
    description: string;
    riskLevel: string;
    likelihood: number;
    impact: number;
    affectedRights?: string;
  }) => api.post(`/dpias/${dpiaId}/risks`, data),

  updateRisk: (riskId: string, data: Partial<{
    title: string;
    description: string;
    riskLevel: string;
    likelihood: number;
    impact: number;
    affectedRights: string;
  }>) => api.patch(`/dpias/risks/${riskId}`, data),

  deleteRisk: (riskId: string) => api.delete(`/dpias/risks/${riskId}`),

  addMitigation: (dpiaId: string, data: {
    title: string;
    description: string;
    riskId?: string;
    status?: string;
    responsiblePerson?: string;
    deadline?: string;
    notes?: string;
  }) => api.post(`/dpias/${dpiaId}/mitigations`, data),

  updateMitigation: (mitigationId: string, data: Partial<{
    title: string;
    description: string;
    riskId: string;
    status: string;
    responsiblePerson: string;
    deadline: string;
    completedAt: string;
    notes: string;
  }>) => api.patch(`/dpias/mitigations/${mitigationId}`, data),

  deleteMitigation: (mitigationId: string) => api.delete(`/dpias/mitigations/${mitigationId}`),
};
