import { z } from 'zod';

export const updateConsentSchema = z.object({
  consents: z.object({
    marketing: z.boolean().optional(),
    analytics: z.boolean().optional(),
    third_party_sharing: z.boolean().optional(),
    profiling: z.boolean().optional(),
    newsletter: z.boolean().optional(),
  }),
});
