'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  CartesianGrid,
  Cell,
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { LoadingState } from '@/components/dashboard/loading-state';
import { Sidebar } from '@/components/dashboard/sidebar';
import {
  getStoredAuthSession,
  loadMonthlyRevenue,
  loadRevenueByCategory,
} from '@/lib/analytics-api';
import { canAccessRegion, formatCurrency, roles, resolveRegionForRole } from '@/lib/dashboard-data';
import type { CategoryRevenue, MonthlyRevenue } from '@/types/analytics';
import type { RoleKey } from '@/types/dashboard';

export default function RevenuePage() {
  const router = useRouter();
  const [roleKey, setRoleKey] = useState<RoleKey>('admin');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [token, setToken] = useState<string | null>(null);
  const [categoryRevenue, setCategoryRevenue] = useState<CategoryRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = roles[roleKey];
  const scopedRegion = resolveRegionForRole(roleKey, selectedRegion);
  const totalRevenue = useMemo(
    () => categoryRevenue.reduce((sum, item) => sum + item.revenue, 0),
    [categoryRevenue],
  );

  useEffect(() => {
    const session = getStoredAuthSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    setRoleKey(session.roleKey);
    setSelectedRegion(resolveRegionForRole(session.roleKey, 'all'));
    setToken(session.token);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);
    Promise.all([
      loadRevenueByCategory({ token, region: scopedRegion }),
      loadMonthlyRevenue({ token, region: scopedRegion, page: 1, limit: 12 }),
    ])
      .then(([categories, monthly]) => {
        setCategoryRevenue(categories);
        setMonthlyRevenue(monthly);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [scopedRegion, token]);

  function changeRegion(region: string) {
    if (canAccessRegion(roleKey, region)) {
      setSelectedRegion(region);
    }
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-heading">
          <div>
            <Button className="back-link" href="/" variant="ghost">
              <ArrowLeft size={16} /> Back to dashboard
            </Button>
            <p className="card-eyebrow">Revenue reports</p>
            <h1>Revenue</h1>
            <p className="page-description">
              Inspect category and monthly revenue from scoped backend analytics calls.
            </p>
          </div>
          <div className="student-controls">
            <span className="api-pill">{role.label}</span>
            <label className="role-select">
              <span>Region</span>
              <select value={scopedRegion} onChange={(event) => changeRegion(event.target.value)}>
                {role.allowedRegions.map((region) => (
                  <option key={region} value={region}>
                    {region === 'all' ? 'All Regions' : region}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <section className="metric-grid">
          <Card className="metric-card">
            <div className="metric-top"><span>Total Revenue</span></div>
            <div className="metric-value"><strong>{formatCurrency(totalRevenue)}</strong></div>
            <small>SUM(fee_paid)</small>
          </Card>
          <Card className="metric-card">
            <div className="metric-top"><span>Categories</span></div>
            <div className="metric-value"><strong>{categoryRevenue.length}</strong></div>
            <small>Revenue groups</small>
          </Card>
        </section>

        {loading ? (
          <Card><LoadingState message="Loading revenue reports from the backend..." /></Card>
        ) : error ? (
          <Card><EmptyState message={error} /></Card>
        ) : (
          <section className="dashboard-grid">
            <Card
              className="wide-card"
              title="Revenue by Course Category"
              eyebrow="GET /analytics/revenue-by-category"
            >
              <div className="chart-stage">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={categoryRevenue} margin={{ top: 18, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid stroke="#d3e4fe" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="category" tickLine={false} axisLine={false} />
                    <YAxis tickFormatter={(value) => `Rs ${Number(value) / 1000}k`} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="revenue" radius={[8, 8, 2, 2]}>
                      {categoryRevenue.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card
              className="wide-card"
              title="Monthly Revenue Trend"
              eyebrow="GET /analytics/monthly-revenue"
            >
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyRevenue} margin={{ top: 18, right: 16, left: 0, bottom: 4 }}>
                  <CartesianGrid stroke="#d3e4fe" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value) => `Rs ${Number(value) / 1000}k`} tickLine={false} axisLine={false} />
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
          </section>
        )}
      </main>
    </div>
  );
}
