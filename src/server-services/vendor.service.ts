import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import { VendorStatus } from '@prisma/client';

export async function getAll({
  page = 1,
  limit = 20,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const where = status ? { status: status as VendorStatus } : {};

  const [vendors, total] = await Promise.all([
    prisma.vendor.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        parentVendor: { select: { id: true, name: true } },
        _count: {
          select: {
            subProcessors: true,
            processingRecords: true,
            riskAssessments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vendor.count({ where }),
  ]);

  return {
    data: vendors,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getById(id: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      parentVendor: { select: { id: true, name: true } },
      subProcessors: { select: { id: true, name: true, status: true, riskLevel: true } },
      processingRecords: {
        include: {
          processingRecord: {
            select: { id: true, purpose: true, legalBasis: true },
          },
        },
      },
      riskAssessments: {
        orderBy: { assessmentDate: 'desc' },
        take: 5,
        include: {
          assessedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      cookies: {
        select: { id: true, name: true, category: true },
      },
    },
  });

  if (!vendor) throw new ApiError(404, 'Vendor not found');
  return vendor;
}

export async function create(createdById: string, data: Record<string, unknown>) {
  return prisma.vendor.create({
    data: {
      ...data,
      createdById,
    } as Parameters<typeof prisma.vendor.create>[0]['data'],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function update(id: string, data: Record<string, unknown>) {
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) throw new ApiError(404, 'Vendor not found');

  return prisma.vendor.update({
    where: { id },
    data: data as Parameters<typeof prisma.vendor.update>[0]['data'],
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function remove(id: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subProcessors: true,
          processingRecords: true,
          cookies: true,
        },
      },
    },
  });
  if (!vendor) throw new ApiError(404, 'Vendor not found');

  if (vendor._count.subProcessors > 0) {
    throw new ApiError(409, 'Cannot delete vendor with sub-processors');
  }
  if (vendor._count.processingRecords > 0) {
    throw new ApiError(409, 'Cannot delete vendor with active processing records');
  }

  await prisma.vendor.delete({ where: { id } });
  return { message: 'Vendor deleted successfully' };
}

export async function linkToProcessingRecord(
  vendorId: string,
  processingRecordId: string,
  role: string,
  description?: string,
) {
  // Verify vendor exists
  const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
  if (!vendor) throw new ApiError(404, 'Vendor not found');

  // Verify processing record exists
  const processingRecord = await prisma.processingRecord.findUnique({
    where: { id: processingRecordId },
  });
  if (!processingRecord) throw new ApiError(404, 'Processing record not found');

  // Check if link already exists
  const existing = await prisma.vendorProcessingRecord.findUnique({
    where: {
      vendorId_processingRecordId: { vendorId, processingRecordId },
    },
  });

  if (existing) {
    throw new ApiError(409, 'Vendor is already linked to this processing record');
  }

  return prisma.vendorProcessingRecord.create({
    data: { vendorId, processingRecordId, role, description },
    include: {
      vendor: { select: { id: true, name: true } },
      processingRecord: { select: { id: true, purpose: true } },
    },
  });
}

export async function createRiskAssessment(
  assessedById: string,
  data: Record<string, unknown>,
) {
  // Verify vendor exists
  const vendor = await prisma.vendor.findUnique({
    where: { id: data.vendorId as string },
  });
  if (!vendor) throw new ApiError(404, 'Vendor not found');

  return prisma.vendorRiskAssessment.create({
    data: {
      ...data,
      assessedById,
    } as Parameters<typeof prisma.vendorRiskAssessment.create>[0]['data'],
    include: {
      vendor: { select: { id: true, name: true } },
      assessedBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}
