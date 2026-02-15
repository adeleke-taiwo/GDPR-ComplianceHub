import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import { Prisma } from '@prisma/client';

import type { User } from '@prisma/client';

function sanitizeUser(user: User) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return rest;
}

interface GetUsersParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export async function getUsers({
  search,
  role,
  page = 1,
  limit = 20,
}: GetUsersParams) {
  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      consentRecords: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return sanitizeUser(user);
}

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  isActive?: boolean;
}

export async function updateUser(userId: string, data: UpdateUserData) {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        isActive: data.isActive,
      },
    });
    return sanitizeUser(updated);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ApiError(404, 'User not found');
    }
    throw error;
  }
}

export async function changeRole(userId: string, newRole: string) {
  const validRoles = ['user', 'admin', 'dpo'];
  if (!validRoles.includes(newRole)) {
    throw new ApiError(400, 'Invalid role');
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as User['role'] },
    });
    return sanitizeUser(updated);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ApiError(404, 'User not found');
    }
    throw error;
  }
}

export async function deactivateUser(userId: string) {
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
    return sanitizeUser(updated);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new ApiError(404, 'User not found');
    }
    throw error;
  }
}
