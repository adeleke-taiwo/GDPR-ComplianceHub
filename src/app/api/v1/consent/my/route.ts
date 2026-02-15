import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { validateBody } from '@/lib/validate';
import { updateConsentSchema } from '@/lib/schemas/consent';
import { createAuditLog } from '@/lib/audit';
import * as consentService from '@/server-services/consent.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  const consents = await consentService.getMyConsent(user.userId);
  return NextResponse.json({ success: true, data: consents });
});

export const PATCH = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  const body = await req.json();
  const validated = validateBody(updateConsentSchema, body);

  const consents = await consentService.updateConsent(user.userId, {
    consents: validated.consents,
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || undefined,
  });

  await createAuditLog({
    actorId: user.userId,
    action: 'UPDATE_CONSENT',
    resource: 'consent',
  });

  return NextResponse.json({ success: true, data: consents, message: 'Consent preferences updated successfully' });
});
