import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { updateUserSchema } from '@/lib/schemas/user';
import { createAuditLog } from '@/lib/audit';
import * as userService from '@/server-services/user.service';

export const GET = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const userData = await userService.getUserById(id);
  return NextResponse.json({ success: true, data: userData });
});

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin');
  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(updateUserSchema, body);

  const updated = await userService.updateUser(id, validated);

  await createAuditLog({
    actorId: user.userId,
    action: 'UPDATE_USER',
    resource: 'user',
    resourceId: id,
  });

  return NextResponse.json({ success: true, data: updated, message: 'User updated successfully' });
});

export const DELETE = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin');
  const { id } = await params;

  const result = await userService.deactivateUser(id);

  await createAuditLog({
    actorId: user.userId,
    action: 'DEACTIVATE_USER',
    resource: 'user',
    resourceId: id,
  });

  return NextResponse.json({ success: true, data: result });
});
