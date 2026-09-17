'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { LoadingState } from '@/components/dashboard/loading-state';
import { Sidebar } from '@/components/dashboard/sidebar';
import { getStoredAuthSession, loadOverview, type AuthSession } from '@/lib/analytics-api';
import { formatCurrency, roles, resolveRegionForRole } from '@/lib/dashboard-data';
import type { DashboardData } from '@/types/analytics';

export default function PermissionsPage() {
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [overview, setOverview] = useState<DashboardData['summary'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedSession = getStoredAuthSession();

    if (!storedSession) {
      router.replace('/login');
      return;
    }

    setSession(storedSession);
  }, [router]);

  useEffect(() => {
    if (!session) return;

    setLoading(true);
    setError(null);

    loadOverview({
      token: session.token,
      region: resolveRegionForRole(session.roleKey, 'all'),
    })
      .then((data) => setOverview(data.summary))
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [session]);

  const role = session ? roles[session.roleKey] : roles.admin;

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <div className="page-heading">
          <div>
            <Button className="back-link" href="/" variant="ghost">
              <ArrowLeft size={16} /> Back to dashboard
            </Button>
            <p className="card-eyebrow">Role permissions</p>
            <h1>Access Scope</h1>
            <p className="page-description">
              Your dashboard visibility is resolved from the authenticated JWT and backend user region.
            </p>
          </div>
        </div>

        <section className="dashboard-grid">
          <Card title="Current Access" eyebrow="Authenticated role">
            <div className="locked-panel">
              <ShieldCheck size={30} />
              <strong>{role.label}</strong>
              <p>
                {session?.roleKey === 'admin'
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
