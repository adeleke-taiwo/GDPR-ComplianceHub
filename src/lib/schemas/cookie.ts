import { z } from 'zod';

export const createCookieSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(['necessary', 'analytics', 'marketing', 'preferences', 'functional']),
  domain: z.string().min(1).max(255),
  path: z.string().optional().default('/'),
  description: z.string().min(1),
  purpose: z.string().min(1),
  duration: z.string().min(1).max(100),
  isFirstParty: z.boolean().optional().default(true),
  vendorId: z.string().uuid().optional(),
  isActive: z.boolean().optional().default(true),
});

export const updateCookieSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.enum(['necessary', 'analytics', 'marketing', 'preferences', 'functional']).optional(),
  domain: z.string().min(1).max(255).optional(),
  path: z.string().optional(),
  description: z.string().min(1).optional(),
  purpose: z.string().min(1).optional(),
  duration: z.string().min(1).max(100).optional(),
  isFirstParty: z.boolean().optional(),
  vendorId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});

export const cookieConsentSchema = z.object({
  preferences: z.record(z.boolean()),
  sessionId: z.string().uuid().optional(),
});

export const cookieScanSchema = z.object({
  domain: z.string().url(),
});
