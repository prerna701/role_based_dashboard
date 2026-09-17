'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { LoadingState } from '@/components/dashboard/loading-state';
import { Sidebar } from '@/components/dashboard/sidebar';
import { getStoredAccessToken, loadStudents, loginAsRole } from '@/lib/analytics-api';
import { canAccessRegion, roles, resolveRegionForRole } from '@/lib/dashboard-data';
import type { StudentsPage } from '@/types/analytics';
import type { RoleKey } from '@/types/dashboard';

const statusLabels = {
  completed: 'Completed',
  in_progress: 'In Progress',
  dropped: 'Dropped',
} as const;

export default function StudentsPage() {
  const [roleKey, setRoleKey] = useState<RoleKey>('admin');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [token, setToken] = useState<string | null>(getStoredAccessToken());
  const [studentsPage, setStudentsPage] = useState<StudentsPage | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const scopedRegion = resolveRegionForRole(roleKey, selectedRegion);
  const role = roles[roleKey];

  useEffect(() => {
    if (token) return;

    loginAsRole('admin')
      .then((payload) => setToken(payload.token))
      .catch((requestError: Error) => {
        setError(requestError.message);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);
    loadStudents({ token, region: scopedRegion, page, limit: 10, search })
      .then(setStudentsPage)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [page, scopedRegion, search, token]);

  const completionTotals = useMemo(() => {
    return (studentsPage?.data ?? []).reduce(
      (totals, student) => ({
        completed: totals.completed + student.completion.completed,
        inProgress: totals.inProgress + student.completion.inProgress,
        dropped: totals.dropped + student.completion.dropped,
      }),
      { completed: 0, inProgress: 0, dropped: 0 },
    );
  }, [studentsPage]);

  async function changeRole(nextRole: RoleKey) {
    setRoleKey(nextRole);
    setSelectedRegion(resolveRegionForRole(nextRole, selectedRegion));
    setPage(1);
    const payload = await loginAsRole(nextRole);
    setToken(payload.token);
  }

  function changeRegion(region: string) {
    if (canAccessRegion(roleKey, region)) {
      setSelectedRegion(region);
      setPage(1);
    }
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main students-page">
        <div className="page-heading">
          <div>
            <Button className="back-link" href="/" variant="ghost">
              <ArrowLeft size={16} /> Back to dashboard
            </Button>
            <p className="card-eyebrow">Student intelligence</p>
            <h1>Students and Enrollments</h1>
            <p className="page-description">
              Review every student, their enrolled courses, and completion progress within your access scope.
            </p>
          </div>
          <div className="student-controls">
            <label className="role-select">
              <span>Role</span>
              <select value={roleKey} onChange={(event) => changeRole(event.target.value as RoleKey)}>
                {(Object.keys(roles) as RoleKey[]).map((key) => (
                  <option key={key} value={key}>{roles[key].label}</option>
                ))}
              </select>
            </label>
            <label className="role-select">
              <span>Region</span>
              <select value={scopedRegion} onChange={(event) => changeRegion(event.target.value)}>
                {role.allowedRegions.map((region) => (
                  <option key={region} value={region}>{region === 'all' ? 'All Regions' : region}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <section className="metric-grid student-metrics">
          <Card className="metric-card">
            <div className="metric-top"><span>Students in scope</span><Users size={20} /></div>
            <div className="metric-value"><strong>{studentsPage?.meta.total ?? 0}</strong></div>
            <small>Unique students</small>
          </Card>
          <Card className="metric-card">
            <div className="metric-top"><span>Completed</span><BookOpen size={20} /></div>
            <div className="metric-value"><strong>{completionTotals.completed}</strong></div>
            <small>Course enrollments</small>
          </Card>
          <Card className="metric-card">
            <div className="metric-top"><span>In progress</span><BookOpen size={20} /></div>
            <div className="metric-value"><strong>{completionTotals.inProgress}</strong></div>
            <small>Active enrollments</small>
          </Card>
          <Card className="metric-card">
            <div className="metric-top"><span>Dropped</span><BookOpen size={20} /></div>
            <div className="metric-value"><strong>{completionTotals.dropped}</strong></div>
            <small>Needs attention</small>
          </Card>
        </section>

        <Card className="completion-card" title="Completion status" eyebrow="Current page enrollment distribution">
          <div className="completion-bars">
            {Object.entries(completionTotals).map(([status, value]) => {
              const total = completionTotals.completed + completionTotals.inProgress + completionTotals.dropped;
              const percent = total ? Math.round((value / total) * 100) : 0;
              return <div className="completion-bar-row" key={status}><strong>{statusLabels[status as keyof typeof statusLabels]}</strong><span><i className={`bar-${status}`} style={{ width: `${percent}%` }} /></span><b>{value} ({percent}%)</b></div>;
            })}
          </div>
        </Card>

        <Card className="table-card" title="Student roster" eyebrow="Paginated enrollment details">
          <div className="table-tools">
            <label><Search size={17} /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search student name or ID..." /></label>
            <span className="api-pill">{role.scopeLabel}</span>
          </div>
          {loading ? <LoadingState message="Loading students from the backend..." /> : error ? <EmptyState message={error} /> : studentsPage?.data.length === 0 ? <EmptyState message="No students match this search." /> : (
            <div className="student-list">
              {studentsPage?.data.map((student) => (
                <article className="student-card" key={student.studentId}>
                  <div className="student-card-heading">
                    <div>
                      <h2>{student.name}</h2>
                      <span>{student.studentId} | Joined {student.joinedOn}</span>
                    </div>
                    <div className="student-card-summary">
                      <strong>{student.courses.length} courses</strong>
                      <span>{student.completion.completed} completed</span>
                    </div>
                  </div>
                  <div className="course-detail-list">
                    {student.courses.map((course) => (
                      <div className="course-detail" key={`${student.studentId}-${course.courseId}`}>
                        <div>
                          <strong>{course.title}</strong>
                          <span>
                            {course.category} | {course.level} | {course.instructor} | {course.durationWeeks} weeks
                          </span>
                        </div>
                        <div className="course-detail-meta">
                          <span>Enrolled {course.enrolledOn}</span>
                          <span className={`status-pill status-${course.completionStatus}`}>
                            {statusLabels[course.completionStatus as keyof typeof statusLabels] ?? course.completionStatus}
                          </span>
                          <span>{course.grade ?? 'No grade'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
          {studentsPage && studentsPage.meta.totalPages > 1 && (
            <div className="pagination">
              <Button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} variant="secondary">
                Previous
              </Button>
              <span>Page {page} of {studentsPage.meta.totalPages}</span>
              <Button disabled={page >= studentsPage.meta.totalPages} onClick={() => setPage((current) => current + 1)} variant="secondary">
                Next
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
