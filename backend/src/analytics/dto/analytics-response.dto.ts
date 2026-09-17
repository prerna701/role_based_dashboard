import {
  AnalyticsOverview,
  AnalyticsPaginationMeta,
  CategoryRevenue,
  DropOffCourse,
  MonthlyRevenue,
  PopularCourse,
} from '../domain/analytics';

export type AnalyticsResponseMeta = {
  region: string | null;
};

export type RevenueByCategoryResponse = {
  data: CategoryRevenue[];
  meta: AnalyticsResponseMeta;
};

export type AnalyticsOverviewResponse = {
  data: AnalyticsOverview;
  meta: AnalyticsResponseMeta;
};

export type PopularCoursesResponse = {
  data: PopularCourse[];
  meta: AnalyticsPaginationMeta;
};

export type DropOffByCourseResponse = {
  data: DropOffCourse[];
  meta: AnalyticsPaginationMeta;
};

export type MonthlyRevenueResponse = {
  data: MonthlyRevenue[];
  meta: AnalyticsPaginationMeta;
};

export type AnalyticsControllerResponse<T, M> = {
  success: true;
  message: string;
  data: T;
  meta: M;
};

export type AnalyticsOverviewApiResponse = AnalyticsControllerResponse<
  AnalyticsOverviewResponse['data'],
  AnalyticsOverviewResponse['meta']
>;

export type RevenueByCategoryApiResponse = AnalyticsControllerResponse<
  RevenueByCategoryResponse['data'],
  RevenueByCategoryResponse['meta']
>;

export type PopularCoursesApiResponse = AnalyticsControllerResponse<
  PopularCoursesResponse['data'],
  PopularCoursesResponse['meta']
>;

export type DropOffByCourseApiResponse = AnalyticsControllerResponse<
  DropOffByCourseResponse['data'],
  DropOffByCourseResponse['meta']
>;

export type MonthlyRevenueApiResponse = AnalyticsControllerResponse<
  MonthlyRevenueResponse['data'],
  MonthlyRevenueResponse['meta']
>;
