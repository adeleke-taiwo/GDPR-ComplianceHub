import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';

export const POST = apiHandler(async (req: NextRequest) => {
  await authenticate(req);

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.set('refreshToken', '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
});
