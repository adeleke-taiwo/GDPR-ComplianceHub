'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { breachService } from '@/services/breachService';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineBellAlert } from 'react-icons/hi2';
import type { BreachNotification } from '@/types';

const emptyForm = {
  title: '',
  description: '',
  severity: 'medium' as string,
  affectedDataTypes: '',
  affectedUserCount: 0,
};

export default function BreachManagementPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['breaches', statusFilter],
    queryFn: () => breachService.getAll({ status: statusFilter }),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => breachService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaches'] });
      setShowForm(false);
      setForm(emptyForm);
      toast.success('Breach reported');
    },
    onError: () => toast.error('Failed to report breach'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      breachService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['breaches'] });
      setEditingId(null);
      setShowForm(false);
      toast.success('Breach updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  const notifyMutation = useMutation({
    mutationFn: (id: string) => breachService.notifyUsers(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['breaches'] });
      toast.success(res.data.message);
    },
    onError: () => toast.error('Failed to notify users'),
  });

  const breaches: BreachNotification[] = data?.data?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Breach Management</h1>
          <p className="text-sm text-gray-500">Track and manage data breaches (GDPR Articles 33-34)</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Report Breach
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Update Breach' : 'Report New Breach'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Affected Data Types</label>
              <input required value={form.affectedDataTypes} onChange={(e) => setForm({ ...form, affectedDataTypes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. email, passwords, names" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
              {editingId ? 'Update' : 'Report Breach'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="flex gap-4 mb-4">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Statuses</option>
          <option value="detected">Detected</option>
          <option value="investigating">Investigating</option>
          <option value="contained">Contained</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      ) : breaches.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No breaches recorded.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {breaches.map((breach) => (
            <div key={breach.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{breach.title}</h3>
                    <StatusBadge status={breach.severity} type="severity" />
                    <StatusBadge status={breach.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{breach.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Affected: {breach.affectedDataTypes}</span>
                    <span>Users: {breach.affectedUserCount}</span>
                    <span>Discovered: {formatDateTime(breach.discoveredAt)}</span>
                    {breach.notifiedUsersAt && <span>Notified: {formatDateTime(breach.notifiedUsersAt)}</span>}
                    <span>By: {breach.createdBy?.firstName} {breach.createdBy?.lastName}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  {breach.status !== 'resolved' && (
                    <>
                      <select
                        value={breach.status}
                        onChange={(e) => updateMutation.mutate({ id: breach.id, data: { status: e.target.value } })}
                        className="text-xs border border-gray-300 rounded px-2 py-1 outline-none"
                      >
                        <option value="detected">Detected</option>
                        <option value="investigating">Investigating</option>
                        <option value="contained">Contained</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <button
                        onClick={() => notifyMutation.mutate(breach.id)}
                        disabled={notifyMutation.isPending}
                        className="flex items-center gap-1 px-3 py-1 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 disabled:opacity-50"
                      >
                        <HiOutlineBellAlert className="h-3 w-3" />
                        Notify
                      </button>
                    </>
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
