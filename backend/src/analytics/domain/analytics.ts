export type AnalyticsRegionScope = {
  regionCode: string | null;
};

export type AnalyticsPagination = {
  page: number;
  limit: number;
  offset: number;
};

export type AnalyticsPaginatedResult<T> = {
  data: T[];
  total: number;
};

export type AnalyticsPaginationMeta = {
  region: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AnalyticsSummary = {
  totalStudents: number;
  totalEnrollments: number;
  averageRating: number;
  netRevenue: number;
};

export type AnalyticsRegionSummary = {
  key: string;
  label: string;
  students: number;
  enrollments: number;
  revenue: number;
};

export type AnalyticsCompletionStatus = {
  label: string;
  value: number;
  percent: number;
};

export type AnalyticsOverview = {
  summary: AnalyticsSummary;
  regions: AnalyticsRegionSummary[];
  completionStatus: AnalyticsCompletionStatus[];
};

export type CategoryRevenue = {
  category: string;
  enrollments: number;
  revenue: number;
  share: number;
};

export type PopularCourse = {
  courseId: string;
  title: string;
  category: string;
  enrollments: number;
  averageRating: number;
  totalFees: number;
  completionRate: number;
};

export type DropOffCourse = {
  courseId: string;
  courseTitle: string;
  category: string;
  enrollments: number;
  droppedEnrollments: number;
  dropOffRate: number;
  revenueAtRisk: number;
};

export type MonthlyRevenue = {
  month: string;
  enrollments: number;
  revenue: number;
};

export type StudentCourse = {
  courseId: string;
  title: string;
  category: string;
  level: string;
  instructor: string;
  durationWeeks: number;
  enrolledOn: string;
  completionStatus: string;
  grade: string | null;
  rating: number;
  feePaid: number;
};

export type StudentEnrollmentSummary = {
  completed: number;
  inProgress: number;
  dropped: number;
};

export type StudentDetails = {
  studentId: string;
  name: string;
  region: string;
  joinedOn: string;
  courses: StudentCourse[];
  completion: StudentEnrollmentSummary;
};
