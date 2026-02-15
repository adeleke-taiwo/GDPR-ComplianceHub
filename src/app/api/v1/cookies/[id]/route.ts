import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { updateCookieSchema } from '@/lib/schemas/cookie';
import { createAuditLog } from '@/lib/audit';
import * as cookieService from '@/server-services/cookie.service';

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(updateCookieSchema, body);
  const cookie = await cookieService.updateCookie(id, validated);

  await createAuditLog({ actorId: user.userId, action: 'UPDATE_COOKIE', resource: 'cookie', resourceId: id });
  return NextResponse.json({ success: true, data: cookie, message: 'Cookie updated successfully' });
});

export const DELETE = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'dpo');
  const { id } = await params;
  const result = await cookieService.deleteCookie(id);

  await createAuditLog({ actorId: user.userId, action: 'DELETE_COOKIE', resource: 'cookie', resourceId: id });
  return NextResponse.json({ success: true, ...result });
});
