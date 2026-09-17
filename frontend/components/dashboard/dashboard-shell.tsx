'use client';

import { Lock, ShieldCheck } from 'lucide-react';
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
import { CourseTable } from '@/components/courses/course-table';
import { canAccessRegion, formatCurrency } from '@/lib/dashboard-data';
import { LoadingState } from './loading-state';
import { RevenueByCategoryWidget } from './revenue-by-category-widget';
import { Sidebar } from './sidebar';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardMetrics } from './dashboard-metrics';
import { StudentSnapshotTable } from './student-snapshot-table';
import { DropOffWatchlist } from './drop-off-watchlist';

export function DashboardShell() {
  const {
    dashboardData,
    errorMessage,
    query,
    setQuery,
    categoryFilter,
    setCategoryFilter,
    isRegionalRole,
    role,
    roleKey,
    scopedRegion,
    changeRegion,
    filteredCourses,
    categoryOptions,
    token,
  } = useDashboardData();

  function handleRegionClick(regionKey: string) {
    if (canAccessRegion(roleKey, regionKey)) {
      changeRegion(regionKey);
    }
  }

  if (!dashboardData) {
    return (
      <main className="dashboard-main">
        <section className="scope-banner">
          <div className="scope-copy">
            <div>
              {errorMessage ? (
                <>
                  <strong>{errorMessage}</strong>
                  <span>Dashboard metrics are available only after a successful backend response.</span>
                </>
              ) : (
                <LoadingState message="Loading dashboard data..." />
              )}
            </div>
          </div>
          {errorMessage && (
            <button className="primary-action" onClick={() => window.location.reload()}>
              Retry
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="dashboard-main">
        <section className="scope-banner">
          <div className="scope-copy">
            {isRegionalRole ? <Lock size={20} /> : <ShieldCheck size={20} />}
            <div>
              <strong>
                {isRegionalRole
                  ? `Scope locked to ${role.scopeLabel}`
                  : 'Viewing Scope: Global Consortium'}
              </strong>
              <span>
                {isRegionalRole
                  ? 'Cross-region access is disabled at UI and API policy layers.'
                  : 'Admin can inspect North, South, and East data slices.'}
              </span>
            </div>
          </div>
          <div className="region-tabs">
            {dashboardData.regions.map((region) => {
              const accessible = canAccessRegion(roleKey, region.key);
              const active = scopedRegion === region.key;

              return (
                <button
                  key={region.key}
                  className={active ? 'active' : ''}
                  disabled={!accessible}
                  onClick={() => handleRegionClick(region.key)}
                  title={
                    accessible
                      ? `View ${region.label}`
                      : `Not allowed: ${role.label} cannot access ${region.label} data`
                  }
                >
                  {region.label}
                  <span>{region.students}</span>
                </button>
              );
            })}
          </div>
        </section>

        <DashboardMetrics summary={dashboardData.summary} />

        <section className="dashboard-grid">
          <RevenueByCategoryWidget
            initialData={dashboardData.categoryRevenue}
            initialRegion={scopedRegion}
            roleKey={roleKey}
            token={token}
          />

          <Card title="Enrollment Completion Status" eyebrow="Lifecycle health">
            <div className="status-layout">
              <div className="donut" aria-label="Completion status distribution">
                <span>86%</span>
                <small>retention</small>
              </div>
              <div className="status-list">
                {dashboardData.completionStatus.map((item) => (
                  <div key={item.label} className="status-row">
                    <span style={{ background: item.color }} />
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.percent}% of total</small>
                    </div>
                    <b>{item.value}</b>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Revenue by Region" eyebrow="Admin-only distribution">
            {isRegionalRole ? (
              <div className="locked-panel">
                <Lock size={28} />
                <strong>Cross-region financial data restricted</strong>
                <p>
                  {role.label} can only view {role.scopeLabel}. Direct API requests outside this
                  scope receive a clear 403 policy response from the backend.
                </p>
                <span>Policy enforced: RBAC-SEC-403</span>
              </div>
            ) : (
              <div className="region-bars">
                {dashboardData.regions
                  .filter((region) => region.key !== 'all')
                  .map((region) => (
                    <div key={region.key} className="region-bar">
                      <div>
                        <strong>{region.label} Territory</strong>
                        <span>{region.enrollments} enrollments</span>
                      </div>
                      <b>{formatCurrency(region.revenue)}</b>
                      <div className="bar-track">
                        <span
                          style={{
                            width: `${Math.round((region.revenue / dashboardData.regions[0].revenue) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>

          <Card
            className="wide-card"
            title="Monthly Revenue Trend"
            eyebrow="Fiscal YTD"
            action={<span className="endpoint-chip">GET /analytics/monthly-revenue</span>}
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dashboardData.monthlyRevenue} margin={{ top: 18, right: 16, left: 0, bottom: 4 }}>
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
        </section>

        <StudentSnapshotTable students={dashboardData.students} />

        <Card className="table-card" title="Most Popular Courses by Enrollment Count">
          <CourseTable
            courses={filteredCourses}
            categories={categoryOptions}
            query={query}
            categoryFilter={categoryFilter}
            onQueryChange={setQuery}
            onCategoryFilterChange={setCategoryFilter}
          />
        </Card>

        <DropOffWatchlist dropOffRisks={dashboardData.dropOffRisks} />
      </main>
    </div>
  );
}
