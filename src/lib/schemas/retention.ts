import { z } from 'zod';

export const createRetentionSchema = z.object({
  dataCategory: z.string().min(1, 'Data category is required').max(255),
  retentionPeriodDays: z.number().int().min(1).max(36500),
  action: z.enum(['anonymize', 'delete', 'archive']),
  isActive: z.boolean().optional().default(true),
});

export const updateRetentionSchema = z.object({
  dataCategory: z.string().min(1).max(255).optional(),
  retentionPeriodDays: z.number().int().min(1).max(36500).optional(),
  action: z.enum(['anonymize', 'delete', 'archive']).optional(),
  isActive: z.boolean().optional(),
});
