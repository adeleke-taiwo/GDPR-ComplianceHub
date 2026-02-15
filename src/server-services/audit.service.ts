import prisma from '@/lib/prisma';

interface GetLogsParams {
  action?: string;
  resource?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export async function getLogs({
  action,
  resource,
  actorId,
  startDate,
  endDate,
  page = 1,
  limit = 30,
}: GetLogsParams) {
  // Clamp pagination bounds
  page = Math.max(1, page);
  limit = Math.min(100, Math.max(1, limit));

  const where: Record<string, unknown> = {};
  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (actorId) where.actorId = actorId;
  if (startDate || endDate) {
    const createdAt: Record<string, Date> = {};
    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) createdAt.gte = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) createdAt.lte = end;
    }
    if (Object.keys(createdAt).length > 0) where.createdAt = createdAt;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
