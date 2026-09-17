'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/dashboard-data';
import type { CategoryRevenue } from '@/types/analytics';

import type { CategoryRevenueChartProps } from '@/types/components';
export function CategoryRevenueChart({ data }: CategoryRevenueChartProps) {
  return (
    <Card
      className="wide-card"
      title="Revenue by Course Category"
      eyebrow="GET /analytics/revenue-by-category"
    >
      <div className="chart-stage">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 18, right: 12, left: 10, bottom: 8 }}>
            <CartesianGrid stroke="#d3e4fe" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="category" tickLine={false} axisLine={false} />
            <YAxis
              tickFormatter={(value) => `Rs ${Number(value) / 1000}k`}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Bar dataKey="revenue" radius={[8, 8, 2, 2]}>
              {data.map((entry) => (
                <Cell key={entry.category} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
