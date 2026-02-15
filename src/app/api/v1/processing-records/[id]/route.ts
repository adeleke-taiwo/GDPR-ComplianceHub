import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { updateProcessingRecordSchema } from '@/lib/schemas/processing-record';
import { createAuditLog } from '@/lib/audit';
import * as processingRecordService from '@/server-services/processingRecord.service';

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(updateProcessingRecordSchema, body);
  const record = await processingRecordService.update(id, validated);

  await createAuditLog({ actorId: user.userId, action: 'UPDATE_PROCESSING_RECORD', resource: 'processing_record', resourceId: id });
  return NextResponse.json({ success: true, data: record, message: 'Processing record updated' });
});

export const DELETE = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'dpo');
  const { id } = await params;
  const result = await processingRecordService.remove(id);

  await createAuditLog({ actorId: user.userId, action: 'DELETE_PROCESSING_RECORD', resource: 'processing_record', resourceId: id });
  return NextResponse.json({ success: true, ...result });
});
