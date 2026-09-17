export type RegionSummary = {
  key: string;
  label: string;
  students: number;
  enrollments: number;
  revenue: number;
};

export type CompletionStatus = {
  label: string;
  value: number;
  percent: number;
  color?: string;
};

export type CategoryRevenue = {
  category: string;
  enrollments: number;
  revenue: number;
  share: number;
  color?: string;
};

export type DropOffRisk = {
  course: string;
  region: string;
  dropped: number;
  dropRate: number;
};

export type MonthlyRevenue = {
  month: string;
  enrollments?: number;
  revenue: number;
};

export type PopularCourse = {
  rank: number;
  title: string;
  code: string;
  category: string;
  enrollments: number;
  rating: number;
  fees: number;
  completionRate: number;
};

export type DashboardData = {
  summary: {
    totalStudents: number;
    totalEnrollments: number;
    averageRating: number;
    netRevenue: number;
  };
  regions: RegionSummary[];
  completionStatus: CompletionStatus[];
  categoryRevenue: CategoryRevenue[];
  dropOffRisks: DropOffRisk[];
  monthlyRevenue: MonthlyRevenue[];
  popularCourses: PopularCourse[];
  source: 'api';
};
