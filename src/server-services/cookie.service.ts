import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import { CookieCategory, Prisma } from '@prisma/client';
import crypto from 'crypto';

// Cookie CRUD

export async function getAllCookies({
  page = 1,
  limit = 50,
  category,
}: {
  page?: number;
  limit?: number;
  category?: string;
}) {
  const where = category ? { category: category as CookieCategory } : {};

  const [cookies, total] = await Promise.all([
    prisma.cookie.findMany({
      where,
      include: {
        vendor: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.cookie.count({ where }),
  ]);

  return {
    data: cookies,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function createCookie(data: Record<string, unknown>) {
  return prisma.cookie.create({
    data: data as Parameters<typeof prisma.cookie.create>[0]['data'],
    include: { vendor: { select: { id: true, name: true } } },
  });
}

export async function updateCookie(id: string, data: Record<string, unknown>) {
  const cookie = await prisma.cookie.findUnique({ where: { id } });
  if (!cookie) throw new ApiError(404, 'Cookie not found');

  return prisma.cookie.update({
    where: { id },
    data: data as Parameters<typeof prisma.cookie.update>[0]['data'],
    include: { vendor: { select: { id: true, name: true } } },
  });
}

export async function deleteCookie(id: string) {
  const cookie = await prisma.cookie.findUnique({ where: { id } });
  if (!cookie) throw new ApiError(404, 'Cookie not found');

  await prisma.cookie.delete({ where: { id } });
  return { message: 'Cookie deleted successfully' };
}

// Consent Management

export async function recordConsent(data: {
  userId?: string;
  sessionId?: string;
  preferences: Record<string, boolean>;
  ipAddress?: string;
  userAgent?: string;
}) {
  const { userId, sessionId, preferences, ipAddress, userAgent } = data;

  const consentSessionId = sessionId || crypto.randomUUID();
  const records = Object.entries(preferences).map(([category, granted]) => ({
    userId: userId || null,
    sessionId: consentSessionId,
    category,
    granted,
    ipAddress,
    userAgent,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
  }));

  await prisma.cookieConsentRecord.createMany({
    data: records as Prisma.CookieConsentRecordCreateManyInput[],
  });
  return { message: 'Consent recorded successfully', sessionId: consentSessionId };
}

export async function getUserConsent(userId: string) {
  const consents = await prisma.cookieConsentRecord.findMany({
    where: {
      userId,
      revokedAt: null,
      OR: [
        { expiresAt: { gt: new Date() } },
        { expiresAt: null },
      ],
    },
    orderBy: { grantedAt: 'desc' },
    include: {
      cookie: { select: { name: true, category: true } },
    },
  });

  // Group by category, taking most recent
  const byCategory: Record<string, (typeof consents)[number]> = {};
  consents.forEach((c) => {
    if (c.category && !byCategory[c.category]) {
      byCategory[c.category] = c;
    }
  });

  return Object.values(byCategory);
}

export async function scanDomain(domain: string, scannedById: string) {
  // Placeholder for actual cookie scanning logic
  // In production, this would use a headless browser (Puppeteer/Playwright)
  const mockResults = [
    { name: '_ga', category: 'analytics', domain, isFirstParty: false, vendor: 'Google Analytics' },
    { name: '_gid', category: 'analytics', domain, isFirstParty: false, vendor: 'Google Analytics' },
    { name: 'session_id', category: 'necessary', domain, isFirstParty: true, vendor: null },
    { name: '_fbp', category: 'marketing', domain, isFirstParty: false, vendor: 'Facebook' },
  ];

  const scan = await prisma.cookieScan.create({
    data: {
      domain,
      scannedById,
      cookiesFound: mockResults.length,
      scanResults: mockResults,
      status: 'completed',
    },
  });

  return scan;
}
