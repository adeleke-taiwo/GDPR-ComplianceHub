import { z } from 'zod';

export const createVendorSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  website: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(50).optional(),
  address: z.string().optional(),
  country: z.string().max(100).optional(),
  status: z.enum(['active', 'inactive', 'under_review', 'terminated']).optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  isSubProcessor: z.boolean().optional().default(false),
  parentVendorId: z.string().uuid().optional(),
  dataProcessingAgreement: z.string().optional(),
  dpaSignedAt: z.string().datetime().optional(),
  contractStartDate: z.string().datetime().optional(),
  contractEndDate: z.string().datetime().optional(),
  lastAuditDate: z.string().datetime().optional(),
  nextAuditDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateVendorSchema = createVendorSchema.partial();

export const linkProcessingRecordSchema = z.object({
  processingRecordId: z.string().uuid(),
  role: z.string().max(100).optional().default('processor'),
  description: z.string().optional(),
});

export const riskAssessmentSchema = z.object({
  vendorId: z.string().uuid(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']),
  dataAccessScope: z.string().min(1),
  securityMeasures: z.string().min(1),
  complianceCertifications: z.string().optional(),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  nextReviewDate: z.string().datetime().optional(),
});
