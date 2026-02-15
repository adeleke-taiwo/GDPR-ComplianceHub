import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ApiError } from './api-error';

export interface AuthUser {
  userId: string;
  role: string;
}

if (!process.env.JWT_ACCESS_SECRET) {
  throw new Error('JWT_ACCESS_SECRET environment variable is required');
}
const accessSecret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

export async function authenticate(req: NextRequest): Promise<AuthUser> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Authentication required');
  }

  const token = authHeader.split(' ')[1];
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    return {
      userId: payload.userId as string,
      role: payload.role as string,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('expired')) {
      throw new ApiError(401, 'Token expired');
    }
    throw new ApiError(401, 'Invalid token');
  }
}
