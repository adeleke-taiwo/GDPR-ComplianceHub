import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { dpiaMitigationSchema } from '@/lib/schemas/dpia';
import { createAuditLog } from '@/lib/audit';
import * as dpiaService from '@/server-services/dpia.service';

export const POST = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(dpiaMitigationSchema, body);
  const mitigation = await dpiaService.addMitigation(id, validated);

  await createAuditLog({ actorId: user.userId, action: 'ADD_DPIA_MITIGATION', resource: 'dpia_mitigation', resourceId: mitigation.id });
  return NextResponse.json({ success: true, data: mitigation, message: 'Mitigation added successfully' }, { status: 201 });
});
