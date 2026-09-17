'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { LoadingState } from '@/components/dashboard/loading-state';
import { PageHeading } from '@/components/dashboard/page-heading';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuthSession } from '@/components/providers/auth-session-provider';
import { CategoryRevenueChart } from '@/components/revenue/category-revenue-chart';
import { MonthlyRevenueChart } from '@/components/revenue/monthly-revenue-chart';
import { RevenueMetrics } from '@/components/revenue/revenue-metrics';
import {
  loadMonthlyRevenue,
  loadRevenueByCategory,
} from '@/lib/analytics-api';
import type { CategoryRevenue, MonthlyRevenue } from '@/types/analytics';

export default function RevenuePage() {
  const {
    token,
    role,
    roleKey,
    scopedRegion,
    changeRegion,
    isAuthenticated,
  } = useAuthSession();
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalRevenue = useMemo(
    () => categoryRevenue.reduce((sum, item) => sum + item.revenue, 0),
    [categoryRevenue],
  );

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    Promise.all([
      loadRevenueByCategory({ token, region: scopedRegion, signal: controller.signal }),
      loadMonthlyRevenue({
        token,
        region: scopedRegion,
        page: 1,
        limit: 12,
        signal: controller.signal,
      }),
    ])
      .then(([categories, monthly]) => {
        if (!controller.signal.aborted) {
          setCategoryRevenue(categories);
          setMonthlyRevenue(monthly);
        }
      })
      .catch((requestError: Error) => {
        if (requestError.name !== 'AbortError' && !controller.signal.aborted) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [isAuthenticated, scopedRegion, token]);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <PageHeading
          eyebrow="Revenue reports"
          title="Revenue"
          description="Inspect category and monthly revenue from scoped backend analytics calls."
          role={role}
          roleKey={roleKey}
          scopedRegion={scopedRegion}
          onRegionChange={changeRegion}
        />

        <RevenueMetrics
          totalRevenue={totalRevenue}
          categoryCount={categoryRevenue.length}
        />

        {loading ? (
          <Card>
            <LoadingState message="Loading revenue reports from the backend..." />
          </Card>
        ) : error ? (
          <Card>
            <EmptyState message={error} />
          </Card>
        ) : (
          <section className="dashboard-grid">
            <CategoryRevenueChart data={categoryRevenue} />
            <MonthlyRevenueChart data={monthlyRevenue} />
          </section>
        )}
      </main>
    </div>
  );
}
