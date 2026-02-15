import { z } from 'zod';

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

export const changeRoleSchema = z.object({
  role: z.enum(['user', 'admin', 'dpo']),
});
