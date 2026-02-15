'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/auditService';
import { formatDateTime } from '@/utils/dateUtils';
import type { AuditLog } from '@/types';

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ action: '', resource: '', page: 1 });

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditService.getLogs(filters),
  });

  const logs: AuditLog[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by action..."
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value, page: 1 })}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="text"
          placeholder="Filter by resource..."
          value={filters.resource}
          onChange={(e) => setFilters({ ...filters, resource: e.target.value, page: 1 })}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : logs.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">No audit logs found.</p>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm table-striped">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3">
                      {log.actor ? (
                        <div>
                          <p className="font-medium text-gray-900">{log.actor.firstName} {log.actor.lastName}</p>
                          <p className="text-xs text-gray-500">{log.actor.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">System</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{log.resource}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{log.resourceId ? log.resourceId.substring(0, 8) + '...' : '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{log.ipAddress || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} entries)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setFilters({ ...filters, page: filters.page - 1 })} disabled={filters.page === 1} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setFilters({ ...filters, page: filters.page + 1 })} disabled={filters.page >= pagination.totalPages} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
