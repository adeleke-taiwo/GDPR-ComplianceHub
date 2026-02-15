import { z } from 'zod';

export const createProcessingRecordSchema = z.object({
  purpose: z.string().min(1, 'Purpose is required').max(255),
  dataCategories: z.string().min(1, 'Data categories required').max(500),
  legalBasis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interest', 'public_task', 'legitimate_interest']),
  recipientCategories: z.string().max(500).optional(),
  retentionPeriodDays: z.number().int().min(1).max(36500),
  isActive: z.boolean().optional().default(true),
});

export const updateProcessingRecordSchema = z.object({
  purpose: z.string().min(1).max(255).optional(),
  dataCategories: z.string().min(1).max(500).optional(),
  legalBasis: z.enum(['consent', 'contract', 'legal_obligation', 'vital_interest', 'public_task', 'legitimate_interest']).optional(),
  recipientCategories: z.string().max(500).optional(),
  retentionPeriodDays: z.number().int().min(1).max(36500).optional(),
  isActive: z.boolean().optional(),
});
