export type Role = 'user' | 'admin' | 'dpo';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  consentVersion: string;
  createdAt: string;
  updatedAt: string;
  consentRecords?: ConsentRecord[];
}

export interface ConsentRecord {
  id: string;
  userId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  ipAddress?: string;
  userAgent?: string;
  grantedAt?: string;
  revokedAt?: string;
  createdAt: string;
}

export type ConsentPurpose = 'marketing' | 'analytics' | 'third_party_sharing' | 'profiling' | 'newsletter';

export interface ConsentStatus {
  purpose: ConsentPurpose;
  granted: boolean;
  grantedAt: string | null;
  revokedAt: string | null;
}

export interface DataRequest {
  id: string;
  userId: string;
  type: 'access' | 'erasure';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  processedById?: string;
  responseUrl?: string;
  notes?: string;
  requestedAt: string;
  completedAt?: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  processedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface ProcessingRecord {
  id: string;
  purpose: string;
  dataCategories: string;
  legalBasis: LegalBasis;
  recipientCategories?: string;
  retentionPeriodDays: number;
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export type LegalBasis = 'consent' | 'contract' | 'legal_obligation' | 'vital_interest' | 'public_task' | 'legitimate_interest';

export interface BreachNotification {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedDataTypes: string;
  affectedUserCount: number;
  discoveredAt: string;
  reportedToAuthorityAt?: string;
  notifiedUsersAt?: string;
  status: 'detected' | 'investigating' | 'contained' | 'resolved';
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  _count?: { breachUserNotifications: number };
}

export interface BreachUserNotification {
  id: string;
  breachId: string;
  userId: string;
  notifiedAt: string;
  acknowledgedAt?: string;
  breach: Pick<BreachNotification, 'id' | 'title' | 'description' | 'severity' | 'affectedDataTypes' | 'discoveredAt' | 'status'>;
}

export interface RetentionPolicy {
  id: string;
  dataCategory: string;
  retentionPeriodDays: number;
  action: 'anonymize' | 'delete' | 'archive';
  isActive: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
  actor?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export interface UserDashboardStats {
  consentRate: number;
  grantedConsents: number;
  totalConsents: number;
  pendingRequests: number;
  unacknowledgedBreaches: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingRequests: number;
  activeBreaches: number;
  totalAuditLogs: number;
  processingRecords: number;
  retentionPolicies: number;
  consentRate: number;
}

export interface DpoDashboardStats {
  totalDPIAs: number;
  dpiasPendingReview: number;
  highRiskVendors: number;
  activeBreaches: number;
  pendingRequests: number;
  retentionPolicies: number;
  consentRate: number;
  dpiasPendingList: Array<{
    id: string;
    title: string;
    riskLevel: DPIARiskLevel;
    status: DPIAStatus;
    updatedAt: string;
    createdBy: { firstName: string; lastName: string };
  }>;
  recentBreaches: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    discoveredAt: string;
    reportedToAuthorityAt?: string;
  }>;
  highRiskVendorsList: Array<{
    id: string;
    name: string;
    riskLevel: VendorRiskLevel;
    status: VendorStatus;
    country?: string;
  }>;
}

export type CookieCategory = 'necessary' | 'analytics' | 'marketing' | 'preferences' | 'functional';

export interface Cookie {
  id: string;
  name: string;
  category: CookieCategory;
  domain: string;
  path: string;
  description: string;
  purpose: string;
  duration: string;
  isFirstParty: boolean;
  vendorId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vendor?: Pick<Vendor, 'id' | 'name'>;
}

export interface CookieConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  functional: boolean;
}

export interface CookieConsentRecord {
  id: string;
  userId?: string;
  sessionId: string;
  cookieId?: string;
  category?: CookieCategory;
  granted: boolean;
  ipAddress?: string;
  userAgent?: string;
  consentVersion: string;
  grantedAt: string;
  expiresAt?: string;
  revokedAt?: string;
}

export interface CookieScan {
  id: string;
  domain: string;
  scannedById: string;
  cookiesFound: number;
  scanResults: Record<string, unknown>;
  status: string;
  scannedAt: string;
}

export type VendorStatus = 'active' | 'inactive' | 'under_review' | 'terminated';
export type VendorRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Vendor {
  id: string;
  name: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  country?: string;
  status: VendorStatus;
  riskLevel: VendorRiskLevel;
  isSubProcessor: boolean;
  parentVendorId?: string;
  dataProcessingAgreement?: string;
  dpaSignedAt?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  lastAuditDate?: string;
  nextAuditDate?: string;
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  parentVendor?: Pick<Vendor, 'id' | 'name'>;
  subProcessors?: Array<Pick<Vendor, 'id' | 'name' | 'status' | 'riskLevel'>>;
  _count?: {
    subProcessors: number;
    processingRecords: number;
    riskAssessments: number;
  };
}

export interface VendorRiskAssessment {
  id: string;
  vendorId: string;
  assessedById: string;
  riskLevel: VendorRiskLevel;
  dataAccessScope: string;
  securityMeasures: string;
  complianceCertifications?: string;
  findings?: string;
  recommendations?: string;
  assessmentDate: string;
  nextReviewDate?: string;
  createdAt: string;
  assessedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export type DPIAStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'requires_revision';
export type DPIARiskLevel = 'low' | 'medium' | 'high' | 'very_high';
export type DPIAMitigationStatus = 'planned' | 'in_progress' | 'completed' | 'not_applicable';

export interface DPIA {
  id: string;
  title: string;
  description: string;
  processingRecordId?: string;
  dataTypes: string;
  dataSubjects: string;
  processingPurpose: string;
  legalBasis: LegalBasis;
  necessityJustification: string;
  riskLevel: DPIARiskLevel;
  status: DPIAStatus;
  reviewedById?: string;
  reviewedAt?: string;
  approvedById?: string;
  approvedAt?: string;
  reviewNotes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  reviewedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  approvedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
  processingRecord?: Pick<ProcessingRecord, 'id' | 'purpose'>;
  risks?: DPIARisk[];
  mitigations?: DPIAMitigation[];
  _count?: {
    risks: number;
    mitigations: number;
  };
}

export interface DPIARisk {
  id: string;
  dpiaId: string;
  title: string;
  description: string;
  riskLevel: DPIARiskLevel;
  likelihood: number;
  impact: number;
  affectedRights?: string;
  createdAt: string;
  updatedAt: string;
  mitigations?: DPIAMitigation[];
}

export interface DPIAMitigation {
  id: string;
  dpiaId: string;
  riskId?: string;
  title: string;
  description: string;
  status: DPIAMitigationStatus;
  responsiblePerson?: string;
  deadline?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
