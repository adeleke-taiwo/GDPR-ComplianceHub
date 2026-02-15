import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { createCookieSchema } from '@/lib/schemas/cookie';
import { createAuditLog } from '@/lib/audit';
import * as cookieService from '@/server-services/cookie.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { searchParams } = new URL(req.url);
  const result = await cookieService.getAllCookies({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '50'),
    category: searchParams.get('category') || undefined,
  });
  return NextResponse.json({ success: true, ...result });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const body = await req.json();
  const validated = validateBody(createCookieSchema, body);
  const cookie = await cookieService.createCookie(validated);

  await createAuditLog({ actorId: user.userId, action: 'CREATE_COOKIE', resource: 'cookie', resourceId: cookie.id });
  return NextResponse.json({ success: true, data: cookie, message: 'Cookie created successfully' }, { status: 201 });
});
