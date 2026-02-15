'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { vendorService } from '@/services/vendorService';
import type { Vendor } from '@/types';
import { VENDOR_STATUS_COLORS, RISK_LEVEL_COLORS } from '@/utils/constants';

export default function VendorManagementPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    contactEmail: '',
    contactPhone: '',
    country: '',
    status: 'active',
    riskLevel: 'medium',
    isSubProcessor: false,
    notes: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['vendors', statusFilter],
    queryFn: () => vendorService.getAll({ status: statusFilter || undefined }),
  });

  const { data: vendorDetails } = useQuery({
    queryKey: ['vendor', selectedVendor],
    queryFn: () => vendorService.getById(selectedVendor!),
    enabled: !!selectedVendor,
  });

  const createMutation = useMutation({
    mutationFn: vendorService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vendors'] }); toast.success('Vendor created successfully'); resetForm(); },
    onError: (error: Error) => { const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message; toast.error(msg || 'Failed to create vendor'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => vendorService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vendors'] }); toast.success('Vendor updated successfully'); resetForm(); },
    onError: (error: Error) => { const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message; toast.error(msg || 'Failed to update vendor'); },
  });

  const deleteMutation = useMutation({
    mutationFn: vendorService.remove,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vendors'] }); toast.success('Vendor deleted successfully'); },
    onError: (error: Error) => { const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message; toast.error(msg || 'Failed to delete vendor'); },
  });

  const resetForm = () => {
    setForm({ name: '', description: '', website: '', contactEmail: '', contactPhone: '', country: '', status: 'active', riskLevel: 'medium', isSubProcessor: false, notes: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) { updateMutation.mutate({ id: editingId, data: form }); } else { createMutation.mutate(form); }
  };

  const handleEdit = (vendor: Vendor) => {
    setForm({ name: vendor.name, description: vendor.description || '', website: vendor.website || '', contactEmail: vendor.contactEmail || '', contactPhone: vendor.contactPhone || '', country: vendor.country || '', status: vendor.status, riskLevel: vendor.riskLevel, isSubProcessor: vendor.isSubProcessor, notes: vendor.notes || '' });
    setEditingId(vendor.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) { deleteMutation.mutate(id); }
  };

  const vendors = data?.data?.data || [];
  const vendor = vendorDetails?.data?.data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Add Vendor</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Vendor' : 'Add Vendor'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium mb-1">Website</label><input type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Country</label><input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="active">Active</option><option value="inactive">Inactive</option><option value="under_review">Under Review</option><option value="terminated">Terminated</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Risk Level</label><select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
            <div className="flex items-center"><label className="flex items-center gap-2"><input type="checkbox" checked={form.isSubProcessor} onChange={(e) => setForm({ ...form, isSubProcessor: e.target.checked })} /><span className="text-sm">Sub-Processor</span></label></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-1">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} /></div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{editingId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Status</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="under_review">Under Review</option><option value="terminated">Terminated</option>
        </select>
      </div>

      {selectedVendor && vendor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold">{vendor.name}</h3>
              <button onClick={() => setSelectedVendor(null)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div><span className="font-medium">Status: </span><span className={`px-2 py-1 text-xs rounded-full ${VENDOR_STATUS_COLORS[vendor.status]}`}>{vendor.status}</span></div>
              <div><span className="font-medium">Risk Level: </span><span className={`px-2 py-1 text-xs rounded-full ${RISK_LEVEL_COLORS[vendor.riskLevel]}`}>{vendor.riskLevel}</span></div>
              {vendor.website && <div><span className="font-medium">Website:</span> {vendor.website}</div>}
              {vendor.contactEmail && <div><span className="font-medium">Email:</span> {vendor.contactEmail}</div>}
              {vendor.description && <div><span className="font-medium">Description:</span> {vendor.description}</div>}
              {vendor.subProcessors && vendor.subProcessors.length > 0 && (
                <div><span className="font-medium">Sub-Processors:</span><ul className="ml-4 mt-2">{vendor.subProcessors.map((sub: { id: string; name: string }) => (<li key={sub.id}>{sub.name}</li>))}</ul></div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vendors.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No vendors found</td></tr>
                ) : (
                  vendors.map((v: Vendor) => (
                    <tr key={v.id}>
                      <td className="px-4 py-3 font-medium">{v.name}</td>
                      <td className="px-4 py-3">{v.country || '—'}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${VENDOR_STATUS_COLORS[v.status]}`}>{v.status}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${RISK_LEVEL_COLORS[v.riskLevel]}`}>{v.riskLevel}</span></td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedVendor(v.id)} className="text-xs text-primary-600 hover:text-primary-700 font-medium mr-2">View</button>
                        <button onClick={() => handleEdit(v)} className="text-xs text-primary-600 hover:text-primary-700 font-medium mr-2">Edit</button>
                        <button onClick={() => handleDelete(v.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
