import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/dashboard-data';

import type { RevenueMetricsProps } from '@/types/components';
export function RevenueMetrics({
  totalRevenue,
  categoryCount,
}: RevenueMetricsProps) {
  return (
    <section className="metric-grid">
      <Card className="metric-card">
        <div className="metric-top">
          <span>Total Revenue</span>
        </div>
        <div className="metric-value">
          <strong>{formatCurrency(totalRevenue)}</strong>
        </div>
        <small>SUM(fee_paid)</small>
      </Card>
      <Card className="metric-card">
        <div className="metric-top">
          <span>Categories</span>
        </div>
        <div className="metric-value">
          <strong>{categoryCount}</strong>
        </div>
        <small>Revenue groups</small>
      </Card>
    </section>
  );
}
