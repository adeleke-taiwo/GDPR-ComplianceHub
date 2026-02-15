import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { createRetentionSchema } from '@/lib/schemas/retention';
import { createAuditLog } from '@/lib/audit';
import * as retentionService from '@/server-services/retention.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { searchParams } = new URL(req.url);
  const result = await retentionService.getAll({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  });
  return NextResponse.json({ success: true, ...result });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'dpo');
  const body = await req.json();
  const validated = validateBody(createRetentionSchema, body);
  const policy = await retentionService.create(user.userId, validated);

  await createAuditLog({ actorId: user.userId, action: 'CREATE_RETENTION_POLICY', resource: 'retention_policy', resourceId: policy.id });
  return NextResponse.json({ success: true, data: policy, message: 'Retention policy created' }, { status: 201 });
});
