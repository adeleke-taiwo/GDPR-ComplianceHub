import { ZodSchema } from 'zod';
import { ApiError } from './api-error';

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    throw new ApiError(400, 'Validation failed', errors);
  }
  return result.data;
}

export function validateQuery<T>(schema: ZodSchema<T>, params: URLSearchParams): T {
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return validateBody(schema, obj);
}
