import prisma from './prisma';

interface AuditLogInput {
  actorId: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
}

const SENSITIVE_FIELDS = ['password', 'passwordHash', 'currentPassword', 'newPassword', 'token', 'refreshToken'];

export function sanitizeBody(body: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const sanitized = { ...body };
  for (const field of SENSITIVE_FIELDS) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
}

export async function createAuditLog({ actorId, action, resource, resourceId, details, ipAddress }: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        resource,
        resourceId: resourceId || undefined,
        details: (details as Record<string, string | number | boolean | null>) || undefined,
        ipAddress: ipAddress || undefined,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error instanceof Error ? error.message : error);
  }
}
