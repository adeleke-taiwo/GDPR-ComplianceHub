import prisma from '@/lib/prisma';
import { ROLES, CONSENT_PURPOSES } from '@/lib/constants';

export async function getStats(userId: string, role: string) {
  if (role === ROLES.USER) return getUserStats(userId);
  if (role === ROLES.DPO) return getDpoStats();
  return getAdminStats();
}

// ─── Regular User ─────────────────────────────────────────────────────────────

async function getUserStats(userId: string) {
  const [consentRecords, pendingRequests, unacknowledgedBreaches] = await Promise.all([
    prisma.consentRecord.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
    prisma.dataRequest.count({ where: { userId, status: { in: ['pending', 'processing'] } } }),
    prisma.breachUserNotification.count({ where: { userId, acknowledgedAt: null } }),
  ]);

  // Latest consent per purpose -- denominator is always all 5 purposes
  const latestConsents: Record<string, boolean> = {};
  for (const record of consentRecords) {
    if (!latestConsents[record.purpose]) {
      latestConsents[record.purpose] = record.granted;
    }
  }
  const totalConsents = CONSENT_PURPOSES.length;
  const grantedConsents = CONSENT_PURPOSES.filter((p) => latestConsents[p] === true).length;

  return {
    consentRate: Math.round((grantedConsents / totalConsents) * 100),
    grantedConsents,
    totalConsents,
    pendingRequests,
    unacknowledgedBreaches,
  };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

async function getAdminStats() {
  const [
    totalUsers,
    activeUsers,
    pendingRequests,
    activeBreaches,
    totalAuditLogs,
    processingRecords,
    retentionPolicies,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.dataRequest.count({ where: { status: 'pending' } }),
    prisma.breachNotification.count({ where: { status: { not: 'resolved' } } }),
    prisma.auditLog.count(),
    prisma.processingRecord.count({ where: { isActive: true } }),
    prisma.retentionPolicy.count({ where: { isActive: true } }),
  ]);

  // Platform consent rate -- only active users, all 5 purposes as denominator
  const allLatestConsents = await prisma.$queryRaw<{ granted: boolean }[]>`
    SELECT DISTINCT ON (cr."userId", cr."purpose") cr."granted"
    FROM "consent_records" cr
    INNER JOIN "users" u ON u."id" = cr."userId"
    WHERE u."isActive" = true
    ORDER BY cr."userId", cr."purpose", cr."createdAt" DESC
  `;

  const totalPossible = activeUsers * CONSENT_PURPOSES.length;
  const grantedConsents = allLatestConsents.filter((c) => c.granted).length;
  const consentRate = totalPossible > 0 ? Math.round((grantedConsents / totalPossible) * 100) : 0;

  return {
    totalUsers,
    activeUsers,
    pendingRequests,
    activeBreaches,
    totalAuditLogs,
    processingRecords,
    retentionPolicies,
    consentRate,
  };
}

// ─── DPO ─────────────────────────────────────────────────────────────────────

async function getDpoStats() {
  const [
    totalDPIAs,
    dpiasPendingReview,
    highRiskVendors,
    activeBreaches,
    pendingRequests,
    retentionPolicies,
    activeUsers,
  ] = await Promise.all([
    prisma.dPIA.count(),
    prisma.dPIA.count({ where: { status: 'in_review' } }),
    prisma.vendor.count({ where: { riskLevel: { in: ['high', 'critical'] }, status: 'active' } }),
    prisma.breachNotification.count({ where: { status: { not: 'resolved' } } }),
    prisma.dataRequest.count({ where: { status: 'pending' } }),
    prisma.retentionPolicy.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
  ]);

  // Platform consent rate -- only active users
  const allLatestConsents = await prisma.$queryRaw<{ granted: boolean }[]>`
    SELECT DISTINCT ON (cr."userId", cr."purpose") cr."granted"
    FROM "consent_records" cr
    INNER JOIN "users" u ON u."id" = cr."userId"
    WHERE u."isActive" = true
    ORDER BY cr."userId", cr."purpose", cr."createdAt" DESC
  `;

  const totalPossible = activeUsers * CONSENT_PURPOSES.length;
  const grantedConsents = allLatestConsents.filter((c) => c.granted).length;
  const consentRate = totalPossible > 0 ? Math.round((grantedConsents / totalPossible) * 100) : 0;

  // Recent active DPIAs in review (for the DPO widget)
  const dpiasPendingList = await prisma.dPIA.findMany({
    where: { status: 'in_review' },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      riskLevel: true,
      status: true,
      updatedAt: true,
      createdBy: { select: { firstName: true, lastName: true } },
    },
  });

  // Recent active breaches
  const recentBreaches = await prisma.breachNotification.findMany({
    where: { status: { not: 'resolved' } },
    orderBy: { discoveredAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      severity: true,
      status: true,
      discoveredAt: true,
      reportedToAuthorityAt: true,
    },
  });

  // High-risk vendors list
  const highRiskVendorsList = await prisma.vendor.findMany({
    where: { riskLevel: { in: ['high', 'critical'] }, status: 'active' },
    orderBy: { riskLevel: 'desc' },
    take: 5,
    select: {
      id: true,
      name: true,
      riskLevel: true,
      status: true,
      country: true,
    },
  });

  return {
    totalDPIAs,
    dpiasPendingReview,
    highRiskVendors,
    activeBreaches,
    pendingRequests,
    retentionPolicies,
    consentRate,
    dpiasPendingList,
    recentBreaches,
    highRiskVendorsList,
  };
}
