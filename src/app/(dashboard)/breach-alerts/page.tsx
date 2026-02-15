'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { breachService } from '@/services/breachService';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import { HiOutlineExclamationTriangle, HiOutlineCheck } from 'react-icons/hi2';
import type { BreachUserNotification } from '@/types';

export default function BreachAlertsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-breach-notifications'],
    queryFn: () => breachService.getMyNotifications(),
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: string) => breachService.acknowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-breach-notifications'] });
      toast.success('Breach notification acknowledged');
    },
    onError: () => toast.error('Failed to acknowledge'),
  });

  const notifications: BreachUserNotification[] = data?.data?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Breach Alerts</h1>
      <p className="text-gray-500 mb-6">
        Data breach notifications that may affect your personal data.
      </p>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <HiOutlineExclamationTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No breach notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{notification.breach.title}</h3>
                    <StatusBadge status={notification.breach.severity} type="severity" />
                    <StatusBadge status={notification.breach.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{notification.breach.description}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>Affected Data: {notification.breach.affectedDataTypes}</span>
                    <span>Discovered: {formatDateTime(notification.breach.discoveredAt)}</span>
                    <span>Notified: {formatDateTime(notification.notifiedAt)}</span>
                  </div>
                </div>
                <div className="shrink-0">
                  {notification.acknowledgedAt ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                      <HiOutlineCheck className="h-4 w-4" />
                      Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => acknowledgeMutation.mutate(notification.id)}
                      disabled={acknowledgeMutation.isPending}
                      className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 disabled:opacity-50"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
