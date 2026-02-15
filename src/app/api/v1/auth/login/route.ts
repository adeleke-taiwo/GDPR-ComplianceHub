import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { validateBody } from '@/lib/validate';
import { loginSchema } from '@/lib/schemas/auth';
import { createAuditLog } from '@/lib/audit';
import * as authService from '@/server-services/auth.service';

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const ipAddress = req.headers.get('x-forwarded-for') || undefined;
  const validated = validateBody(loginSchema, body);

  let result;
  try {
    result = await authService.login(validated);
  } catch (error) {
    // Log failed login attempt
    await createAuditLog({
      actorId: null,
      action: 'LOGIN_FAILED',
      resource: 'auth',
      details: { email: validated.email },
      ipAddress,
    });
    throw error;
  }

  const response = NextResponse.json(
    { success: true, data: { user: result.user, accessToken: result.accessToken }, message: 'Login successful' },
  );

  response.cookies.set('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });

  await createAuditLog({
    actorId: result.user.id,
    action: 'LOGIN',
    resource: 'user',
    resourceId: result.user.id,
    ipAddress,
  });

  return response;
});
