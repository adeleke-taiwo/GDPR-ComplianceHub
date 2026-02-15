import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { createProcessingRecordSchema } from '@/lib/schemas/processing-record';
import { createAuditLog } from '@/lib/audit';
import * as processingRecordService from '@/server-services/processingRecord.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { searchParams } = new URL(req.url);
  const result = await processingRecordService.getAll({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  });
  return NextResponse.json({ success: true, ...result });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const body = await req.json();
  const validated = validateBody(createProcessingRecordSchema, body);
  const record = await processingRecordService.create(user.userId, validated);

  await createAuditLog({ actorId: user.userId, action: 'CREATE_PROCESSING_RECORD', resource: 'processing_record', resourceId: record.id });
  return NextResponse.json({ success: true, data: record, message: 'Processing record created' }, { status: 201 });
});
