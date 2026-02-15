import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { authorize } from '@/lib/rbac';
import * as dashboardService from '@/server-services/dashboard.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  authorize(user.role, 'admin', 'dpo', 'user');
  const stats = await dashboardService.getStats(user.userId, user.role);
  return NextResponse.json({ success: true, data: stats });
});
