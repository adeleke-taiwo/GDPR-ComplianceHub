'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { dpiaService } from '@/services/dpiaService';
import type { DPIA, DPIARisk, DPIAMitigation } from '@/types';
import { DPIA_STATUS_COLORS, RISK_LEVEL_COLORS, MITIGATION_STATUS_COLORS, LEGAL_BASIS_LABELS } from '@/utils/constants';

export default function DPIAManagementPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDPIA, setSelectedDPIA] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '', description: '', dataTypes: '', dataSubjects: '', processingPurpose: '', legalBasis: 'consent', necessityJustification: '', riskLevel: 'medium', status: 'draft',
  });

  const { data, isLoading } = useQuery({ queryKey: ['dpias', statusFilter], queryFn: () => dpiaService.getAll({ status: statusFilter || undefined }) });
  const { data: dpiaDetails } = useQuery({ queryKey: ['dpia', selectedDPIA], queryFn: () => dpiaService.getById(selectedDPIA!), enabled: !!selectedDPIA });

  const createMutation = useMutation({
    mutationFn: dpiaService.create,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['dpias'] }); toast.success('DPIA created successfully'); resetForm(); },
    onError: (error: Error) => { const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message; toast.error(msg || 'Failed to create DPIA'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, string> }) => dpiaService.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['dpias'] }); toast.success('DPIA updated successfully'); resetForm(); },
    onError: (error: Error) => { const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message; toast.error(msg || 'Failed to update DPIA'); },
  });

  const deleteMutation = useMutation({
    mutationFn: dpiaService.remove,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['dpias'] }); toast.success('DPIA deleted successfully'); },
    onError: (error: Error) => { const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message; toast.error(msg || 'Failed to delete DPIA'); },
  });

  const resetForm = () => { setForm({ title: '', description: '', dataTypes: '', dataSubjects: '', processingPurpose: '', legalBasis: 'consent', necessityJustification: '', riskLevel: 'medium', status: 'draft' }); setEditingId(null); setShowForm(false); };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (editingId) { updateMutation.mutate({ id: editingId, data: form }); } else { createMutation.mutate(form); } };

  const handleEdit = (dpia: DPIA) => {
    setForm({ title: dpia.title, description: dpia.description, dataTypes: dpia.dataTypes, dataSubjects: dpia.dataSubjects, processingPurpose: dpia.processingPurpose, legalBasis: dpia.legalBasis, necessityJustification: dpia.necessityJustification, riskLevel: dpia.riskLevel, status: dpia.status });
    setEditingId(dpia.id); setShowForm(true);
  };

  const handleDelete = (id: string) => { if (window.confirm('Are you sure you want to delete this DPIA?')) { deleteMutation.mutate(id); } };

  const dpias = data?.data?.data || [];
  const dpia = dpiaDetails?.data?.data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Data Protection Impact Assessments</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Create DPIA</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit DPIA' : 'Create DPIA'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
              <div><label className="block text-sm font-medium mb-1">Legal Basis *</label><select value={form.legalBasis} onChange={(e) => setForm({ ...form, legalBasis: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">{Object.entries(LEGAL_BASIS_LABELS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}</select></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Description *</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Data Types *</label><input type="text" value={form.dataTypes} onChange={(e) => setForm({ ...form, dataTypes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g., Names, emails, addresses" required /></div>
              <div><label className="block text-sm font-medium mb-1">Data Subjects *</label><input type="text" value={form.dataSubjects} onChange={(e) => setForm({ ...form, dataSubjects: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g., Customers, employees" required /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Processing Purpose *</label><input type="text" value={form.processingPurpose} onChange={(e) => setForm({ ...form, processingPurpose: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" required /></div>
            <div><label className="block text-sm font-medium mb-1">Necessity Justification *</label><textarea value={form.necessityJustification} onChange={(e) => setForm({ ...form, necessityJustification: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} required /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Risk Level</label><select value={form.riskLevel} onChange={(e) => setForm({ ...form, riskLevel: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="very_high">Very High</option></select></div>
              <div><label className="block text-sm font-medium mb-1">Status</label><select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm"><option value="draft">Draft</option><option value="in_review">In Review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="requires_revision">Requires Revision</option></select></div>
            </div>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">{editingId ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="">All Status</option><option value="draft">Draft</option><option value="in_review">In Review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="requires_revision">Requires Revision</option>
        </select>
      </div>

      {selectedDPIA && dpia && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold">{dpia.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${DPIA_STATUS_COLORS[dpia.status]}`}>{dpia.status}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${RISK_LEVEL_COLORS[dpia.riskLevel]}`}>Risk: {dpia.riskLevel}</span>
                </div>
              </div>
              <button onClick={() => setSelectedDPIA(null)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <div className="space-y-4">
              <div><span className="font-medium">Description:</span><p className="mt-1 text-gray-700">{dpia.description}</p></div>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-medium">Data Types:</span><p className="text-gray-700">{dpia.dataTypes}</p></div>
                <div><span className="font-medium">Data Subjects:</span><p className="text-gray-700">{dpia.dataSubjects}</p></div>
              </div>
              <div><span className="font-medium">Processing Purpose:</span><p className="text-gray-700">{dpia.processingPurpose}</p></div>
              {dpia.risks && dpia.risks.length > 0 && (
                <div>
                  <h4 className="font-medium text-lg mb-2">Risks ({dpia.risks.length})</h4>
                  <div className="space-y-2">
                    {dpia.risks.map((risk: DPIARisk) => (
                      <div key={risk.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start"><span className="font-medium">{risk.title}</span><span className={`px-2 py-1 text-xs rounded-full ${RISK_LEVEL_COLORS[risk.riskLevel]}`}>{risk.riskLevel}</span></div>
                        <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                        <div className="text-xs text-gray-500 mt-2">Likelihood: {risk.likelihood}/5 | Impact: {risk.impact}/5</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {dpia.mitigations && dpia.mitigations.length > 0 && (
                <div>
                  <h4 className="font-medium text-lg mb-2">Mitigations ({dpia.mitigations.length})</h4>
                  <div className="space-y-2">
                    {dpia.mitigations.map((mitigation: DPIAMitigation) => (
                      <div key={mitigation.id} className="bg-gray-50 p-3 rounded">
                        <div className="flex justify-between items-start"><span className="font-medium">{mitigation.title}</span><span className={`px-2 py-1 text-xs rounded-full ${MITIGATION_STATUS_COLORS[mitigation.status]}`}>{mitigation.status}</span></div>
                        <p className="text-sm text-gray-600 mt-1">{mitigation.description}</p>
                        {mitigation.responsiblePerson && <p className="text-xs text-gray-500 mt-2">Responsible: {mitigation.responsiblePerson}</p>}
                      </div>
                    ))}
                  </div>
                </div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dpias.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">No DPIAs found</td></tr>
                ) : (
                  dpias.map((d: DPIA) => (
                    <tr key={d.id}>
                      <td className="px-4 py-3 font-medium">{d.title}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${DPIA_STATUS_COLORS[d.status]}`}>{d.status}</span></td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs rounded-full ${RISK_LEVEL_COLORS[d.riskLevel]}`}>{d.riskLevel}</span></td>
                      <td className="px-4 py-3">{d._count?.risks || 0}</td>
                      <td className="px-4 py-3">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setSelectedDPIA(d.id)} className="text-xs text-primary-600 hover:text-primary-700 font-medium mr-2">View</button>
                        <button onClick={() => handleEdit(d)} className="text-xs text-primary-600 hover:text-primary-700 font-medium mr-2">Edit</button>
                        <button onClick={() => handleDelete(d.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">Delete</button>
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
