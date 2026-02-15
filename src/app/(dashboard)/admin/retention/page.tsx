'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { retentionService } from '@/services/retentionService';
import { formatDate, formatRetentionPeriod } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import { HiOutlinePlus } from 'react-icons/hi2';
import type { RetentionPolicy } from '@/types';

const emptyForm = {
  dataCategory: '',
  retentionPeriodDays: 365,
  action: 'delete' as string,
};

export default function RetentionPoliciesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['retention-policies'],
    queryFn: () => retentionService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => retentionService.create({
      ...data,
      retentionPeriodDays: Number(data.retentionPeriodDays),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
      setShowForm(false);
      setForm(emptyForm);
      toast.success('Policy created');
    },
    onError: () => toast.error('Failed to create policy'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      retentionService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
      setEditingId(null);
      setShowForm(false);
      toast.success('Policy updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => retentionService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['retention-policies'] });
      toast.success('Policy deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const policies: RetentionPolicy[] = data?.data?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { ...form, retentionPeriodDays: Number(form.retentionPeriodDays) } });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (policy: RetentionPolicy) => {
    setForm({
      dataCategory: policy.dataCategory,
      retentionPeriodDays: policy.retentionPeriodDays,
      action: policy.action,
    });
    setEditingId(policy.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retention Policies</h1>
          <p className="text-sm text-gray-500">Configure data retention rules per category</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add Policy
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit Policy' : 'New Retention Policy'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Category</label>
              <input required value={form.dataCategory} onChange={(e) => setForm({ ...form, dataCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retention (days)</label>
              <input type="number" required min={1} value={form.retentionPeriodDays}
                onChange={(e) => setForm({ ...form, retentionPeriodDays: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500">
                <option value="delete">Delete</option>
                <option value="anonymize">Anonymize</option>
                <option value="archive">Archive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : policies.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">No retention policies yet.</p>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm table-striped">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {policies.map((policy) => (
                  <tr key={policy.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{policy.dataCategory}</td>
                    <td className="px-4 py-3 text-gray-500">{formatRetentionPeriod(policy.retentionPeriodDays)}</td>
                    <td className="px-4 py-3 capitalize text-gray-700">{policy.action}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${policy.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {policy.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(policy.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(policy)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Edit</button>
                        <button
                          onClick={() => { if (confirm('Delete this policy?')) deleteMutation.mutate(policy.id); }}
                          className="text-xs text-red-600 hover:text-red-700 font-medium"
                        >Delete</button>
                      </div>
                    </td>
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
