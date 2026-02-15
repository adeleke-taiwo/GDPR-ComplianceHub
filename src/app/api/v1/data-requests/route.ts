import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { createDataRequestSchema } from '@/lib/schemas/data-request';
import { createAuditLog } from '@/lib/audit';
import * as dataRequestService from '@/server-services/dataRequest.service';

export const POST = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  const body = await req.json();
  const validated = validateBody(createDataRequestSchema, body);

  const request = await dataRequestService.createRequest(user.userId, validated);

  await createAuditLog({
    actorId: user.userId,
    action: 'CREATE_DATA_REQUEST',
    resource: 'data_request',
    resourceId: request.id,
  });

  return NextResponse.json({ success: true, data: request, message: 'Data request submitted successfully' }, { status: 201 });
});

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { searchParams } = new URL(req.url);
  const result = await dataRequestService.getAllRequests({
    status: searchParams.get('status') || undefined,
    type: searchParams.get('type') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  });
  return NextResponse.json({ success: true, ...result });
});
