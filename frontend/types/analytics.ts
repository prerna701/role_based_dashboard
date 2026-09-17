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
  students: StudentDetails[];
  source: 'api';
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

export type StudentDetails = {
  studentId: string;
  name: string;
  region: string;
  joinedOn: string;
  courses: StudentCourse[];
  completion: {
    completed: number;
    inProgress: number;
    dropped: number;
  };
};

export type StudentsPage = {
  data: StudentDetails[];
  meta: {
    region: string | null;
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
