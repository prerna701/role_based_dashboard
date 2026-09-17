'use client';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/dashboard-data';
import type { MonthlyRevenue } from '@/types/analytics';

type MonthlyRevenueChartProps = {
  data: MonthlyRevenue[];
};

export function MonthlyRevenueChart({ data }: MonthlyRevenueChartProps) {
  return (
    <Card
      className="wide-card"
      title="Monthly Revenue Trend"
      eyebrow="GET /analytics/monthly-revenue"
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 18, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="#d3e4fe" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(value) => `Rs ${Number(value) / 1000}k`}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3525cd"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
