export const API_BASE_URL = '/api/v1';

export const CONSENT_LABELS: Record<string, string> = {
  marketing: 'Marketing Communications',
  analytics: 'Analytics & Usage Data',
  third_party_sharing: 'Third-Party Data Sharing',
  profiling: 'User Profiling',
  newsletter: 'Newsletter Subscription',
};

export const CONSENT_DESCRIPTIONS: Record<string, string> = {
  marketing: 'Allow us to send you promotional materials and marketing communications.',
  analytics: 'Allow us to collect and analyze usage data to improve our services.',
  third_party_sharing: 'Allow us to share your data with trusted third-party partners.',
  profiling: 'Allow us to create user profiles for personalized experiences.',
  newsletter: 'Receive our regular newsletter with updates and news.',
};

export const LEGAL_BASIS_LABELS: Record<string, string> = {
  consent: 'Consent',
  contract: 'Contract',
  legal_obligation: 'Legal Obligation',
  vital_interest: 'Vital Interest',
  public_task: 'Public Task',
  legitimate_interest: 'Legitimate Interest',
};

export const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  detected: 'bg-red-100 text-red-800',
  investigating: 'bg-orange-100 text-orange-800',
  contained: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

export const COOKIE_CATEGORY_LABELS: Record<string, string> = {
  necessary: 'Strictly Necessary',
  analytics: 'Analytics',
  marketing: 'Marketing',
  preferences: 'Preferences',
  functional: 'Functional',
};

export const VENDOR_STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  terminated: 'bg-red-100 text-red-800',
};

export const RISK_LEVEL_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
  very_high: 'bg-red-100 text-red-800',
};

export const DPIA_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  in_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  requires_revision: 'bg-yellow-100 text-yellow-800',
};

export const MITIGATION_STATUS_COLORS: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  not_applicable: 'bg-gray-100 text-gray-600',
};
