import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import * as userService from '@/server-services/user.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo');
  const { searchParams } = new URL(req.url);
  const result = await userService.getUsers({
    search: searchParams.get('search') || undefined,
    role: searchParams.get('role') || undefined,
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  });
  return NextResponse.json({ success: true, ...result });
});
