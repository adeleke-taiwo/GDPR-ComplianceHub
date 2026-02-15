import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  consents: z.object({
    marketing: z.boolean().optional().default(false),
    analytics: z.boolean().optional().default(false),
    third_party_sharing: z.boolean().optional().default(false),
    profiling: z.boolean().optional().default(false),
    newsletter: z.boolean().optional().default(false),
  }).optional().default({}),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});
