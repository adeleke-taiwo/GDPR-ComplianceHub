'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { dashboardService } from '@/services/dashboardService';
import { consentService } from '@/services/consentService';
import { dataRequestService } from '@/services/dataRequestService';
import { auditService } from '@/services/auditService';
import { breachService } from '@/services/breachService';
import {
  CONSENT_LABELS,
  STATUS_COLORS,
  SEVERITY_COLORS,
  DPIA_STATUS_COLORS,
  RISK_LEVEL_COLORS,
} from '@/utils/constants';
import { timeAgo } from '@/utils/dateUtils';
import StatCard from '@/components/common/StatCard';
import {
  HiOutlineShieldCheck,
  HiOutlineUsers,
  HiOutlineClipboardDocumentList,
  HiOutlineExclamationTriangle,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineListBullet,
  HiOutlineChartBar,
  HiOutlineArrowDownTray,
  HiOutlineTrash,
  HiOutlineCog6Tooth,
  HiOutlineBell,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineShieldExclamation,
  HiOutlineBuildingOffice2,
} from 'react-icons/hi2';
import ConsentDoughnutChart from '@/components/charts/ConsentDoughnutChart';
import UserStatsBarChart from '@/components/charts/UserStatsBarChart';
import ComplianceSummaryChart from '@/components/charts/ComplianceSummaryChart';
import type {
  UserDashboardStats,
  AdminDashboardStats,
  DpoDashboardStats,
  ConsentStatus,
  AuditLog,
  DataRequest,
  BreachUserNotification,
} from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardService.getStats(),
  });

  const stats = data?.data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user?.firstName}! Here&apos;s your {user?.role === 'dpo' ? 'compliance' : user?.role === 'admin' ? 'administration' : 'privacy'} overview.
        </p>
      </div>

      {user?.role === 'user' && <UserDashboard stats={stats as UserDashboardStats} />}
      {user?.role === 'admin' && <AdminDashboard stats={stats as AdminDashboardStats} />}
      {user?.role === 'dpo' && <DPODashboard stats={stats as DpoDashboardStats} />}
    </div>
  );
}

