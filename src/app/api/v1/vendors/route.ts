import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import { validateBody } from '@/lib/validate';
import { createVendorSchema } from '@/lib/schemas/vendor';
import { createAuditLog } from '@/lib/audit';
import * as vendorService from '@/server-services/vendor.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { searchParams } = new URL(req.url);
  const result = await vendorService.getAll({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    status: searchParams.get('status') || undefined,
  });
  return NextResponse.json({ success: true, ...result });
});

export const POST = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const body = await req.json();
  const validated = validateBody(createVendorSchema, body);
  const vendor = await vendorService.create(user.userId, validated);

  await createAuditLog({ actorId: user.userId, action: 'CREATE_VENDOR', resource: 'vendor', resourceId: vendor.id });
  return NextResponse.json({ success: true, data: vendor, message: 'Vendor created successfully' }, { status: 201 });
});
