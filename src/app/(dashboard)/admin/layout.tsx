import ProtectedRoute from '@/components/common/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={['admin', 'dpo']}>
      {children}
    </ProtectedRoute>
  );
}
