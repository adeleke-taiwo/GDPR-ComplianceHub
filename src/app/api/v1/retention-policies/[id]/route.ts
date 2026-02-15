import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { updateRetentionSchema } from '@/lib/schemas/retention';
import { createAuditLog } from '@/lib/audit';
import * as retentionService from '@/server-services/retention.service';

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'dpo');
  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(updateRetentionSchema, body);
  const policy = await retentionService.update(id, validated);

  await createAuditLog({ actorId: user.userId, action: 'UPDATE_RETENTION_POLICY', resource: 'retention_policy', resourceId: id });
  return NextResponse.json({ success: true, data: policy, message: 'Retention policy updated' });
});

export const DELETE = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'dpo');
  const { id } = await params;
  const result = await retentionService.remove(id);

  await createAuditLog({ actorId: user.userId, action: 'DELETE_RETENTION_POLICY', resource: 'retention_policy', resourceId: id });
  return NextResponse.json({ success: true, ...result });
});
