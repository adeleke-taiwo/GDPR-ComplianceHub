import api from './api';

export const vendorService = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    query.set('page', String(params?.page || 1));
    query.set('limit', String(params?.limit || 20));
    return api.get(`/vendors?${query}`);
  },

  getById: (id: string) => api.get(`/vendors/${id}`),

  create: (data: {
    name: string;
    description?: string;
    website?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    country?: string;
    status?: string;
    riskLevel?: string;
    isSubProcessor?: boolean;
    parentVendorId?: string;
    dataProcessingAgreement?: string;
    dpaSignedAt?: string;
    contractStartDate?: string;
    contractEndDate?: string;
    lastAuditDate?: string;
    nextAuditDate?: string;
    notes?: string;
  }) => api.post('/vendors', data),

  update: (id: string, data: Partial<{
    name: string;
    description: string;
    website: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    country: string;
    status: string;
    riskLevel: string;
    isSubProcessor: boolean;
    parentVendorId: string;
    dataProcessingAgreement: string;
    dpaSignedAt: string;
    contractStartDate: string;
    contractEndDate: string;
    lastAuditDate: string;
    nextAuditDate: string;
    notes: string;
  }>) => api.patch(`/vendors/${id}`, data),

  remove: (id: string) => api.delete(`/vendors/${id}`),

  linkProcessingRecord: (vendorId: string, processingRecordId: string, role?: string, description?: string) =>
    api.post(`/vendors/${vendorId}/processing-records`, { processingRecordId, role, description }),

  createRiskAssessment: (data: {
    vendorId: string;
    riskLevel: string;
    dataAccessScope: string;
    securityMeasures: string;
    complianceCertifications?: string;
    findings?: string;
    recommendations?: string;
    nextReviewDate?: string;
  }) => api.post('/vendors/risk-assessments', data),
};
