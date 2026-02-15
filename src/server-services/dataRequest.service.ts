import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import { DataRequestStatus, DataRequestType, Prisma } from '@prisma/client';

interface CreateRequestParams {
  type: 'access' | 'erasure';
}

export async function createRequest(
  userId: string,
  { type }: CreateRequestParams
) {
  // Check for existing pending request of same type
  const existing = await prisma.dataRequest.findFirst({
    where: {
      userId,
      type,
      status: { in: ['pending', 'processing'] },
    },
  });

  if (existing) {
    throw new ApiError(400, `You already have a pending ${type} request`);
  }

  const request = await prisma.dataRequest.create({
    data: { userId, type },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  return request;
}

interface GetMyRequestsParams {
  page?: number;
  limit?: number;
}

export async function getMyRequests(
  userId: string,
  { page = 1, limit = 20 }: GetMyRequestsParams
) {
  const where = { userId };

  const [requests, total] = await Promise.all([
    prisma.dataRequest.findMany({
      where,
      orderBy: { requestedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dataRequest.count({ where }),
  ]);

  return {
    data: requests,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

interface GetAllRequestsParams {
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export async function getAllRequests({
  status,
  type,
  page = 1,
  limit = 20,
}: GetAllRequestsParams) {
  const where: Prisma.DataRequestWhereInput = {};
  if (status) where.status = status as DataRequestStatus;
  if (type) where.type = type as DataRequestType;

  const [requests, total] = await Promise.all([
    prisma.dataRequest.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        processedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { requestedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dataRequest.count({ where }),
  ]);

  return {
    data: requests,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

interface ProcessRequestParams {
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  notes?: string;
}

export async function processRequest(
  requestId: string,
  processedById: string,
  { status, notes }: ProcessRequestParams
) {
  const request = await prisma.dataRequest.findUnique({
    where: { id: requestId },
  });
  if (!request) {
    throw new ApiError(404, 'Data request not found');
  }

  if (request.status === 'completed' || request.status === 'rejected') {
    throw new ApiError(400, 'This request has already been processed');
  }

  const updated = await prisma.dataRequest.update({
    where: { id: requestId },
    data: {
      status,
      processedById,
      notes,
      completedAt:
        status === 'completed' || status === 'rejected' ? new Date() : null,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      processedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
  });

  // If erasure request is completed, perform full GDPR Article 17 data erasure
  if (status === 'completed' && request.type === 'erasure') {
    const userId = request.userId;
    await prisma.$transaction(async (tx) => {
      // Delete all related personal data
      await tx.consentRecord.deleteMany({ where: { userId } });
      await tx.cookieConsentRecord.deleteMany({ where: { userId } });
      await tx.breachUserNotification.deleteMany({ where: { userId } });
      // Anonymize audit logs (keep for compliance but remove personal identifiers)
      await tx.auditLog.updateMany({
        where: { actorId: userId },
        data: { actorId: null },
      });
      // Anonymize the user record (keep for referential integrity)
      await tx.user.update({
        where: { id: userId },
        data: {
          firstName: 'Deleted',
          lastName: 'User',
          email: `deleted_${Date.now()}@anonymized.local`,
          passwordHash: '',
          isActive: false,
        },
      });
    });
  }

  return updated;
}
