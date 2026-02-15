import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import * as authService from '@/server-services/auth.service';

export const POST = apiHandler(async (req: NextRequest) => {
  const refreshToken = req.cookies.get('refreshToken')?.value ?? '';
  const result = await authService.refreshAccessToken(refreshToken);

  const response = NextResponse.json({
    success: true,
    data: { user: result.user, accessToken: result.accessToken },
  });

  response.cookies.set('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  return response;
});
