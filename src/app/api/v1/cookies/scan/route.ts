import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { cookieScanSchema } from '@/lib/schemas/cookie';
import { createAuditLog } from '@/lib/audit';
import * as cookieService from '@/server-services/cookie.service';

export const POST = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const body = await req.json();
  const validated = validateBody(cookieScanSchema, body);
  const scan = await cookieService.scanDomain(validated.domain, user.userId);

  await createAuditLog({ actorId: user.userId, action: 'SCAN_COOKIES', resource: 'cookie_scan', resourceId: scan.id });
  return NextResponse.json({ success: true, data: scan, message: 'Domain scan completed successfully' }, { status: 201 });
});
