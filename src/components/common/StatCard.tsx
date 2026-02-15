'use client';

import type { IconType } from 'react-icons';

interface Props {
  title: string;
  value: string | number;
  icon: IconType;
  color?: string;
}

const COLOR_MAP: Record<string, { border: string; bg: string }> = {
  'text-primary-600': { border: 'border-l-primary-600', bg: 'bg-primary-100 text-primary-600' },
  'text-green-600': { border: 'border-l-green-600', bg: 'bg-green-100 text-green-600' },
  'text-yellow-600': { border: 'border-l-yellow-600', bg: 'bg-yellow-100 text-yellow-600' },
  'text-red-600': { border: 'border-l-red-600', bg: 'bg-red-100 text-red-600' },
  'text-purple-600': { border: 'border-l-purple-600', bg: 'bg-purple-100 text-purple-600' },
  'text-blue-600': { border: 'border-l-blue-600', bg: 'bg-blue-100 text-blue-600' },
  'text-orange-600': { border: 'border-l-orange-600', bg: 'bg-orange-100 text-orange-600' },
  'text-gray-600': { border: 'border-l-gray-600', bg: 'bg-gray-100 text-gray-600' },
};

export default function StatCard({ title, value, icon: Icon, color = 'text-primary-600' }: Props) {
  const mapped = COLOR_MAP[color] || COLOR_MAP['text-primary-600'];

  return (
    <div className={`bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 ${mapped.border} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${mapped.bg} transition-transform duration-300`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
