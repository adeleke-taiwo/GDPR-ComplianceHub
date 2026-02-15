import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { riskAssessmentSchema } from '@/lib/schemas/vendor';
import { createAuditLog } from '@/lib/audit';
import * as vendorService from '@/server-services/vendor.service';

export const POST = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const body = await req.json();
  const validated = validateBody(riskAssessmentSchema, body);
  const assessment = await vendorService.createRiskAssessment(user.userId, validated);

  await createAuditLog({ actorId: user.userId, action: 'CREATE_VENDOR_RISK_ASSESSMENT', resource: 'vendor_risk', resourceId: assessment.id });
  return NextResponse.json({ success: true, data: assessment, message: 'Risk assessment created successfully' }, { status: 201 });
});
