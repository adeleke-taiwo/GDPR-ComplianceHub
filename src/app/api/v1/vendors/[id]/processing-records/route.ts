import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { linkProcessingRecordSchema } from '@/lib/schemas/vendor';
import { createAuditLog } from '@/lib/audit';
import * as vendorService from '@/server-services/vendor.service';

export const POST = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(linkProcessingRecordSchema, body);
  const link = await vendorService.linkToProcessingRecord(id, validated.processingRecordId, validated.role ?? 'processor', validated.description);

  await createAuditLog({ actorId: user.userId, action: 'LINK_VENDOR_PROCESSING', resource: 'vendor', resourceId: id });
  return NextResponse.json({ success: true, data: link, message: 'Vendor linked to processing record successfully' }, { status: 201 });
});
