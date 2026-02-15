import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';

export async function getAll({ page = 1, limit = 20 }: { page?: number; limit?: number }) {
  const [policies, total] = await Promise.all([
    prisma.retentionPolicy.findMany({
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.retentionPolicy.count(),
  ]);

  return {
    data: policies,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function create(createdById: string, data: Record<string, unknown>) {
  return prisma.retentionPolicy.create({
    data: {
      ...data,
      createdById,
    } as Parameters<typeof prisma.retentionPolicy.create>[0]['data'],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  const policy = await prisma.retentionPolicy.findUnique({ where: { id } });
  if (!policy) {
    throw new ApiError(404, 'Retention policy not found');
  }

  return prisma.retentionPolicy.update({
    where: { id },
    data: data as Parameters<typeof prisma.retentionPolicy.update>[0]['data'],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function remove(id: string) {
  const policy = await prisma.retentionPolicy.findUnique({ where: { id } });
  if (!policy) {
    throw new ApiError(404, 'Retention policy not found');
  }

  await prisma.retentionPolicy.delete({ where: { id } });
  return { message: 'Retention policy deleted' };
}
