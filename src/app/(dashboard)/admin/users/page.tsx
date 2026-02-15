'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/dateUtils';
import toast from 'react-hot-toast';
import type { User } from '@/types';

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, page],
    queryFn: () => userService.getAll({ search, role: roleFilter, page }),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => userService.changeRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User role updated');
    },
    onError: () => toast.error('Failed to update role'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => userService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deactivated');
    },
    onError: () => toast.error('Failed to deactivate user'),
  });

  const users: User[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
          <option value="dpo">DPO</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
            <table className="w-full text-sm table-striped">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  {currentUser?.role === 'admin' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 font-medium text-gray-900">{u.firstName} {u.lastName}</td>
                    <td className="px-4 py-3 text-gray-500">{u.email}</td>
                    <td className="px-4 py-3">
                      {currentUser?.role === 'admin' && u.id !== currentUser.id ? (
                        <select
                          value={u.role}
                          onChange={(e) => changeRoleMutation.mutate({ id: u.id, role: e.target.value })}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-primary-500 outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="dpo">DPO</option>
                        </select>
                      ) : (
                        <span className="capitalize text-gray-700">{u.role}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.isActive ? 'completed' : 'rejected'} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                    {currentUser?.role === 'admin' && (
                      <td className="px-4 py-3">
                        {u.id !== currentUser.id && u.isActive && (
                          <button
                            onClick={() => {
                              if (confirm(`Deactivate ${u.firstName} ${u.lastName}?`)) {
                                deactivateMutation.mutate(u.id);
                              }
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Previous</button>
              <button onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages} className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
