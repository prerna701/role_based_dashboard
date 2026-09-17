'use client';

import { useEffect, useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { LoadingState } from '@/components/dashboard/loading-state';
import { PageHeading } from '@/components/dashboard/page-heading';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuthSession } from '@/components/providers/auth-session-provider';
import { loadOverview } from '@/lib/analytics-api';
import { formatCurrency } from '@/lib/dashboard-data';
import type { DashboardData } from '@/types/analytics';

export default function PermissionsPage() {
  const { token, role, roleKey, scopedRegion, isAuthenticated } = useAuthSession();
  const [overview, setOverview] = useState<DashboardData['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    loadOverview({ token, region: scopedRegion, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setOverview(data.summary);
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
          eyebrow="Role permissions"
          title="Access Scope"
          description="Your dashboard visibility is resolved from the authenticated JWT and backend user region."
        />

        <section className="dashboard-grid">
          <Card title="Current Access" eyebrow="Authenticated role">
            <div className="locked-panel">
              <ShieldCheck size={30} />
              <strong>{role.label}</strong>
              <p>
                {roleKey === 'admin'
                  ? 'Admin can view all regions and can filter reports by an individual region.'
                  : `This account is locked to ${role.scopeLabel}. Requests for other regions are rejected by the backend.`}
              </p>
              <span>{role.allowedRegions.join(', ')}</span>
            </div>
          </Card>

          <Card title="Backend Enforcement" eyebrow="GET /analytics/overview">
            {loading ? (
              <LoadingState message="Verifying scoped access with the backend..." />
            ) : error ? (
              <EmptyState message={error} />
            ) : (
              <div className="scope-proof-grid">
                <article>
                  <span>Visible Students</span>
                  <strong>{overview?.totalStudents ?? 0}</strong>
                </article>
                <article>
                  <span>Visible Enrollments</span>
                  <strong>{overview?.totalEnrollments ?? 0}</strong>
                </article>
                <article>
                  <span>Visible Revenue</span>
                  <strong>{formatCurrency(overview?.netRevenue ?? 0)}</strong>
                </article>
              </div>
            )}
            <div className="risk-list">
              <article className="risk-item">
                <Lock size={18} />
                <div>
                  <strong>JWT required</strong>
                  <span>Every analytics call sends Authorization: Bearer token</span>
                </div>
              </article>
              <article className="risk-item">
                <Lock size={18} />
                <div>
                  <strong>Region scoped</strong>
                  <span>Managers cannot request another region with curl or UI filters</span>
                </div>
              </article>
              <article className="risk-item">
                <Lock size={18} />
                <div>
                  <strong>Single endpoints</strong>
                  <span>Same analytics APIs serve Admin, North, and South roles</span>
                </div>
              </article>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
