import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { updateDPIASchema } from '@/lib/schemas/dpia';
import { createAuditLog } from '@/lib/audit';
import * as dpiaService from '@/server-services/dpia.service';

export const GET = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const dpia = await dpiaService.getById(id);
  return NextResponse.json({ success: true, data: dpia });
});

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(updateDPIASchema, body);
  const dpia = await dpiaService.update(id, validated);

  await createAuditLog({ actorId: user.userId, action: 'UPDATE_DPIA', resource: 'dpia', resourceId: id });
  return NextResponse.json({ success: true, data: dpia, message: 'DPIA updated successfully' });
});

export const DELETE = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const result = await dpiaService.remove(id);

  await createAuditLog({ actorId: user.userId, action: 'DELETE_DPIA', resource: 'dpia', resourceId: id });
  return NextResponse.json({ success: true, ...result });
});
