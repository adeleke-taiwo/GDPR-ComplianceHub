import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { updateDpiaRiskSchema } from '@/lib/schemas/dpia';
import { createAuditLog } from '@/lib/audit';
import * as dpiaService from '@/server-services/dpia.service';

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { riskId } = await params;
  const body = await req.json();
  const validated = validateBody(updateDpiaRiskSchema, body);
  const risk = await dpiaService.updateRisk(riskId, validated);

  await createAuditLog({ actorId: user.userId, action: 'UPDATE_DPIA_RISK', resource: 'dpia_risk', resourceId: riskId });
  return NextResponse.json({ success: true, data: risk, message: 'Risk updated successfully' });
});

export const DELETE = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { riskId } = await params;
  const result = await dpiaService.deleteRisk(riskId);

  await createAuditLog({ actorId: user.userId, action: 'DELETE_DPIA_RISK', resource: 'dpia_risk', resourceId: riskId });
  return NextResponse.json({ success: true, ...result });
});
