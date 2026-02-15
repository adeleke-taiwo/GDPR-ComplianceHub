import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { validateBody } from '@/lib/validate';
import { cookieConsentSchema } from '@/lib/schemas/cookie';
import * as cookieService from '@/server-services/cookie.service';

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validated = validateBody(cookieConsentSchema, body);
  const result = await cookieService.recordConsent({
    ...validated,
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || undefined,
  });
  return NextResponse.json({ success: true, ...result }, { status: 201 });
});
