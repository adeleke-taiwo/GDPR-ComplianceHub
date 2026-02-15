import { z } from 'zod';

export const createDPIASchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  processingRecordId: z.string().uuid().optional(),
  dataTypes: z.string().min(1),
  dataSubjects: z.string().min(1),
  processingPurpose: z.string().min(1),
  legalBasis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interest', 'public_task', 'legitimate_interest']),
  necessityJustification: z.string().min(1),
  riskLevel: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
  status: z.enum(['draft', 'in_review', 'approved', 'rejected', 'requires_revision']).optional(),
});

export const updateDPIASchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  processingRecordId: z.string().uuid().optional(),
  dataTypes: z.string().min(1).optional(),
  dataSubjects: z.string().min(1).optional(),
  processingPurpose: z.string().min(1).optional(),
  legalBasis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interest', 'public_task', 'legitimate_interest']).optional(),
  necessityJustification: z.string().min(1).optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'very_high']).optional(),
  status: z.enum(['draft', 'in_review', 'approved', 'rejected', 'requires_revision']).optional(),
  reviewedById: z.string().uuid().optional(),
  approvedById: z.string().uuid().optional(),
  reviewNotes: z.string().optional(),
});

export const dpiaRiskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  riskLevel: z.enum(['low', 'medium', 'high', 'very_high']),
  likelihood: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  affectedRights: z.string().optional(),
});

export const updateDpiaRiskSchema = dpiaRiskSchema.partial();

export const dpiaMitigationSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  riskId: z.string().uuid().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'not_applicable']).optional(),
  responsiblePerson: z.string().max(255).optional(),
  deadline: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const updateDpiaMitigationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  riskId: z.string().uuid().optional(),
  status: z.enum(['planned', 'in_progress', 'completed', 'not_applicable']).optional(),
  responsiblePerson: z.string().max(255).optional(),
  deadline: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});
