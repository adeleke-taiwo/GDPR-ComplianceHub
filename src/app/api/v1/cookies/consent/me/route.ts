import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import * as cookieService from '@/server-services/cookie.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  const consents = await cookieService.getUserConsent(user.userId);
  return NextResponse.json({ success: true, data: consents });
});
