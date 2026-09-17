import {
  categoryRevenue,
  completionStatus,
  dropOffRisks,
  monthlyRevenue,
  popularCourses,
  regions,
} from './dashboard-data';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type RequestOptions = {
  token?: string | null;
  region?: string;
  page?: number;
  limit?: number;
};

const roleCredentials = {
  admin: {
    email: 'admin@dashboard.test',
    password: 'Admin@123',
  },
  north: {
    email: 'north.manager@dashboard.test',
    password: 'North@123',
  },
  south: {
    email: 'south.manager@dashboard.test',
    password: 'South@123',
  },
};

const categoryColors: Record<string, string> = {
  'Data & Analytics': '#0284c7',
  Programming: '#4f46e5',
  'Programming & Systems': '#4f46e5',
  'Business Strategy': '#d97706',
  'Business & Strategy': '#d97706',
  'Design & UX': '#9333ea',
};

export type RoleCredentialKey = keyof typeof roleCredentials;

function regionCodeFromKey(region?: string): string | undefined {
  if (!region || region === 'all') {
    return undefined;
  }

  return region.charAt(0).toUpperCase() + region.slice(1).toLowerCase();
}

async function fetchJson<T>(path: string, options: RequestOptions): Promise<T | null> {
  if (!options.token) {
    return null;
  }

  const params = new URLSearchParams();
  const regionCode = regionCodeFromKey(options.region);
  if (regionCode) {
    params.set('region', regionCode);
  }
  if (options.page) {
    params.set('page', String(options.page));
  }
  if (options.limit) {
    params.set('limit', String(options.limit));
  }

  try {
    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}${path}${query ? `?${query}` : ''}`, {
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function unwrapData<T>(payload: unknown): T | null {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return null;
}

function unwrapList<T>(payload: unknown): T[] | null {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  const data = unwrapData<unknown>(payload);
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    if (Array.isArray(nested.items)) {
      return nested.items as T[];
    }
    if (Array.isArray(nested.data)) {
      return nested.data as T[];
    }
  }

  return null;
}

type LoginPayload = {
  token: string;
  user?: {
    id: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    regionCode?: string | null;
  };
};

type ApiResponse<T> = {
  data: T;
};

type OverviewPayload = {
  summary: {
    totalStudents: number;
    totalEnrollments: number;
    averageRating: number;
    netRevenue: number;
  };
  regions: typeof regions;
  completionStatus: typeof completionStatus;
};

type CategoryRevenuePayload = {
  category: string;
  enrollments: number;
  revenue: number;
  share: number;
}[];

type MonthlyRevenuePayload = {
  month: string;
  enrollments: number;
  revenue: number;
}[];

type DropOffPayload = {
  courseId: string;
  courseTitle: string;
  category: string;
  enrollments: number;
  droppedEnrollments: number;
  dropOffRate: number;
  revenueAtRisk: number;
}[];

type PopularCoursesPayload = {
  courseId: string;
  title: string;
  category: string;
  enrollments: number;
  averageRating: number;
  totalFees: number;
  completionRate: number;
}[];

export async function loginAsRole(roleKey: RoleCredentialKey): Promise<LoginPayload | null> {
  const credentials = roleCredentials[roleKey];

  try {
    const response = await fetch(`${API_BASE_URL}/auth/email/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      return null;
    }

    const responsePayload = (await response.json()) as ApiResponse<LoginPayload>;
    const payload = responsePayload.data;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('accessToken', payload.token);
    }

    return payload;
  } catch {
    return null;
  }
}

export async function loadDashboardData(options: RequestOptions) {
  const [overviewPayload, categoryPayload, dropOffPayload, monthlyPayload, coursesPayload] =
    await Promise.all([
      fetchJson('/analytics/overview', options),
      fetchJson('/analytics/revenue-by-category', options),
      fetchJson('/analytics/drop-off-by-course', { ...options, page: 1, limit: 5 }),
      fetchJson('/analytics/monthly-revenue', { ...options, page: 1, limit: 12 }),
      fetchJson('/analytics/popular-courses', { ...options, page: 1, limit: 10 }),
    ]);

  const overview = unwrapData<OverviewPayload>(overviewPayload);
  const categories = unwrapList<CategoryRevenuePayload[number]>(categoryPayload);
  const dropOff = unwrapList<DropOffPayload[number]>(dropOffPayload);
  const monthly = unwrapList<MonthlyRevenuePayload[number]>(monthlyPayload);
  const courses = unwrapList<PopularCoursesPayload[number]>(coursesPayload);

  return {
    summary: overview?.summary ?? {
      totalStudents: regions[0].students,
      totalEnrollments: regions[0].enrollments,
      averageRating: 3.8,
      netRevenue: regions[0].revenue,
    },
    regions: overview?.regions ?? regions,
    completionStatus: (overview?.completionStatus ?? completionStatus).map((item) => ({
      ...item,
      color:
        item.label === 'Completed'
          ? '#059669'
          : item.label === 'Dropped'
            ? '#dc2626'
            : '#4f46e5',
    })),
    categoryRevenue: (categories ?? categoryRevenue).map((item) => ({
      ...item,
      color: categoryColors[item.category] ?? '#3525cd',
    })),
    dropOffRisks: (dropOff ?? dropOffRisks).map((item) => ({
      course: 'courseTitle' in item ? item.courseTitle : item.course,
      region: 'region' in item ? item.region : 'Scoped',
      dropped: 'droppedEnrollments' in item ? item.droppedEnrollments : item.dropped,
      dropRate:
        'dropOffRate' in item
          ? Number((item.dropOffRate * 100).toFixed(1))
          : item.dropRate,
    })),
    monthlyRevenue: monthly ?? monthlyRevenue,
    popularCourses: (courses ?? popularCourses).map((course, index) => ({
      rank: index + 1,
      title: course.title,
      code: 'courseId' in course ? course.courseId : course.code,
      category: course.category,
      enrollments: course.enrollments,
      rating: 'averageRating' in course ? course.averageRating : course.rating,
      fees: 'totalFees' in course ? course.totalFees : course.fees,
      completionRate: course.completionRate,
    })),
    source:
      overviewPayload && categoryPayload && dropOffPayload && monthlyPayload && coursesPayload
        ? 'api'
        : 'preview',
  } as const;
}
