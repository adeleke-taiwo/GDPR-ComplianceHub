import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from './api-error';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

type RouteHandler = (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) => Promise<NextResponse>;

export function apiHandler(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { success: false, message: err.message, errors: err.errors },
          { status: err.statusCode }
        );
      }

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          return NextResponse.json(
            { success: false, message: 'A record with this value already exists' },
            { status: 409 }
          );
        }
        if (err.code === 'P2025') {
          return NextResponse.json(
            { success: false, message: 'Record not found' },
            { status: 404 }
          );
        }
      }

      if (err instanceof ZodError) {
        const errors = err.issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return NextResponse.json(
          { success: false, message: 'Validation failed', errors },
          { status: 400 }
        );
      }

      if (err instanceof SyntaxError && err.message.includes('JSON')) {
        return NextResponse.json(
          { success: false, message: 'Invalid request body' },
          { status: 400 }
        );
      }

      console.error('Unhandled error:', err);
      return NextResponse.json(
        {
          success: false,
          message: err instanceof Error ? err.message : 'Internal server error',
        },
        { status: 500 }
      );
    }
  };
}
