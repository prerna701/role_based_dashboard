'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { loadRevenueByCategory } from '@/lib/analytics-api';
import {
  canAccessRegion,
  formatCurrency,
  resolveRegionForRole,
  roles,
} from '@/lib/dashboard-data';
import type { CategoryRevenue } from '@/types/analytics';
import type { RoleKey } from '@/types/dashboard';
import { EmptyState } from './empty-state';
import { LoadingState } from './loading-state';

type RevenueByCategoryWidgetProps = {
  initialData: CategoryRevenue[];
  initialRegion: string;
  roleKey: RoleKey;
  token: string | null;
};

const regionLabels: Record<string, string> = {
  all: 'All Regions',
  north: 'North',
  south: 'South',
  east: 'East',
};

export function RevenueByCategoryWidget({
  initialData,
  initialRegion,
  roleKey,
  token,
}: RevenueByCategoryWidgetProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>(
    resolveRegionForRole(roleKey, initialRegion),
  );
  const [categoryRevenue, setCategoryRevenue] = useState(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const regionOptions = useMemo(() => roles[roleKey].allowedRegions, [roleKey]);
  const scopedRegion = resolveRegionForRole(roleKey, selectedRegion);

  useEffect(() => {
    setSelectedRegion((currentRegion) =>
      resolveRegionForRole(roleKey, currentRegion),
    );
  }, [roleKey]);

  useEffect(() => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    loadRevenueByCategory({ token, region: scopedRegion })
      .then(setCategoryRevenue)
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, [scopedRegion, token]);

  function handleRegionChange(region: string) {
    if (canAccessRegion(roleKey, region)) {
      setSelectedRegion(region);
    }
  }

  return (
    <Card
      className="wide-card"
      eyebrow="Mandatory widget"
      title="Total Revenue by Course Category"
      action={<span className="endpoint-chip">GET /analytics/revenue-by-category</span>}
    >
      <div className="widget-filter-row">
        <div>
          <strong>{regionLabels[scopedRegion] ?? scopedRegion} revenue scope</strong>
          <span>
            One widget and one API endpoint, scoped by the logged-in JWT role.
          </span>
        </div>
        <label className="role-select">
          <span>Region</span>
          <select
            value={scopedRegion}
            onChange={(event) => handleRegionChange(event.target.value)}
          >
            {regionOptions.map((region) => (
              <option key={region} value={region}>
                {regionLabels[region] ?? region}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isLoading ? (
        <LoadingState message="Loading revenue by category..." />
      ) : errorMessage ? (
        <EmptyState message={errorMessage} />
      ) : (
        <>
          <div className="chart-stage">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={categoryRevenue} margin={{ top: 18, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#d3e4fe" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) => `Rs ${Number(value) / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" radius={[8, 8, 2, 2]}>
                  {categoryRevenue.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="category-strip">
            {categoryRevenue.length === 0 ? (
              <EmptyState message="No category revenue data is available." />
            ) : categoryRevenue.map((item) => (
              <article key={item.category} className="mini-card">
                <span style={{ background: item.color }} />
                <strong>{item.category}</strong>
                <b>{formatCurrency(item.revenue)}</b>
                <small>
                  {item.enrollments} enrollments - {item.share}% share
                </small>
              </article>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
