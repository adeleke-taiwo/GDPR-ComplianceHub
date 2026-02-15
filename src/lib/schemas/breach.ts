import { z } from 'zod';

export const createBreachSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required').max(2000),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  affectedDataTypes: z.string().min(1, 'Affected data types required').max(500),
  affectedUserCount: z.number().int().min(0).optional().default(0),
  discoveredAt: z.string().datetime().optional(),
  reportedToAuthorityAt: z.string().datetime().optional(),
});

export const updateBreachSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(2000).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  affectedDataTypes: z.string().max(500).optional(),
  affectedUserCount: z.number().int().min(0).optional(),
  status: z.enum(['detected', 'investigating', 'contained', 'resolved']).optional(),
  reportedToAuthorityAt: z.string().datetime().optional(),
});
