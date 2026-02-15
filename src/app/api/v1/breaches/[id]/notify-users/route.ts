import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { createAuditLog } from '@/lib/audit';
import * as breachService from '@/server-services/breach.service';

export const POST = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'dpo');
  const { id } = await params;
  const result = await breachService.notifyUsers(id);

  await createAuditLog({ actorId: user.userId, action: 'NOTIFY_BREACH_USERS', resource: 'breach', resourceId: id });
  return NextResponse.json({ success: true, data: result.breach, message: `${result.notifiedCount} users notified successfully` });
});
