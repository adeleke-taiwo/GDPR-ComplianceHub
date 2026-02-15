'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataRequestService } from '@/services/dataRequestService';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import type { DataRequest } from '@/types';

export default function DataRequestsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processForm, setProcessForm] = useState({ status: 'completed', notes: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-data-requests', statusFilter, typeFilter, page],
    queryFn: () => dataRequestService.getAll({ status: statusFilter, type: typeFilter, page }),
  });

  const processMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; notes?: string } }) =>
      dataRequestService.process(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-data-requests'] });
      setProcessingId(null);
      toast.success('Request processed successfully');
    },
    onError: (err: Error) => { const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message; toast.error(msg || 'Failed to process'); },
  });

  const requests: DataRequest[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Data Requests</h1>

      <div className="flex gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Types</option>
          <option value="access">Access</option>
          <option value="erasure">Erasure</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">No data requests found.</p>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm table-striped">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed By</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{req.user?.firstName} {req.user?.lastName}</p>
                      <p className="text-xs text-gray-500">{req.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize font-medium text-gray-700">{req.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(req.requestedAt)}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {req.processedBy ? `${req.processedBy.firstName} ${req.processedBy.lastName}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {(req.status === 'pending' || req.status === 'processing') && (
                        <button
                          onClick={() => { setProcessingId(req.id); setProcessForm({ status: 'completed', notes: '' }); }}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Process
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Process Modal */}
      {processingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Decision</label>
                <select
                  value={processForm.status}
                  onChange={(e) => setProcessForm({ ...processForm, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="processing">Mark as Processing</option>
                  <option value="completed">Complete</option>
                  <option value="rejected">Reject</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={processForm.notes}
                  onChange={(e) => setProcessForm({ ...processForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setProcessingId(null)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => processMutation.mutate({
                    id: processingId,
                    data: { status: processForm.status, notes: processForm.notes || undefined },
                  })}
                  disabled={processMutation.isPending}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {processMutation.isPending ? 'Processing...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
