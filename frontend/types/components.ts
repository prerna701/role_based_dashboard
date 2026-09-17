import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';
import type { DashboardRole, RoleKey } from '@/types/dashboard';
import type { CategoryRevenue, MonthlyRevenue, PopularCourse, StudentCourse, StudentsPage } from '@/types/analytics';
import { type AuthSession } from '@/lib/analytics-api';
import { type roles } from '@/lib/dashboard-data';
import { type EnrollmentStatus } from '@/lib/formatters';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  className?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  eyebrow?: string;
  action?: ReactNode;
};

export type DataTableProps = {
  children: ReactNode;
  className?: string;
  minWidth?: number;
};

export interface AuthButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export type EmptyStateProps = {
  message: string;
};

export type LoadingStateProps = {
  message: string;
};

export type MetricCardProps = {
  label: string;
  value: string;
  caption: string;
  trend: string;
  icon: ReactNode;
};

export type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  role?: DashboardRole;
  roleKey?: RoleKey;
  scopedRegion?: string;
  onRegionChange?: (region: string) => void;
};

export type RegionScopeControlProps = {
  role: DashboardRole;
  roleKey: RoleKey;
  scopedRegion: string;
  onRegionChange: (region: string) => void;
};

export type RevenueByCategoryWidgetProps = {
  initialData: CategoryRevenue[];
  initialRegion: string;
  roleKey: RoleKey;
  token: string | null;
};

export type CompletionTotals = {
  completed: number;
  inProgress: number;
  dropped: number;
};

export type CompletionStatusCardProps = {
  totals: CompletionTotals;
};

export type StudentCourseTableProps = {
  studentId: string;
  courses: StudentCourse[];
};

export type StudentMetricsProps = {
  totalStudents: number;
  completionTotals: CompletionTotals;
};

export type StudentRosterProps = {
  studentsPage: StudentsPage | null;
  search: string;
  page: number;
  scopeLabel: string;
  loading: boolean;
  error: string | null;
  onSearchChange: (search: string) => void;
  onPageChange: (page: number) => void;
};

export type CategoryRevenueChartProps = {
  data: CategoryRevenue[];
};

export type MonthlyRevenueChartProps = {
  data: MonthlyRevenue[];
};

export type RevenueMetricsProps = {
  totalRevenue: number;
  categoryCount: number;
};

export type CourseTableProps = {
  courses: PopularCourse[];
  categories: string[];
  query: string;
  categoryFilter: string;
  onQueryChange: (query: string) => void;
  onCategoryFilterChange: (category: string) => void;
};

export type AuthSessionContextValue = {
  session: AuthSession | null;
  token: string | null;
  roleKey: RoleKey;
  role: (typeof roles)[RoleKey];
  selectedRegion: string;
  scopedRegion: string;
  isReady: boolean;
  isAuthenticated: boolean;
  changeRegion: (region: string) => void;
};
