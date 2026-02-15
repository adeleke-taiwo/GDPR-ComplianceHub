import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import { BreachStatus, BreachSeverity, Prisma } from '@prisma/client';

export async function getAll({
  status,
  severity,
  page = 1,
  limit = 20,
}: {
  status?: string;
  severity?: string;
  page?: number;
  limit?: number;
}) {
  const where: Prisma.BreachNotificationWhereInput = {};
  if (status) where.status = status as BreachStatus;
  if (severity) where.severity = severity as BreachSeverity;

  const [breaches, total] = await Promise.all([
    prisma.breachNotification.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { breachUserNotifications: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.breachNotification.count({ where }),
  ]);

  return {
    data: breaches,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function create(createdById: string, data: Record<string, unknown>) {
  return prisma.breachNotification.create({
    data: {
      ...data,
      createdById,
    } as Parameters<typeof prisma.breachNotification.create>[0]['data'],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  const breach = await prisma.breachNotification.findUnique({ where: { id } });
  if (!breach) {
    throw new ApiError(404, 'Breach notification not found');
  }

  return prisma.breachNotification.update({
    where: { id },
    data: data as Parameters<typeof prisma.breachNotification.update>[0]['data'],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function notifyUsers(breachId: string) {
  return await prisma.$transaction(async (tx) => {
    const breach = await tx.breachNotification.findUnique({ where: { id: breachId } });
    if (!breach) {
      throw new ApiError(404, 'Breach notification not found');
    }

    const users = await tx.user.findMany({
      where: { isActive: true },
      select: { id: true },
    });

    // Use skipDuplicates to prevent race condition duplicates
    const result = await tx.breachUserNotification.createMany({
      data: users.map((u) => ({
        breachId,
        userId: u.id,
      })),
      skipDuplicates: true,
    });

    const updated = await tx.breachNotification.update({
      where: { id: breachId },
      data: {
        notifiedUsersAt: new Date(),
        affectedUserCount: users.length,
      },
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return {
      breach: updated,
      notifiedCount: result.count,
    };
  });
}

export async function getMyNotifications(
  userId: string,
  { page = 1, limit = 20 }: { page?: number; limit?: number },
) {
  const where = { userId };

  const [notifications, total] = await Promise.all([
    prisma.breachUserNotification.findMany({
      where,
      include: {
        breach: {
          select: {
            id: true,
            title: true,
            description: true,
            severity: true,
            affectedDataTypes: true,
            discoveredAt: true,
            status: true,
          },
        },
      },
      orderBy: { notifiedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.breachUserNotification.count({ where }),
  ]);

  return {
    data: notifications,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function acknowledgeNotification(notificationId: string, userId: string) {
  const notification = await prisma.breachUserNotification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  if (notification.userId !== userId) {
    throw new ApiError(403, 'Not your notification');
  }

  return prisma.breachUserNotification.update({
    where: { id: notificationId },
    data: { acknowledgedAt: new Date() },
    include: {
      breach: {
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
        },
      },
    },
  });
}
