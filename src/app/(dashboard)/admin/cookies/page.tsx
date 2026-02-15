'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { cookieService } from '@/services/cookieService';
import type { Cookie, CookieCategory } from '@/types';
import { COOKIE_CATEGORY_LABELS } from '@/utils/constants';
import StatusBadge from '@/components/common/StatusBadge';

export default function CookieManagementPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [scanDomain, setScanDomain] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: 'necessary' as CookieCategory,
    domain: '',
    path: '/',
    description: '',
    purpose: '',
    duration: '',
    isFirstParty: true,
    vendorId: '',
    isActive: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['cookies', categoryFilter],
    queryFn: () => cookieService.getAll({ category: categoryFilter || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: cookieService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookies'] });
      toast.success('Cookie created successfully');
      resetForm();
    },
    onError: (error: Error) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to create cookie');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => cookieService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookies'] });
      toast.success('Cookie updated successfully');
      resetForm();
    },
    onError: (error: Error) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to update cookie');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: cookieService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookies'] });
      toast.success('Cookie deleted successfully');
    },
    onError: (error: Error) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to delete cookie');
    },
  });

  const scanMutation = useMutation({
    mutationFn: cookieService.scanDomain,
    onSuccess: () => {
      toast.success('Domain scan completed');
      setShowScanner(false);
      setScanDomain('');
    },
    onError: (error: Error) => {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to scan domain');
    },
  });

  const resetForm = () => {
    setForm({ name: '', category: 'necessary', domain: '', path: '/', description: '', purpose: '', duration: '', isFirstParty: true, vendorId: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, vendorId: form.vendorId || undefined };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (cookie: Cookie) => {
    setForm({ name: cookie.name, category: cookie.category, domain: cookie.domain, path: cookie.path, description: cookie.description, purpose: cookie.purpose, duration: cookie.duration, isFirstParty: cookie.isFirstParty, vendorId: cookie.vendorId || '', isActive: cookie.isActive });
    setEditingId(cookie.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this cookie?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    scanMutation.mutate(scanDomain);
  };

  const cookies = data?.data?.data || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cookie Management</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowScanner(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Scan Domain</button>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Add Cookie</button>
        </div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Scan Domain for Cookies</h3>
            <form onSubmit={handleScan}>
              <input type="url" value={scanDomain} onChange={(e) => setScanDomain(e.target.value)} placeholder="https://example.com" className="w-full px-3 py-2 border rounded-lg mb-4" required />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowScanner(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={scanMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">{scanMutation.isPending ? 'Scanning...' : 'Scan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Cookie' : 'Add Cookie'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CookieCategory })} className="w-full px-3 py-2 border rounded-lg text-sm">
                {Object.entries(COOKIE_CATEGORY_LABELS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Domain *</label>
              <input type="text" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration *</label>
              <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g., Session, 1 year" className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} required />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Purpose *</label>
              <input type="text" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required />
            </div>
            <div className="col-span-2 flex items-center gap-4">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFirstParty} onChange={(e) => setForm({ ...form, isFirstParty: e.target.checked })} /><span className="text-sm">First-Party Cookie</span></label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /><span className="text-sm">Active</span></label>
            </div>
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{editingId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Categories</option>
          {Object.entries(COOKIE_CATEGORY_LABELS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Domain</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {cookies.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">No cookies found</td></tr>
                ) : (
                  cookies.map((cookie: Cookie) => (
                    <tr key={cookie.id}>
                      <td className="px-4 py-3 font-medium">{cookie.name}</td>
                      <td className="px-4 py-3"><StatusBadge status={cookie.category} /></td>
                      <td className="px-4 py-3">{cookie.domain}</td>
                      <td className="px-4 py-3">{cookie.duration}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${cookie.isFirstParty ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                          {cookie.isFirstParty ? 'First-Party' : 'Third-Party'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${cookie.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {cookie.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleEdit(cookie)} className="text-xs text-primary-600 hover:text-primary-700 font-medium mr-2">Edit</button>
                        <button onClick={() => handleDelete(cookie.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
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
