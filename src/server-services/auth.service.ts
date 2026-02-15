import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { ApiError } from '@/lib/api-error';
import { CONSENT_PURPOSES } from '@/lib/constants';

import type { User } from '@prisma/client';

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET environment variables are required');
}
const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET);

export async function generateAccessToken(user: User): Promise<string> {
  return new SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(accessSecret);
}

export async function generateRefreshToken(user: User): Promise<string> {
  return new SignJWT({ userId: user.id })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(refreshSecret);
}

export function sanitizeUser(user: User) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash, ...rest } = user;
  return rest;
}

interface RegisterParams {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  consents?: Record<string, boolean>;
  ipAddress?: string;
  userAgent?: string;
}

export async function register({
  email,
  password,
  firstName,
  lastName,
  consents,
  ipAddress,
  userAgent,
}: RegisterParams) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
    });

    // Create consent records for each purpose
    const consentData = CONSENT_PURPOSES.map((purpose) => ({
      userId: newUser.id,
      purpose,
      granted: consents?.[purpose] || false,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      grantedAt: consents?.[purpose] ? new Date() : null,
    }));

    await tx.consentRecord.createMany({ data: consentData });

    return newUser;
  });

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

interface LoginParams {
  email: string;
  password: string;
}

export async function login({ email, password }: LoginParams) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);

  return {
    user: sanitizeUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token required');
  }

  try {
    const { payload } = await jwtVerify(refreshToken, refreshSecret);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const accessToken = await generateAccessToken(user);
    const newRefreshToken = await generateRefreshToken(user);

    return {
      user: sanitizeUser(user),
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, 'Invalid refresh token');
  }
}

export async function getProfile(userId: string) {
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

interface ChangePasswordParams {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(
  userId: string,
  { currentPassword, newPassword }: ChangePasswordParams
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { message: 'Password changed successfully' };
}
