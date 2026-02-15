'use client';

import { STATUS_COLORS, SEVERITY_COLORS } from '@/utils/constants';

interface Props {
  status: string;
  type?: 'status' | 'severity';
}

export default function StatusBadge({ status, type = 'status' }: Props) {
  const colors = type === 'severity' ? SEVERITY_COLORS : STATUS_COLORS;
  const colorClass = colors[status] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colorClass}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
