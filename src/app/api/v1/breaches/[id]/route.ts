import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { updateBreachSchema } from '@/lib/schemas/breach';
import { createAuditLog } from '@/lib/audit';
import * as breachService from '@/server-services/breach.service';

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'dpo');
  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(updateBreachSchema, body);
  const breach = await breachService.update(id, validated);

  await createAuditLog({ actorId: user.userId, action: 'UPDATE_BREACH', resource: 'breach', resourceId: id });
  return NextResponse.json({ success: true, data: breach, message: 'Breach notification updated successfully' });
});
