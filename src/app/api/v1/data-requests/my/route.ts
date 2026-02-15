import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import * as dataRequestService from '@/server-services/dataRequest.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  const { searchParams } = new URL(req.url);
  const result = await dataRequestService.getMyRequests(user.userId, {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
  });
  return NextResponse.json({ success: true, ...result });
});
