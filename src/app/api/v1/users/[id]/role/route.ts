import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { changeRoleSchema } from '@/lib/schemas/user';
import { createAuditLog } from '@/lib/audit';
import * as userService from '@/server-services/user.service';

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin');
  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(changeRoleSchema, body);

  const updated = await userService.changeRole(id, validated.role);

  await createAuditLog({
    actorId: user.userId,
    action: 'CHANGE_ROLE',
    resource: 'user',
    resourceId: id,
  });

  return NextResponse.json({ success: true, data: updated, message: 'User role updated successfully' });
});
