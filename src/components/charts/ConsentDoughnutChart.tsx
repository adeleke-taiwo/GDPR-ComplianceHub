'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  granted: number;
  total: number;
}

const COLORS = ['#0d9488', '#e2e8f0'];

export default function ConsentDoughnutChart({ granted, total }: Props) {
  const notGranted = total - granted;
  const data = [
    { name: 'Granted', value: granted },
    { name: 'Not Granted', value: notGranted > 0 ? notGranted : 0 },
  ];

  if (total === 0) {
    data[0].value = 0;
    data[1].value = 1;
  }

  const pct = total > 0 ? Math.round((granted / total) * 100) : 0;

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | undefined, name: string | undefined) => [`${value ?? 0}`, name ?? '']}
            contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{pct}%</p>
          <p className="text-xs text-gray-500">Granted</p>
        </div>
      </div>
    </div>
  );
}
