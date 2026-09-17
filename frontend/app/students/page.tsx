'use client';

import { useEffect, useMemo, useState } from 'react';
import { PageHeading } from '@/components/dashboard/page-heading';
import { Sidebar } from '@/components/dashboard/sidebar';
import { useAuthSession } from '@/components/providers/auth-session-provider';
import { CompletionStatusCard } from '@/components/students/completion-status-card';
import { StudentMetrics } from '@/components/students/student-metrics';
import type { CompletionTotals } from '@/types/components';
import { StudentRoster } from '@/components/students/student-roster';
import { loadStudents } from '@/lib/analytics-api';
import type { StudentsPage } from '@/types/analytics';

const emptyCompletionTotals: CompletionTotals = {
  completed: 0,
  inProgress: 0,
  dropped: 0,
};

export default function StudentsPage() {
  const {
    token,
    role,
    roleKey,
    scopedRegion,
    changeRegion,
    isAuthenticated,
  } = useAuthSession();
  const [studentsPage, setStudentsPage] = useState<StudentsPage | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [scopedRegion]);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    loadStudents({ token, region: scopedRegion, page, limit: 10, search, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setStudentsPage(data);
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
  }, [isAuthenticated, page, scopedRegion, search, token]);

  const completionTotals = useMemo(() => {
    return (studentsPage?.data ?? []).reduce(
      (totals, student) => ({
        completed: totals.completed + student.completion.completed,
        inProgress: totals.inProgress + student.completion.inProgress,
        dropped: totals.dropped + student.completion.dropped,
      }),
      emptyCompletionTotals,
    );
  }, [studentsPage]);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main students-page">
        <PageHeading
          eyebrow="Student intelligence"
          title="Students and Enrollments"
          description="Review every student, their enrolled courses, and completion progress within your access scope."
          role={role}
          roleKey={roleKey}
          scopedRegion={scopedRegion}
          onRegionChange={changeRegion}
        />

        <StudentMetrics
          totalStudents={studentsPage?.meta.total ?? 0}
          completionTotals={completionTotals}
        />

        <CompletionStatusCard totals={completionTotals} />

        <StudentRoster
          studentsPage={studentsPage}
          search={search}
          page={page}
          scopeLabel={role.scopeLabel}
          loading={loading}
          error={error}
          onSearchChange={setSearch}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}
