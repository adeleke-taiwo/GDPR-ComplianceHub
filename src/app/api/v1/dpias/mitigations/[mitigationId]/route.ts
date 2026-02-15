import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { updateDpiaMitigationSchema } from '@/lib/schemas/dpia';
import { createAuditLog } from '@/lib/audit';
import * as dpiaService from '@/server-services/dpia.service';

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { mitigationId } = await params;
  const body = await req.json();
  const validated = validateBody(updateDpiaMitigationSchema, body);
  const mitigation = await dpiaService.updateMitigation(mitigationId, validated);

  await createAuditLog({ actorId: user.userId, action: 'UPDATE_DPIA_MITIGATION', resource: 'dpia_mitigation', resourceId: mitigationId });
  return NextResponse.json({ success: true, data: mitigation, message: 'Mitigation updated successfully' });
});

export const DELETE = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { mitigationId } = await params;
  const result = await dpiaService.deleteMitigation(mitigationId);

  await createAuditLog({ actorId: user.userId, action: 'DELETE_DPIA_MITIGATION', resource: 'dpia_mitigation', resourceId: mitigationId });
  return NextResponse.json({ success: true, ...result });
});
