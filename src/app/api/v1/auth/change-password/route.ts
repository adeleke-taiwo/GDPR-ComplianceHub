import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { validateBody } from '@/lib/validate';
import { changePasswordSchema } from '@/lib/schemas/auth';
import { createAuditLog } from '@/lib/audit';
import * as authService from '@/server-services/auth.service';

export const PATCH = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  const body = await req.json();
  const validated = validateBody(changePasswordSchema, body);

  await authService.changePassword(user.userId, validated);

  await createAuditLog({
    actorId: user.userId,
    action: 'CHANGE_PASSWORD',
    resource: 'user',
    resourceId: user.userId,
  });

  return NextResponse.json({ success: true, message: 'Password changed successfully' });
});
