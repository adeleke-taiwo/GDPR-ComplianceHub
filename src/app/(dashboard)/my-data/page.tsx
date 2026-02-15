'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataRequestService } from '@/services/dataRequestService';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import { HiOutlineArrowDownTray, HiOutlineTrash, HiOutlineDocumentText } from 'react-icons/hi2';
import type { DataRequest } from '@/types';

export default function MyDataPage() {
  const queryClient = useQueryClient();
  const [exporting, setExporting] = useState(false);

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ['my-data-requests'],
    queryFn: () => dataRequestService.getMyRequests(),
  });

  const createMutation = useMutation({
    mutationFn: (type: 'access' | 'erasure') => dataRequestService.create(type),
    onSuccess: (_, type) => {
      queryClient.invalidateQueries({ queryKey: ['my-data-requests'] });
      toast.success(`${type === 'access' ? 'Data access' : 'Data erasure'} request submitted`);
    },
    onError: (err: Error) => { const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message; toast.error(msg || 'Request failed'); },
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await dataRequestService.exportMyData();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Data exported successfully');
    } catch {
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  const requests: DataRequest[] = requestsData?.data?.data || [];

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Data</h1>
      <p className="text-gray-500 mb-6">
        Exercise your GDPR data rights. Export your data, submit an access request, or request erasure.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <HiOutlineArrowDownTray className="h-6 w-6 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">Export My Data</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Download a copy of all your personal data in JSON format (GDPR Article 15).
          </p>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
          >
            {exporting ? 'Exporting...' : 'Download My Data'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <HiOutlineDocumentText className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Request Access</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Submit a formal access request for admin review (GDPR Article 15 — Right of Access).
          </p>
          <button
            onClick={() => createMutation.mutate('access')}
            disabled={createMutation.isPending}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Submitting...' : 'Request Access'}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-3">
            <HiOutlineTrash className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Request Erasure</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Request deletion of your personal data (GDPR Article 17 — Right to be Forgotten).
          </p>
          <button
            onClick={() => {
              if (confirm('Are you sure? This will request permanent deletion of your data.')) {
                createMutation.mutate('erasure');
              }
            }}
            disabled={createMutation.isPending}
            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {createMutation.isPending ? 'Submitting...' : 'Request Data Erasure'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Request History</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <p className="p-6 text-sm text-gray-500 text-center">No data requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {requests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-4 py-3 capitalize font-medium text-gray-900">{req.type}</td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(req.requestedAt)}</td>
                    <td className="px-4 py-3 text-gray-500">{req.completedAt ? formatDateTime(req.completedAt) : '-'}</td>
                    <td className="px-4 py-3 text-gray-500">{req.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
