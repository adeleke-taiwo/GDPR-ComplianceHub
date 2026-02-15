'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface Props {
  totalUsers: number;
  activeUsers: number;
}

const COLORS = ['#0d9488', '#94a3b8'];

export default function UserStatsBarChart({ totalUsers, activeUsers }: Props) {
  const inactiveUsers = totalUsers - activeUsers;
  const data = [
    { name: 'Active', value: activeUsers },
    { name: 'Inactive', value: inactiveUsers > 0 ? inactiveUsers : 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          tick={{ fontSize: 12, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value: number | undefined) => [`${value ?? 0} users`]}
          contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
