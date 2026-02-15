import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import * as authService from '@/server-services/auth.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  const profile = await authService.getProfile(user.userId);
  return NextResponse.json({ success: true, data: profile });
});
