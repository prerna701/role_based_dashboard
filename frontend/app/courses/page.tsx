'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { EmptyState } from '@/components/dashboard/empty-state';
import { LoadingState } from '@/components/dashboard/loading-state';
import { Sidebar } from '@/components/dashboard/sidebar';
import { getStoredAuthSession, loadPopularCourses } from '@/lib/analytics-api';
import { canAccessRegion, formatCurrency, roles, resolveRegionForRole } from '@/lib/dashboard-data';
import type { PopularCourse } from '@/types/analytics';
import type { RoleKey } from '@/types/dashboard';

export default function CoursesPage() {
  const router = useRouter();
  const [roleKey, setRoleKey] = useState<RoleKey>('admin');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [token, setToken] = useState<string | null>(null);
  const [courses, setCourses] = useState<PopularCourse[]>([]);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = roles[roleKey];
  const scopedRegion = resolveRegionForRole(roleKey, selectedRegion);

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
    loadPopularCourses({ token, region: scopedRegion, page: 1, limit: 50 })
      .then(setCourses)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [scopedRegion, token]);

  const categories = useMemo(
    () => Array.from(new Set(courses.map((course) => course.category))),
    [courses],
  );

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesQuery = course.title.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        categoryFilter === 'all' || course.category === categoryFilter;

      return matchesQuery && matchesCategory;
    });
  }, [categoryFilter, courses, query]);

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
            <p className="card-eyebrow">Course catalog</p>
            <h1>Courses</h1>
            <p className="page-description">
              Review catalog performance from the same scoped backend analytics endpoint.
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

        <Card className="table-card" title="Course Catalog" eyebrow="GET /analytics/popular-courses">
          <div className="table-tools">
            <label>
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses..."
              />
            </label>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <LoadingState message="Loading courses from the backend..." />
          ) : error ? (
            <EmptyState message={error} />
          ) : (
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
                  <tr><td colSpan={6}><EmptyState message="No courses match the current filters." /></td></tr>
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
                    <td><span className="category-badge">{course.category}</span></td>
                    <td>{course.enrollments}</td>
                    <td>{course.rating}</td>
                    <td>{formatCurrency(course.fees)}</td>
                    <td>
                      <div className="completion-cell">
                        <span><i style={{ width: `${course.completionRate}%` }} /></span>
                        <b>{course.completionRate}%</b>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          )}
        </Card>
      </main>
    </div>
  );
}
