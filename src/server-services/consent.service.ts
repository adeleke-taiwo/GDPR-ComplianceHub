import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import { CONSENT_PURPOSES } from '@/lib/constants';

export async function getMyConsent(userId: string) {
  const records = await prisma.consentRecord.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Get latest consent per purpose
  const latestByPurpose: Record<string, (typeof records)[number]> = {};
  for (const record of records) {
    if (!latestByPurpose[record.purpose]) {
      latestByPurpose[record.purpose] = record;
    }
  }

  return CONSENT_PURPOSES.map((purpose) => ({
    purpose,
    granted: latestByPurpose[purpose]?.granted || false,
    grantedAt: latestByPurpose[purpose]?.grantedAt || null,
    revokedAt: latestByPurpose[purpose]?.revokedAt || null,
  }));
}

interface UpdateConsentParams {
  consents: Record<string, boolean>;
  ipAddress?: string;
  userAgent?: string;
}

export async function updateConsent(
  userId: string,
  { consents, ipAddress, userAgent }: UpdateConsentParams
) {
  const records: Array<{
    userId: string;
    purpose: (typeof CONSENT_PURPOSES)[number];
    granted: boolean;
    ipAddress: string | null;
    userAgent: string | null;
    grantedAt: Date | null;
    revokedAt: Date | null;
  }> = [];

  for (const [purpose, granted] of Object.entries(consents)) {
    if (
      !CONSENT_PURPOSES.includes(
        purpose as (typeof CONSENT_PURPOSES)[number]
      )
    )
      continue;

    records.push({
      userId,
      purpose: purpose as (typeof CONSENT_PURPOSES)[number],
      granted,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      grantedAt: granted ? new Date() : null,
      revokedAt: !granted ? new Date() : null,
    });
  }

  if (records.length > 0) {
    await prisma.consentRecord.createMany({ data: records });
  }

  return getMyConsent(userId);
}

interface GetConsentHistoryParams {
  page?: number;
  limit?: number;
}

export async function getConsentHistory(
  userId: string,
  { page = 1, limit = 20 }: GetConsentHistoryParams
) {
  const where = { userId };

  const [records, total] = await Promise.all([
    prisma.consentRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.consentRecord.count({ where }),
  ]);

  return {
    data: records,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
