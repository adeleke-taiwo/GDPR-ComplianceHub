import { z } from 'zod';

export const createDataRequestSchema = z.object({
  type: z.enum(['access', 'erasure']),
});

export const processDataRequestSchema = z.object({
  status: z.enum(['processing', 'completed', 'rejected']),
  notes: z.string().max(1000).optional(),
});