function UserDashboard({ stats }: { stats: UserDashboardStats }) {
  const { data: consentData } = useQuery({
    queryKey: ['my-consent'],
    queryFn: () => consentService.getMyConsent(),
    staleTime: 0,
  });

  const { data: breachData } = useQuery({
    queryKey: ['my-breach-notifications'],
    queryFn: () => breachService.getMyNotifications(1, 5),
  });

  const consents: ConsentStatus[] = consentData?.data?.data || [];
  const breaches: BreachUserNotification[] = breachData?.data?.data || [];
  const unacknowledged = breaches.filter(b => !b.acknowledgedAt);

  const total = 5;
  const granted = consents.filter(c => c.granted).length;
  const consentRatePct = Math.round((granted / total) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Consent Rate" value={`${consentRatePct}%`} icon={HiOutlineShieldCheck} color="text-green-600" />
        <StatCard title="Pending Requests" value={stats?.pendingRequests ?? 0} icon={HiOutlineClipboardDocumentList} color="text-yellow-600" />
        <StatCard title="Breach Alerts" value={stats?.unacknowledgedBreaches ?? 0} icon={HiOutlineExclamationTriangle} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Consent Overview</h2>
            <Link href="/consent" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              Manage <HiOutlineArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <ConsentDoughnutChart granted={granted} total={total} />
          <div className="space-y-3 mt-2">
            {consents.length > 0 ? consents.map((c) => (
              <div key={c.purpose} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{CONSENT_LABELS[c.purpose] || c.purpose}</span>
                {c.granted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                    <HiOutlineCheckCircle className="h-4 w-4" /> Granted
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400">
                    <HiOutlineXCircle className="h-4 w-4" /> Not granted
                  </span>
                )}
              </div>
            )) : (
              <p className="text-sm text-gray-400">No consent preferences set yet. <Link href="/consent" className="text-primary-600 underline">Set them now</Link>.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/consent" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
                <HiOutlineCog6Tooth className="h-4 w-4 text-primary-600" /> Manage Consent
              </Link>
              <Link href="/my-data" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
                <HiOutlineArrowDownTray className="h-4 w-4 text-secondary-600" /> Export My Data
              </Link>
              <Link href="/my-data" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
                <HiOutlineTrash className="h-4 w-4 text-red-600" /> Request Erasure
              </Link>
              <Link href="/breach-alerts" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
                <HiOutlineBell className="h-4 w-4 text-yellow-600" /> Breach Alerts
              </Link>
            </div>
          </div>

          {unacknowledged.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-red-600 flex items-center gap-1.5">
                  <HiOutlineExclamationTriangle className="h-4 w-4" /> Unacknowledged Alerts
                </h2>
                <Link href="/breach-alerts" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  View all <HiOutlineArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {unacknowledged.slice(0, 3).map((n) => (
                  <div key={n.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{n.breach.title}</p>
                      <p className="text-xs text-gray-500">{timeAgo(n.notifiedAt)}</p>
                    </div>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[n.breach.severity] || ''}`}>
                      {n.breach.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ stats }: { stats: AdminDashboardStats }) {
  const { data: requestData } = useQuery({
    queryKey: ['recent-requests'],
    queryFn: () => dataRequestService.getAll({ status: 'pending', limit: 5 }),
  });

  const { data: auditData } = useQuery({
    queryKey: ['recent-audit'],
    queryFn: () => auditService.getLogs({ limit: 8 }),
  });

  const requests: DataRequest[] = requestData?.data?.data || [];
  const auditLogs: AuditLog[] = auditData?.data?.data || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} icon={HiOutlineUsers} color="text-primary-600" />
        <StatCard title="Active Users" value={stats?.activeUsers ?? 0} icon={HiOutlineUsers} color="text-green-600" />
        <StatCard title="Consent Rate" value={`${stats?.consentRate ?? 0}%`} icon={HiOutlineChartBar} color="text-primary-600" />
        <StatCard title="Pending Requests" value={stats?.pendingRequests ?? 0} icon={HiOutlineClipboardDocumentList} color="text-yellow-600" />
        <StatCard title="Active Breaches" value={stats?.activeBreaches ?? 0} icon={HiOutlineExclamationTriangle} color="text-red-600" />
        <StatCard title="Processing Records" value={stats?.processingRecords ?? 0} icon={HiOutlineDocumentText} color="text-purple-600" />
        <StatCard title="Retention Policies" value={stats?.retentionPolicies ?? 0} icon={HiOutlineClock} color="text-orange-600" />
        <StatCard title="Audit Entries" value={stats?.totalAuditLogs ?? 0} icon={HiOutlineListBullet} color="text-gray-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Platform Consent Rate</h2>
          <ConsentDoughnutChart granted={Math.round(((stats?.consentRate ?? 0) / 100) * (stats?.activeUsers ?? 1) * 5)} total={(stats?.activeUsers ?? 1) * 5} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">User Activity</h2>
          <UserStatsBarChart totalUsers={stats?.totalUsers ?? 0} activeUsers={stats?.activeUsers ?? 0} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Open Issues</h2>
          <ComplianceSummaryChart consentRate={stats?.consentRate ?? 0} pendingRequests={stats?.pendingRequests ?? 0} activeBreaches={stats?.activeBreaches ?? 0} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Pending Data Requests</h2>
            <Link href="/admin/data-requests" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <HiOutlineArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.user?.firstName} {r.user?.lastName}</p>
                    <p className="text-xs text-gray-500">{r.user?.email}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.type === 'erasure' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {r.type === 'access' ? 'Export' : 'Erasure'}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(r.requestedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <HiOutlineCheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No pending requests</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Activity</h2>
            <Link href="/admin/audit-log" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              Full log <HiOutlineArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {auditLogs.length > 0 ? (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0"><ActivityIcon action={log.action} /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">
                      <span className="font-medium">{log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'System'}</span>
                      {' '}<span className="text-gray-500">{formatAction(log.action, log.resource)}</span>
                    </p>
                    <p className="text-xs text-gray-400">{timeAgo(log.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <HiOutlineListBullet className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/data-requests" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
            <HiOutlineClipboardDocumentList className="h-4 w-4 text-yellow-600" /> Data Requests
          </Link>
          <Link href="/admin/audit-log" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
            <HiOutlineListBullet className="h-4 w-4 text-gray-600" /> Audit Log
          </Link>
          <Link href="/admin/processing-records" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
            <HiOutlineDocumentText className="h-4 w-4 text-purple-600" /> Processing Records
          </Link>
          <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
            <HiOutlineUsers className="h-4 w-4 text-primary-600" /> Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
}

function DPODashboard({ stats }: { stats: DpoDashboardStats }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Platform Consent Rate" value={`${stats?.consentRate ?? 0}%`} icon={HiOutlineShieldCheck} color="text-green-600" />
        <StatCard title="DPIAs Pending Review" value={stats?.dpiasPendingReview ?? 0} icon={HiOutlineShieldExclamation} color="text-blue-600" />
        <StatCard title="Active Breaches" value={stats?.activeBreaches ?? 0} icon={HiOutlineExclamationTriangle} color="text-red-600" />
        <StatCard title="High-Risk Vendors" value={stats?.highRiskVendors ?? 0} icon={HiOutlineBuildingOffice2} color="text-orange-600" />
        <StatCard title="Pending Data Requests" value={stats?.pendingRequests ?? 0} icon={HiOutlineClipboardDocumentList} color="text-yellow-600" />
        <StatCard title="Retention Policies" value={stats?.retentionPolicies ?? 0} icon={HiOutlineClock} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <HiOutlineShieldExclamation className="h-4 w-4 text-blue-600" /> DPIAs Awaiting Review
            </h2>
            <Link href="/admin/dpias" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              View all <HiOutlineArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {stats?.dpiasPendingList?.length > 0 ? (
            <div className="space-y-3">
              {stats.dpiasPendingList.map((dpia) => (
                <div key={dpia.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{dpia.title}</p>
                    <p className="text-xs text-gray-500">
                      by {dpia.createdBy.firstName} {dpia.createdBy.lastName} · {timeAgo(dpia.updatedAt)}
                    </p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${RISK_LEVEL_COLORS[dpia.riskLevel]}`}>
                    {dpia.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <HiOutlineCheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No DPIAs pending review</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <HiOutlineExclamationTriangle className="h-4 w-4 text-red-600" /> Active Breach Incidents
            </h2>
            <Link href="/admin/breaches" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              Manage <HiOutlineArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {stats?.recentBreaches?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentBreaches.map((breach) => (
                <div key={breach.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{breach.title}</p>
                    <p className="text-xs text-gray-500">
                      Discovered {timeAgo(breach.discoveredAt)}
                      {!breach.reportedToAuthorityAt && (
                        <span className="ml-2 text-red-500 font-medium">· Not yet reported</span>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SEVERITY_COLORS[breach.severity] || ''}`}>
                      {breach.severity}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[breach.status] || ''}`}>
                      {breach.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <HiOutlineCheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">No active breaches</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <HiOutlineBuildingOffice2 className="h-4 w-4 text-orange-600" /> High-Risk Vendors
          </h2>
          <Link href="/admin/vendors" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            View all <HiOutlineArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {stats?.highRiskVendorsList?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.highRiskVendorsList.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                  {vendor.country && <p className="text-xs text-gray-500">{vendor.country}</p>}
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RISK_LEVEL_COLORS[vendor.riskLevel]}`}>
                  {vendor.riskLevel}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <HiOutlineCheckCircle className="h-8 w-8 mx-auto mb-2" />
            <p className="text-sm">No high-risk active vendors</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/dpias" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
            <HiOutlineShieldExclamation className="h-4 w-4 text-blue-600" /> DPIAs
          </Link>
          <Link href="/admin/breaches" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
            <HiOutlineExclamationTriangle className="h-4 w-4 text-red-600" /> Breaches
          </Link>
          <Link href="/admin/vendors" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-orange-300 hover:bg-orange-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
            <HiOutlineBuildingOffice2 className="h-4 w-4 text-orange-600" /> Vendors
          </Link>
          <Link href="/admin/retention" className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 text-sm text-gray-700">
            <HiOutlineClock className="h-4 w-4 text-purple-600" /> Retention
          </Link>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon({ action }: { action: string }) {
  const base = 'h-4 w-4';
  if (action.includes('LOGIN') || action.includes('REGISTER')) return <HiOutlineUsers className={`${base} text-primary-500`} />;
  if (action.includes('CONSENT')) return <HiOutlineShieldCheck className={`${base} text-green-500`} />;
  if (action.includes('BREACH')) return <HiOutlineExclamationTriangle className={`${base} text-red-500`} />;
  if (action.includes('DATA_REQUEST') || action.includes('EXPORT')) return <HiOutlineClipboardDocumentList className={`${base} text-yellow-500`} />;
  return <HiOutlineListBullet className={`${base} text-gray-400`} />;
}

function formatAction(action: string, resource: string): string {
  const map: Record<string, string> = {
    LOGIN: 'logged in',
    REGISTER: 'registered an account',
    CONSENT_UPDATE: 'updated consent preferences',
    CONSENT_GRANT: 'granted consent',
    CONSENT_REVOKE: 'revoked consent',
    DATA_REQUEST_CREATE: 'submitted a data request',
    DATA_REQUEST_PROCESS: 'processed a data request',
    DATA_EXPORT: 'exported their data',
    BREACH_CREATE: 'reported a breach',
    BREACH_UPDATE: 'updated a breach',
    BREACH_NOTIFY: 'sent breach notifications',
    USER_UPDATE: 'updated a user',
  };
  return map[action] || `${action.toLowerCase().replace(/_/g, ' ')} on ${resource.toLowerCase()}`;
}
