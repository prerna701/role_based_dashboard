import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

import type { MetricCardProps } from '@/types/components';
export function MetricCard({ label, value, caption, trend, icon }: MetricCardProps) {
  return (
    <Card className="metric-card">
      <div className="metric-top">
        <span>{label}</span>
        {icon}
      </div>
      <div className="metric-value">
        <strong>{value}</strong>
        <em>{trend}</em>
      </div>
      <small>{caption}</small>
    </Card>
  );
}
