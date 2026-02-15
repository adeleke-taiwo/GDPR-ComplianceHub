import { NextRequest, NextResponse } from 'next/server';
import { apiHandler } from '@/lib/api-handler';
import { authenticate } from '@/lib/auth';
import { createAuditLog } from '@/lib/audit';
import * as dataExportService from '@/server-services/dataExport.service';

export const GET = apiHandler(async (req: NextRequest) => {
  const user = await authenticate(req);
  const data = await dataExportService.exportMyData(user.userId);

  await createAuditLog({
    actorId: user.userId,
    action: 'EXPORT_DATA',
    resource: 'data_export',
  });

  return NextResponse.json({ success: true, data });
});
