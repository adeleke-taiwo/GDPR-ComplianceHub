export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  DPO: 'dpo',
} as const;

export const CONSENT_PURPOSES = [
  'marketing',
  'analytics',
  'third_party_sharing',
  'profiling',
  'newsletter',
] as const;

export const DATA_REQUEST_TYPE = {
  ACCESS: 'access',
  ERASURE: 'erasure',
} as const;

export const DATA_REQUEST_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export const BREACH_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const BREACH_STATUS = {
  DETECTED: 'detected',
  INVESTIGATING: 'investigating',
  CONTAINED: 'contained',
  RESOLVED: 'resolved',
} as const;

export const LEGAL_BASIS = [
  'consent',
  'contract',
  'legal_obligation',
  'vital_interest',
  'public_task',
  'legitimate_interest',
] as const;

export const RETENTION_ACTIONS = {
  ANONYMIZE: 'anonymize',
  DELETE: 'delete',
  ARCHIVE: 'archive',
} as const;
