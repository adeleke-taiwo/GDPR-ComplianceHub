import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import * as breachService from '@/server-services/breach.service';

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  const { id } = await params;
  const notification = await breachService.acknowledgeNotification(id, user.userId);

  await createAuditLog({ actorId: user.userId, action: 'ACKNOWLEDGE_BREACH', resource: 'breach_notification', resourceId: id });
  return NextResponse.json({ success: true, data: notification, message: 'Breach notification acknowledged' });
});
