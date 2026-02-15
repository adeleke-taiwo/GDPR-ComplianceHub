import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { processDataRequestSchema } from '@/lib/schemas/data-request';
import { createAuditLog } from '@/lib/audit';
import * as dataRequestService from '@/server-services/dataRequest.service';

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');

  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(processDataRequestSchema, body);

  const request = await dataRequestService.processRequest(id, user.userId, validated);

  await createAuditLog({
    actorId: user.userId,
    action: 'PROCESS_DATA_REQUEST',
    resource: 'data_request',
    resourceId: id,
  });

  return NextResponse.json({ success: true, data: request, message: 'Data request updated successfully' });
});
