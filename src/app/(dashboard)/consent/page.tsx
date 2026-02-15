'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consentService } from '@/services/consentService';
import { CONSENT_LABELS, CONSENT_DESCRIPTIONS } from '@/utils/constants';
import { formatDateTime } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import type { ConsentStatus, ConsentRecord } from '@/types';

const purposes = ['marketing', 'analytics', 'third_party_sharing', 'profiling', 'newsletter'] as const;

export default function ConsentManagementPage() {
  const queryClient = useQueryClient();
  const [showHistory, setShowHistory] = useState(false);

  const { data: consentData, isLoading } = useQuery({
    queryKey: ['my-consent'],
    queryFn: () => consentService.getMyConsent(),
  });

  const { data: historyData } = useQuery({
    queryKey: ['consent-history'],
    queryFn: () => consentService.getHistory(),
    enabled: showHistory,
  });

  const updateMutation = useMutation({
    mutationFn: (consents: Record<string, boolean>) => consentService.updateConsent(consents),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-consent'] });
      queryClient.invalidateQueries({ queryKey: ['consent-history'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Consent preferences updated');
    },
    onError: () => toast.error('Failed to update preferences'),
  });

  const consents: ConsentStatus[] = consentData?.data?.data || [];
  const history: ConsentRecord[] = historyData?.data?.data || [];

  const handleToggle = (purpose: string, currentValue: boolean) => {
    updateMutation.mutate({ [purpose]: !currentValue });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Consent Management</h1>
      <p className="text-gray-500 mb-6">
        Manage how your data is used. You can change your preferences at any time.
      </p>

      <div className="bg-white rounded-lg shadow divide-y">
        {purposes.map((purpose) => {
          const consent = consents.find((c) => c.purpose === purpose);
          const granted = consent?.granted || false;

          return (
            <div key={purpose} className="p-4 flex items-center justify-between">
              <div className="flex-1 mr-4">
                <h3 className="text-sm font-medium text-gray-900">{CONSENT_LABELS[purpose]}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{CONSENT_DESCRIPTIONS[purpose]}</p>
                {consent?.grantedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Granted: {formatDateTime(consent.grantedAt)}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleToggle(purpose, granted)}
                disabled={updateMutation.isPending}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  granted ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    granted ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          {showHistory ? 'Hide History' : 'View Consent History'}
        </button>

        {showHistory && history.length > 0 && (
          <div className="mt-4 bg-white rounded-lg shadow overflow-hidden max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm table-striped">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 text-gray-900">{CONSENT_LABELS[record.purpose] || record.purpose}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${record.granted ? 'text-green-600' : 'text-red-600'}`}>
                        {record.granted ? 'Granted' : 'Revoked'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDateTime(record.createdAt)}</td>
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
