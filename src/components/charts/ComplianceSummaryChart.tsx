'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  consentRate: number;
  pendingRequests: number;
  activeBreaches: number;
}

const COLORS = ['#0d9488', '#eab308', '#ef4444'];

export default function ComplianceSummaryChart({ consentRate, pendingRequests, activeBreaches }: Props) {
  const data = [
    { name: 'Consent Rate', value: consentRate },
    { name: 'Pending Requests', value: pendingRequests },
    { name: 'Active Breaches', value: activeBreaches },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    data.push({ name: 'No Issues', value: 1 });
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={data.length === 1 && data[0].name === 'No Issues' ? '#e2e8f0' : COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number | undefined, name: string | undefined) => [`${value ?? 0}`, name ?? '']}
          contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '11px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
