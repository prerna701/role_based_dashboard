'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  Download,
  Globe2,
  GraduationCap,
  LayoutDashboard,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { loadDashboardData } from '@/lib/analytics-api';
import {
  canAccessRegion,
  categoryRevenue as fallbackCategoryRevenue,
  completionStatus,
  dropOffRisks as fallbackDropOffRisks,
  formatCurrency,
  getRegionSummary,
  monthlyRevenue as fallbackMonthlyRevenue,
  popularCourses,
  regions,
  resolveRegionForRole,
  roles,
} from '@/lib/dashboard-data';

type RoleKey = keyof typeof roles;

export function DashboardShell() {
  const [roleKey, setRoleKey] = useState<RoleKey>('admin');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [categoryData, setCategoryData] = useState(fallbackCategoryRevenue);
  const [dropOffData, setDropOffData] = useState(fallbackDropOffRisks);
  const [monthlyData, setMonthlyData] = useState(fallbackMonthlyRevenue);
  const [source, setSource] = useState<'api' | 'mock'>('mock');
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const role = roles[roleKey];
  const scopedRegion = resolveRegionForRole(roleKey, selectedRegion);
  const summary = getRegionSummary(scopedRegion);
  const isRegionalRole = roleKey !== 'admin';

  useEffect(() => {
    setSelectedRegion((current) => resolveRegionForRole(roleKey, current));
  }, [roleKey]);

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken') ??
          window.localStorage.getItem('authToken')
        : null;

    loadDashboardData({ token, region: scopedRegion }).then((data) => {
      setCategoryData(data.categoryRevenue);
      setDropOffData(data.dropOffRisks);
      setMonthlyData(data.monthlyRevenue);
      setSource(data.source);
    });
  }, [scopedRegion]);

  const filteredCourses = useMemo(() => {
    return popularCourses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [categoryFilter, query]);

  function handleRegionClick(regionKey: string) {
    if (canAccessRegion(roleKey, regionKey)) {
      setSelectedRegion(regionKey);
    }
  }

  function refreshDashboard() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 650);
  }

  return (
    <div className="dashboard-shell">
      <Header role={role} roleKey={roleKey} setRoleKey={setRoleKey} />
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
            <span className="api-pill">{source === 'api' ? 'Live API' : 'Fallback Data'}</span>
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
            {regions.map((region) => {
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
            value={summary.students.toString()}
            caption="COUNT(DISTINCT students.id)"
            trend="+12% MoM"
            icon={<Users size={20} />}
          />
          <MetricCard
            label="Total Enrollments"
            value={summary.enrollments.toString()}
            caption="COUNT(enrollments.id)"
            trend={`${(summary.enrollments / summary.students).toFixed(2)} crs/student`}
            icon={<GraduationCap size={20} />}
          />
          <MetricCard
            label="Consortium Rating"
            value="3.8 / 5.0"
            caption="Based on submitted ratings"
            trend="4-star median"
            icon={<Star size={20} />}
          />
          <MetricCard
            label="Net Fee Revenue"
            value={formatCurrency(summary.revenue)}
            caption="SUM(fee_paid)"
            trend="+18.4% YoY"
            icon={<TrendingUp size={20} />}
          />
        </section>

        <section className="dashboard-grid">
          <Card
            className="wide-card"
            eyebrow="Primary analytics"
            title="Total Revenue by Course Category"
            action={<span className="endpoint-chip">GET /analytics/revenue-by-category</span>}
          >
            <div className="chart-stage">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categoryData} margin={{ top: 18, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#d3e4fe" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} />
                  <YAxis
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="revenue" radius={[8, 8, 2, 2]}>
                    {categoryData.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="category-strip">
              {categoryData.map((item) => (
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
          </Card>

          <Card title="Enrollment Completion Status" eyebrow="Lifecycle health">
            <div className="status-layout">
              <div className="donut" aria-label="Completion status distribution">
                <span>86%</span>
                <small>retention</small>
              </div>
              <div className="status-list">
                {completionStatus.map((item) => (
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
                {regions
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
                            width: `${Math.round((region.revenue / regions[0].revenue) * 100)}%`,
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
              <LineChart data={monthlyData} margin={{ top: 18, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid stroke="#d3e4fe" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis
                  tickFormatter={(value) => `₹${Number(value) / 1000}k`}
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
              <option value="Data">Data</option>
              <option value="Programming">Programming</option>
              <option value="Business">Business</option>
              <option value="Design">Design</option>
            </select>
          </div>
          <div className="data-table-wrap">
            <table className="data-table">
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
                {filteredCourses.map((course) => (
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
            </table>
          </div>
        </Card>

        <Card className="table-card" title="Drop-off Risk Watchlist" eyebrow="Direct backend endpoint">
          <div className="risk-list">
            {dropOffData.map((risk) => (
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

function Header({
  role,
  roleKey,
  setRoleKey,
}: {
  role: (typeof roles)[RoleKey];
  roleKey: RoleKey;
  setRoleKey: (role: RoleKey) => void;
}) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">
          <BarChart3 size={19} />
        </span>
        <strong>Strata EdAnalytics</strong>
        <em>{role.label}</em>
      </div>
      <div className="topbar-right">
        <div className="role-switcher">
          {(Object.keys(roles) as RoleKey[]).map((key) => (
            <button
              key={key}
              className={roleKey === key ? 'active' : ''}
              onClick={() => setRoleKey(key)}
            >
              {roles[key].label}
            </button>
          ))}
        </div>
        <button className="icon-button" title="Notifications">
          <Bell size={18} />
        </button>
        <button className="avatar-button" title={role.name}>
          {role.initials}
        </button>
        <button className="icon-button" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}

function Sidebar() {
  const links = [
    ['Overview Dashboard', LayoutDashboard],
    ['Course Catalog', GraduationCap],
    ['Student Roster', Users],
    ['Revenue Reports', TrendingUp],
    ['Role Permissions', ShieldCheck],
  ] as const;

  return (
    <aside className="sidebar">
      <div>
        <div className="telemetry-card">
          <span>Active Telemetry</span>
          <strong>AY 2024-25 Q3</strong>
        </div>
        <nav>
          {links.map(([label, Icon], index) => (
            <a key={label} className={index === 0 ? 'active' : ''} href="#">
              <Icon size={19} />
              {label}
            </a>
          ))}
        </nav>
      </div>
      <div className="node-card">
        <Globe2 size={17} />
        <span>Node: East-Cluster-09</span>
        <b>ONLINE</b>
      </div>
    </aside>
  );
}

function MetricCard({
  label,
  value,
  caption,
  trend,
  icon,
}: {
  label: string;
  value: string;
  caption: string;
  trend: string;
  icon: React.ReactNode;
}) {
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
