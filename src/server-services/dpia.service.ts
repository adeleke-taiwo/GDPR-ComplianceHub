import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import { DPIAStatus } from '@prisma/client';

export async function getAll({
  page = 1,
  limit = 20,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const where = status ? { status: status as DPIAStatus } : {};

  const [dpias, total] = await Promise.all([
    prisma.dPIA.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        processingRecord: { select: { id: true, purpose: true } },
        _count: {
          select: { risks: true, mitigations: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.dPIA.count({ where }),
  ]);

  return {
    data: dpias,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getById(id: string) {
  const dpia = await prisma.dPIA.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      reviewedBy: { select: { id: true, firstName: true, lastName: true } },
      approvedBy: { select: { id: true, firstName: true, lastName: true } },
      processingRecord: { select: { id: true, purpose: true, dataCategories: true } },
      risks: {
        include: {
          mitigations: true,
        },
        orderBy: { createdAt: 'desc' },
      },
      mitigations: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!dpia) throw new ApiError(404, 'DPIA not found');
  return dpia;
}

export async function create(createdById: string, data: Record<string, unknown>) {
  return prisma.dPIA.create({
    data: {
      ...data,
      createdById,
    } as Parameters<typeof prisma.dPIA.create>[0]['data'],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  const dpia = await prisma.dPIA.findUnique({ where: { id } });
  if (!dpia) throw new ApiError(404, 'DPIA not found');

  return prisma.dPIA.update({
    where: { id },
    data: data as Parameters<typeof prisma.dPIA.update>[0]['data'],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      reviewedBy: { select: { id: true, firstName: true, lastName: true } },
      approvedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function remove(id: string) {
  const dpia = await prisma.dPIA.findUnique({ where: { id } });
  if (!dpia) throw new ApiError(404, 'DPIA not found');

  await prisma.dPIA.delete({ where: { id } });
  return { message: 'DPIA deleted successfully' };
}

// Risk Management

export async function addRisk(dpiaId: string, data: Record<string, unknown>) {
  // Verify DPIA exists
  const dpia = await prisma.dPIA.findUnique({ where: { id: dpiaId } });
  if (!dpia) throw new ApiError(404, 'DPIA not found');

  return prisma.dPIARisk.create({
    data: { ...data, dpiaId } as Parameters<typeof prisma.dPIARisk.create>[0]['data'],
  });
}

export async function updateRisk(id: string, data: Record<string, unknown>) {
  const risk = await prisma.dPIARisk.findUnique({ where: { id } });
  if (!risk) throw new ApiError(404, 'Risk not found');

  return prisma.dPIARisk.update({
    where: { id },
    data: data as Parameters<typeof prisma.dPIARisk.update>[0]['data'],
  });
}

export async function deleteRisk(id: string) {
  const risk = await prisma.dPIARisk.findUnique({ where: { id } });
  if (!risk) throw new ApiError(404, 'Risk not found');

  await prisma.dPIARisk.delete({ where: { id } });
  return { message: 'Risk deleted successfully' };
}

// Mitigation Management

export async function addMitigation(dpiaId: string, data: Record<string, unknown>) {
  // Verify DPIA exists
  const dpia = await prisma.dPIA.findUnique({ where: { id: dpiaId } });
  if (!dpia) throw new ApiError(404, 'DPIA not found');

  // If riskId is provided, verify it belongs to this DPIA
  if (data.riskId) {
    const risk = await prisma.dPIARisk.findUnique({ where: { id: data.riskId as string } });
    if (!risk || risk.dpiaId !== dpiaId) {
      throw new ApiError(400, 'Risk not found or does not belong to this DPIA');
    }
  }

  return prisma.dPIAMitigation.create({
    data: { ...data, dpiaId } as Parameters<typeof prisma.dPIAMitigation.create>[0]['data'],
  });
}

export async function updateMitigation(id: string, data: Record<string, unknown>) {
  const mitigation = await prisma.dPIAMitigation.findUnique({ where: { id } });
  if (!mitigation) throw new ApiError(404, 'Mitigation not found');

  return prisma.dPIAMitigation.update({
    where: { id },
    data: data as Parameters<typeof prisma.dPIAMitigation.update>[0]['data'],
  });
}

export async function deleteMitigation(id: string) {
  const mitigation = await prisma.dPIAMitigation.findUnique({ where: { id } });
  if (!mitigation) throw new ApiError(404, 'Mitigation not found');

  await prisma.dPIAMitigation.delete({ where: { id } });
  return { message: 'Mitigation deleted successfully' };
}

// Calculate risk score based on all risks in a DPIA

export async function calculateRiskScore(dpiaId: string) {
  const risks = await prisma.dPIARisk.findMany({
    where: { dpiaId },
  });

  if (risks.length === 0) return { riskLevel: 'low', score: 0 };

  const avgScore = risks.reduce((sum, r) => sum + (r.likelihood * r.impact), 0) / risks.length;

  let riskLevel = 'low';
  if (avgScore >= 20) riskLevel = 'very_high';
  else if (avgScore >= 15) riskLevel = 'high';
  else if (avgScore >= 10) riskLevel = 'medium';

  return { riskLevel, score: Math.round(avgScore * 10) / 10 };
}
