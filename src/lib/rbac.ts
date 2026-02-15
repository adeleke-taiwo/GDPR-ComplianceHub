import { ApiError } from './api-error';

export function authorize(userRole: string, ...allowedRoles: string[]): void {
  if (!allowedRoles.includes(userRole)) {
    throw new ApiError(403, 'Insufficient permissions');
  }
}
