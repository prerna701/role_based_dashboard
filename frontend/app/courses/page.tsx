'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/empty-state';
import { LoadingState } from '@/components/dashboard/loading-state';
import { PageHeading } from '@/components/dashboard/page-heading';
import { Sidebar } from '@/components/dashboard/sidebar';
import { CourseTable } from '@/components/courses/course-table';
import { useAuthSession } from '@/components/providers/auth-session-provider';
import { loadPopularCourses } from '@/lib/analytics-api';
import type { PopularCourse } from '@/types/analytics';

export default function CoursesPage() {
  const {
    token,
    role,
    roleKey,
    scopedRegion,
    changeRegion,
    isAuthenticated,
  } = useAuthSession();
  const [courses, setCourses] = useState<PopularCourse[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !isAuthenticated) return;

    setLoading(true);
    setError(null);
    loadPopularCourses({ token, region: scopedRegion, page: 1, limit: 50 })
      .then(setCourses)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [isAuthenticated, scopedRegion, token]);

  const categories = useMemo(
    () => Array.from(new Set(courses.map((course) => course.category))),
    [courses],
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesQuery = course.title
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || course.category === categoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [categoryFilter, courses, query]);

  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="dashboard-main">
        <PageHeading
          eyebrow="Course catalog"
          title="Courses"
          description="Review catalog performance from the same scoped backend analytics endpoint."
          role={role}
          roleKey={roleKey}
          scopedRegion={scopedRegion}
          onRegionChange={changeRegion}
        />

        <Card
          className="table-card"
          title="Course Catalog"
          eyebrow="GET /analytics/popular-courses"
        >
          {loading ? (
            <LoadingState message="Loading courses from the backend..." />
          ) : error ? (
            <EmptyState message={error} />
          ) : (
            <CourseTable
              courses={filteredCourses}
              categories={categories}
              query={query}
              categoryFilter={categoryFilter}
              onQueryChange={setQuery}
              onCategoryFilterChange={setCategoryFilter}
            />
          )}
        </Card>
      </main>
    </div>
  );
}
