import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { updateVendorSchema } from '@/lib/schemas/vendor';
import { createAuditLog } from '@/lib/audit';
import * as vendorService from '@/server-services/vendor.service';

export const GET = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const vendor = await vendorService.getById(id);
  return NextResponse.json({ success: true, data: vendor });
});

export const PATCH = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const body = await req.json();
  const validated = validateBody(updateVendorSchema, body);
  const vendor = await vendorService.update(id, validated);

  await createAuditLog({ actorId: user.userId, action: 'UPDATE_VENDOR', resource: 'vendor', resourceId: id });
  return NextResponse.json({ success: true, data: vendor, message: 'Vendor updated successfully' });
});

export const DELETE = apiHandler(async (req: NextRequest, { params }) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { id } = await params;
  const result = await vendorService.remove(id);

  await createAuditLog({ actorId: user.userId, action: 'DELETE_VENDOR', resource: 'vendor', resourceId: id });
  return NextResponse.json({ success: true, ...result });
});
