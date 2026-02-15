import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { validateBody } from '@/lib/validate';
import { registerSchema } from '@/lib/schemas/auth';
import { createAuditLog, sanitizeBody } from '@/lib/audit';
import * as authService from '@/server-services/auth.service';

export const POST = apiHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validated = validateBody(registerSchema, body);

  const result = await authService.register({
    ...validated,
    ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
    userAgent: req.headers.get('user-agent') || undefined,
  });

  const response = NextResponse.json(
    { success: true, data: { user: result.user, accessToken: result.accessToken }, message: 'Registration successful' },
    { status: 201 }
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
    action: 'REGISTER',
    resource: 'user',
    resourceId: result.user.id,
    details: sanitizeBody({ method: 'POST', path: '/api/v1/auth/register', body: { ...validated, password: '[REDACTED]' } }),
  });

  return response;
});
