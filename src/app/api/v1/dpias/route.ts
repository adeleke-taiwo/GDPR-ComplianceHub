import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { createDPIASchema } from '@/lib/schemas/dpia';
import { createAuditLog } from '@/lib/audit';
import * as dpiaService from '@/server-services/dpia.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { searchParams } = new URL(req.url);
  const result = await dpiaService.getAll({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    status: searchParams.get('status') || undefined,
  });
  return NextResponse.json({ success: true, ...result });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const body = await req.json();
  const validated = validateBody(createDPIASchema, body);
  const dpia = await dpiaService.create(user.userId, validated);

  await createAuditLog({ actorId: user.userId, action: 'CREATE_DPIA', resource: 'dpia', resourceId: dpia.id });
  return NextResponse.json({ success: true, data: dpia, message: 'DPIA created successfully' }, { status: 201 });
});
