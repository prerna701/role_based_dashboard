import type {
  CategoryRevenue,
  CompletionStatus,
  DashboardData,
  DropOffRisk,
  MonthlyRevenue,
  PopularCourse,
  RegionSummary,
  StudentsPage,
} from '@/types/analytics';
import type { RoleKey } from '@/types/dashboard';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

type RequestOptions = {
  token?: string | null;
  region?: string;
  page?: number;
  limit?: number;
  search?: string;
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

async function fetchJson<T>(path: string, options: RequestOptions): Promise<T> {
  if (!options.token) {
    throw new Error('You must be logged in to load dashboard data.');
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
  if (options.search) {
    params.set('search', options.search);
  }

  try {
    const query = params.toString();
    const response = await fetch(`${API_BASE_URL}${path}${query ? `?${query}` : ''}`, {
      headers: {
        Authorization: `Bearer ${options.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Dashboard request failed with status ${response.status}.`);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to connect to the dashboard API.');
  }
}

function unwrapData<T>(payload: unknown): T | null {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }

  return null;
}

function unwrapList<T>(payload: unknown): T[] {
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

  throw new Error('The analytics list response was invalid.');
}

type LoginPayload = {
  token: string;
  user?: {
    id: number;
    email?: string;
    firstName?: string;
    lastName?: string;
    role?: {
      id?: number | string;
      name?: string;
    } | null;
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
  regions: RegionSummary[];
  completionStatus: CompletionStatus[];
};

type CategoryRevenuePayload = {
  category: string;
  enrollments: number;
  revenue: number;
  share: number;
};

type MonthlyRevenuePayload = {
  month: string;
  enrollments: number;
  revenue: number;
};

type DropOffPayload = {
  courseId: string;
  courseTitle: string;
  category: string;
  enrollments: number;
  droppedEnrollments: number;
  dropOffRate: number;
  revenueAtRisk: number;
};

type PopularCoursesPayload = {
  courseId: string;
  title: string;
  category: string;
  enrollments: number;
  averageRating: number;
  totalFees: number;
  completionRate: number;
};

type StudentsPayload = StudentsPage['data'][number];

function colorizeCategoryRevenue(
  categories: CategoryRevenuePayload[],
): CategoryRevenue[] {
  return categories.map((item) => ({
    ...item,
    color: categoryColors[item.category] ?? '#3525cd',
  }));
}

type JwtPayload = {
  role?: {
    id?: number | string;
    name?: string;
  } | null;
};

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const encodedPayload = token.split('.')[1];

    if (!encodedPayload) {
      return null;
    }

    const normalizedPayload = encodedPayload
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
    const decodedPayload = JSON.parse(atob(normalizedPayload)) as JwtPayload;

    return decodedPayload;
  } catch {
    return null;
  }
}

export function resolveRoleKeyFromLoginPayload(payload: LoginPayload): RoleKey {
  const jwtPayload = decodeJwtPayload(payload.token);
  const roleId = String(jwtPayload?.role?.id ?? payload.user?.role?.id ?? '');
  const regionCode = payload.user?.regionCode?.toLowerCase();

  if (roleId === '1') {
    return 'admin';
  }

  if (roleId === '3' && regionCode === 'north') {
    return 'north';
  }

  if (roleId === '3' && regionCode === 'south') {
    return 'south';
  }

  return 'admin';
}

function withAllRegions(
  summary: DashboardData['summary'],
  regionList: RegionSummary[],
): RegionSummary[] {
  return [
    {
      key: 'all',
      label: 'All Regions',
      students: summary.totalStudents,
      enrollments: summary.totalEnrollments,
      revenue: summary.netRevenue,
    },
    ...regionList.filter((region) => region.key !== 'all'),
  ];
}

export async function loginAsRole(roleKey: RoleCredentialKey): Promise<LoginPayload> {
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
      throw new Error(`Login failed with status ${response.status}.`);
    }

    const responsePayload = (await response.json()) as ApiResponse<LoginPayload>;
    const payload = responsePayload.data;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('accessToken', payload.token);
    }

    return payload;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Unable to connect to the authentication API.');
  }
}

export async function loadDashboardData(options: RequestOptions): Promise<DashboardData> {
  const [overviewPayload, categoryPayload, dropOffPayload, monthlyPayload, coursesPayload, studentsPayload] =
    await Promise.all([
      fetchJson('/analytics/overview', options),
      fetchJson('/analytics/revenue-by-category', options),
      fetchJson('/analytics/drop-off-by-course', { ...options, page: 1, limit: 5 }),
      fetchJson('/analytics/monthly-revenue', { ...options, page: 1, limit: 12 }),
      fetchJson('/analytics/popular-courses', { ...options, page: 1, limit: 10 }),
      fetchJson('/analytics/students', { ...options, page: 1, limit: 10 }),
    ]);

  const overview = unwrapData<OverviewPayload>(overviewPayload);
  const categories = unwrapList<CategoryRevenuePayload>(categoryPayload);
  const dropOff = unwrapList<DropOffPayload>(dropOffPayload);
  const monthly = unwrapList<MonthlyRevenuePayload>(monthlyPayload);
  const courses = unwrapList<PopularCoursesPayload>(coursesPayload);
  const students = unwrapList<StudentsPayload>(studentsPayload);

  if (!overview) {
    throw new Error('The analytics overview response was invalid.');
  }

  return {
    summary: overview.summary,
    regions: withAllRegions(overview.summary, overview.regions),
    completionStatus: overview.completionStatus.map((item) => ({
      ...item,
      color:
        item.label === 'Completed'
          ? '#059669'
          : item.label === 'Dropped'
            ? '#dc2626'
            : '#4f46e5',
    })),
    categoryRevenue: colorizeCategoryRevenue(categories),
    dropOffRisks: dropOff.map((item) => ({
      course: item.courseTitle,
      region: 'Scoped',
      dropped: item.droppedEnrollments,
      dropRate: Number((item.dropOffRate * 100).toFixed(1)),
    })),
    monthlyRevenue: monthly.map((item) => ({
      month: item.month,
      enrollments: item.enrollments,
      revenue: item.revenue,
    })),
    popularCourses: courses.map((course, index) => ({
      rank: index + 1,
      title: course.title,
      code: course.courseId,
      category: course.category,
      enrollments: course.enrollments,
      rating: course.averageRating,
      fees: course.totalFees,
      completionRate: course.completionRate,
    })),
    students,
    source: 'api',
  };
}

export async function loadRevenueByCategory(
  options: RequestOptions,
): Promise<CategoryRevenue[]> {
  const payload = await fetchJson('/analytics/revenue-by-category', options);

  return colorizeCategoryRevenue(unwrapList<CategoryRevenuePayload>(payload));
}

export async function loadStudents(options: RequestOptions): Promise<StudentsPage> {
  const payload = await fetchJson('/analytics/students', options);
  const data = unwrapList<StudentsPayload>(payload);
  const meta = (payload as { meta?: StudentsPage['meta'] }).meta;

  if (!meta) {
    throw new Error('The students pagination response was invalid.');
  }

  return { data, meta };
}

export function getStoredAccessToken(): string | null {
  return typeof window === 'undefined'
    ? null
    : window.localStorage.getItem('accessToken');
}
