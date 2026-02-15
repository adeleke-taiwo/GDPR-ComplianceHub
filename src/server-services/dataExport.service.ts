import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';

export async function exportMyData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      consentVersion: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const [consents, dataRequests, breachNotifications] = await Promise.all([
    prisma.consentRecord.findMany({
      where: { userId },
      select: {
        purpose: true,
        granted: true,
        grantedAt: true,
        revokedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.dataRequest.findMany({
      where: { userId },
      select: {
        type: true,
        status: true,
        notes: true,
        requestedAt: true,
        completedAt: true,
      },
      orderBy: { requestedAt: 'desc' },
    }),
    prisma.breachUserNotification.findMany({
      where: { userId },
      include: {
        breach: {
          select: {
            title: true,
            description: true,
            severity: true,
            discoveredAt: true,
            status: true,
          },
        },
      },
      orderBy: { notifiedAt: 'desc' },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    gdprArticle: 'Article 15 - Right of Access',
    personalData: user,
    consentHistory: consents,
    dataRequests,
    breachNotifications: breachNotifications.map((n) => ({
      breach: n.breach,
      notifiedAt: n.notifiedAt,
      acknowledgedAt: n.acknowledgedAt,
    })),
  };
}
