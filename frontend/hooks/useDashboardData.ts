import { useEffect, useMemo, useState } from 'react';
import { useAuthSession } from '@/components/providers/auth-session-provider';
import { loadDashboardData } from '@/lib/analytics-api';
import type { DashboardData } from '@/types/analytics';

export function useDashboardData() {
  const {
    token,
    role,
    roleKey,
    scopedRegion,
    changeRegion,
    isAuthenticated,
  } = useAuthSession();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const isRegionalRole = roleKey !== 'admin';

  useEffect(() => {
    if (!token || !isAuthenticated) {
      setDashboardData(null);
      return;
    }

    const controller = new AbortController();
    setErrorMessage(null);
    loadDashboardData({ token, region: scopedRegion, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setDashboardData(data);
        }
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError' && !controller.signal.aborted) {
          setErrorMessage(error.message);
        }
      });

    return () => controller.abort();
  }, [isAuthenticated, scopedRegion, token]);

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

  return {
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
  };
}
