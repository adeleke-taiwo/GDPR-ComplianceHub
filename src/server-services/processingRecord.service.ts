import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';

export async function getAll({ page = 1, limit = 20 }: { page?: number; limit?: number }) {
  const [records, total] = await Promise.all([
    prisma.processingRecord.findMany({
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.processingRecord.count(),
  ]);

  return {
    data: records,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function create(createdById: string, data: Record<string, unknown>) {
  return prisma.processingRecord.create({
    data: {
      ...data,
      createdById,
    } as Parameters<typeof prisma.processingRecord.create>[0]['data'],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  const record = await prisma.processingRecord.findUnique({ where: { id } });
  if (!record) {
    throw new ApiError(404, 'Processing record not found');
  }

  return prisma.processingRecord.update({
    where: { id },
    data: data as Parameters<typeof prisma.processingRecord.update>[0]['data'],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function remove(id: string) {
  const record = await prisma.processingRecord.findUnique({ where: { id } });
  if (!record) {
    throw new ApiError(404, 'Processing record not found');
  }

  await prisma.processingRecord.delete({ where: { id } });
  return { message: 'Processing record deleted' };
}
