'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BookOpen,
  Download,
  GraduationCap,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import {
  getStoredAuthSession,
  loadDashboardData,
} from '@/lib/analytics-api';
import {
  canAccessRegion,
  formatCurrency,
  resolveRegionForRole,
  roles,
} from '@/lib/dashboard-data';
import { EmptyState } from './empty-state';
import { LoadingState } from './loading-state';
import { MetricCard } from './metric-card';
import { RevenueByCategoryWidget } from './revenue-by-category-widget';
import { Sidebar } from './sidebar';
import type { DashboardData } from '@/types/analytics';
import type { RoleKey } from '@/types/dashboard';

function formatDisplayDate(value?: string): string {
  if (!value) {
    return 'Not started';
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function getCourseEndDate(enrolledOn: string, durationWeeks: number): Date {
  const endDate = new Date(enrolledOn);
  endDate.setDate(endDate.getDate() + durationWeeks * 7);

  return endDate;
}

export function DashboardShell() {
  const router = useRouter();
  const [roleKey, setRoleKey] = useState<RoleKey>('admin');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState('Checking authenticated session...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const role = roles[roleKey];
  const scopedRegion = resolveRegionForRole(roleKey, selectedRegion);
  const isRegionalRole = roleKey !== 'admin';

  useEffect(() => {
    setSelectedRegion((current) => resolveRegionForRole(roleKey, current));
  }, [roleKey]);

  useEffect(() => {
    if (!token) {
      return;
    }

    setErrorMessage(null);
    loadDashboardData({ token, region: scopedRegion })
      .then(setDashboardData)
      .catch((error: Error) => setErrorMessage(error.message));
  }, [scopedRegion, token]);

  useEffect(() => {
    const session = getStoredAuthSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    setRoleKey(session.roleKey);
    setSelectedRegion(resolveRegionForRole(session.roleKey, 'all'));
    setToken(session.token);
    setAuthMessage(`JWT role connected: ${roles[session.roleKey].label}`);
  }, [router]);

  const filteredCourses = useMemo(() => {
    return (dashboardData?.popularCourses ?? []).filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' ||
        course.category.toLowerCase().includes(categoryFilter.toLowerCase());
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, dashboardData?.popularCourses, query]);

  const categoryOptions = useMemo(() => {
    return Array.from(new Set((dashboardData?.popularCourses ?? []).map((course) => course.category)));
  }, [dashboardData?.popularCourses]);

  function handleRegionClick(regionKey: string) {
    if (canAccessRegion(roleKey, regionKey)) {
      setSelectedRegion(regionKey);
    }
  }

  function refreshDashboard() {
    setRefreshing(true);
    if (!token) {
      setRefreshing(false);
      return;
    }

    loadDashboardData({ token, region: scopedRegion })
      .then((data) => setDashboardData(data))
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setRefreshing(false));
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
        <section className="scope-toolbar">
          <div className="persona">
            <span className="avatar">{role.initials}</span>
            <div>
              <div className="persona-row">
                <strong>{role.name}</strong>
                <span className="role-chip">{role.label}</span>
              </div>
              <p>{role.scopeLabel} fiscal telemetry</p>
            </div>
          </div>
          <div className="toolbar-actions">
            <span className="api-pill">Live API</span>
            <span className="api-pill">{authMessage}</span>
            <button className="icon-button" onClick={refreshDashboard} title="Refresh dashboard">
              <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
            </button>
            <button className="primary-action">
              <Download size={16} />
              Export Ledger
            </button>
          </div>
        </section>

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

        <section className="metric-grid">
          <MetricCard
            label="Total Students"
               value={dashboardData.summary.totalStudents.toString()}
            caption="COUNT(DISTINCT students.id)"
            trend="+12% MoM"
            icon={<Users size={20} />}
          />
          <MetricCard
            label="Total Enrollments"
               value={dashboardData.summary.totalEnrollments.toString()}
            caption="COUNT(enrollments.id)"
            trend={`${(dashboardData.summary.totalEnrollments / dashboardData.summary.totalStudents).toFixed(2)} crs/student`}
            icon={<GraduationCap size={20} />}
          />
          <MetricCard
            label="Consortium Rating"
               value={`${dashboardData.summary.averageRating.toFixed(1)} / 5.0`}
            caption="Based on submitted ratings"
            trend="4-star median"
            icon={<Star size={20} />}
          />
          <MetricCard
            label="Net Fee Revenue"
               value={formatCurrency(dashboardData.summary.netRevenue)}
            caption="SUM(fee_paid)"
            trend="+18.4% YoY"
            icon={<TrendingUp size={20} />}
          />
        </section>

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

        <Card
          className="table-card student-preview-card"
          title="Student Enrollment Snapshot"
          eyebrow="Live backend data"
        >
          {dashboardData.students.length === 0 ? (
            <EmptyState message="No students were returned for this scope." />
          ) : (
            <DataTable className="student-snapshot-table" minWidth={980}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Courses Enrolled</th>
                  <th>Starting Date</th>
                  <th>Ending Date</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.students.slice(0, 10).map((student) => {
                  const sortedCourses = [...student.courses].sort(
                    (left, right) =>
                      new Date(left.enrolledOn).getTime() -
                      new Date(right.enrolledOn).getTime(),
                  );
                  const firstCourse = sortedCourses[0];
                  const finalCourse = sortedCourses.reduce<Date | null>(
                    (latestDate, course) => {
                      const endDate = getCourseEndDate(
                        course.enrolledOn,
                        course.durationWeeks,
                      );

                      return !latestDate || endDate > latestDate
                        ? endDate
                        : latestDate;
                    },
                    null,
                  );

                  return (
                    <tr key={student.studentId}>
                      <td>
                        <div className="student-table-name">
                          <strong>{student.name}</strong>
                          <small>{student.studentId}</small>
                        </div>
                      </td>
                      <td>{student.courses.length}</td>
                      <td>{formatDisplayDate(firstCourse?.enrolledOn)}</td>
                      <td>{finalCourse ? formatDisplayDate(finalCourse.toISOString()) : 'Not available'}</td>
                      <td>
                        <div className="completion-summary table-completion-summary">
                          <span className="status-completed">{student.completion.completed} done</span>
                          <span className="status-progress">{student.completion.inProgress} active</span>
                          <span className="status-dropped">{student.completion.dropped} dropped</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </DataTable>
          )}
          <div className="card-footer-action">
            <Button href="/students" variant="secondary">
              Read more <ArrowRight size={15} />
            </Button>
          </div>
        </Card>

        <Card className="table-card" title="Most Popular Courses by Enrollment Count">
          <div className="table-tools">
            <label>
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter courses..."
              />
            </label>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <DataTable>
              <thead>
                <tr>
                  <th>Rank & Course Title</th>
                  <th>Category</th>
                  <th>Enrollments</th>
                  <th>Avg Rating</th>
                  <th>Total Fees</th>
                  <th>Completion</th>
                </tr>
              </thead>
              <tbody>
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <EmptyState message="No courses match the current filters." />
                        </td>
                      </tr>
                    ) : filteredCourses.map((course) => (
                  <tr key={course.code}>
                    <td>
                      <div className="course-title">
                        <span>{course.rank}</span>
                        <div>
                          <strong>{course.title}</strong>
                          <small>{course.code}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-badge">{course.category}</span>
                    </td>
                    <td>{course.enrollments}</td>
                    <td>{course.rating}</td>
                    <td>{formatCurrency(course.fees)}</td>
                    <td>
                      <div className="completion-cell">
                        <span>
                          <i style={{ width: `${course.completionRate}%` }} />
                        </span>
                        <b>{course.completionRate}%</b>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </DataTable>
        </Card>

        <Card className="table-card" title="Drop-off Risk Watchlist" eyebrow="Direct backend endpoint">
          <div className="risk-list">
                {dashboardData.dropOffRisks.length === 0 ? (
                  <EmptyState message="No drop-off risks were returned." />
                ) : dashboardData.dropOffRisks.map((risk) => (
              <article key={`${risk.course}-${risk.region}`} className="risk-item">
                <BookOpen size={18} />
                <div>
                  <strong>{risk.course}</strong>
                  <span>{risk.region} region</span>
                </div>
                <b>{risk.dropRate}% drop rate</b>
              </article>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
