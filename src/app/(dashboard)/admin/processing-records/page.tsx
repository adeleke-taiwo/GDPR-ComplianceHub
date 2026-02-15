'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processingRecordService } from '@/services/processingRecordService';
import { useAuth } from '@/hooks/useAuth';
import { LEGAL_BASIS_LABELS } from '@/utils/constants';
import { formatDate, formatRetentionPeriod } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import { HiOutlinePlus } from 'react-icons/hi2';
import type { ProcessingRecord } from '@/types';

const emptyForm = {
  purpose: '',
  dataCategories: '',
  legalBasis: 'consent' as string,
  recipientCategories: '',
  retentionPeriodDays: 365,
};

export default function ProcessingRecordsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['processing-records'],
    queryFn: () => processingRecordService.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) => processingRecordService.create({
      ...data,
      retentionPeriodDays: Number(data.retentionPeriodDays),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-records'] });
      setShowForm(false);
      setForm(emptyForm);
      toast.success('Processing record created');
    },
    onError: () => toast.error('Failed to create record'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      processingRecordService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-records'] });
      setEditingId(null);
      setForm(emptyForm);
      toast.success('Record updated');
    },
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => processingRecordService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processing-records'] });
      toast.success('Record deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const records: ProcessingRecord[] = data?.data?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: { ...form, retentionPeriodDays: Number(form.retentionPeriodDays) } });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (record: ProcessingRecord) => {
    setForm({
      purpose: record.purpose,
      dataCategories: record.dataCategories,
      legalBasis: record.legalBasis,
      recipientCategories: record.recipientCategories || '',
      retentionPeriodDays: record.retentionPeriodDays,
    });
    setEditingId(record.id);
    setShowForm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Processing Records</h1>
          <p className="text-sm text-gray-500">GDPR Article 30 — Record of Processing Activities</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add Record
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId ? 'Edit Processing Record' : 'New Processing Record'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
              <input
                required
                value={form.purpose}
                onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Legal Basis</label>
              <select
                value={form.legalBasis}
                onChange={(e) => setForm({ ...form, legalBasis: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              >
                {Object.entries(LEGAL_BASIS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Categories</label>
              <input
                required
                value={form.dataCategories}
                onChange={(e) => setForm({ ...form, dataCategories: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Categories</label>
              <input
                value={form.recipientCategories}
                onChange={(e) => setForm({ ...form, recipientCategories: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retention (days)</label>
              <input
                type="number"
                required
                min={1}
                value={form.retentionPeriodDays}
                onChange={(e) => setForm({ ...form, retentionPeriodDays: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              {editingId ? 'Update' : 'Create'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : records.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">No processing records yet.</p>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm table-striped">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Legal Basis</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Categories</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Retention</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{record.purpose}</td>
                    <td className="px-4 py-3 text-gray-700">{LEGAL_BASIS_LABELS[record.legalBasis]}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{record.dataCategories}</td>
                    <td className="px-4 py-3 text-gray-500">{formatRetentionPeriod(record.retentionPeriodDays)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${record.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                        {record.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(record)} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Edit</button>
                        {user?.role === 'dpo' && (
                          <button
                            onClick={() => { if (confirm('Delete this record?')) deleteMutation.mutate(record.id); }}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >Delete</button>
                        )}
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
