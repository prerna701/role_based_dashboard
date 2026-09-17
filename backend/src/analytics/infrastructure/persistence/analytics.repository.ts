import {
  AnalyticsOverview,
  AnalyticsPagination,
  AnalyticsRegionScope,
  CategoryRevenue,
  DropOffCourse,
  MonthlyRevenue,
  PopularCourse,
} from '../../domain/analytics';

export abstract class AnalyticsRepository {
  abstract assertRegionExists(regionCode: string): Promise<boolean>;

  abstract getOverview(scope: AnalyticsRegionScope): Promise<AnalyticsOverview>;

  abstract getRevenueByCategory(
    scope: AnalyticsRegionScope,
  ): Promise<CategoryRevenue[]>;

  abstract getPopularCourses(
    scope: AnalyticsRegionScope,
    pagination: AnalyticsPagination,
  ): Promise<{ data: PopularCourse[]; total: number }>;

  abstract getDropOffByCourse(
    scope: AnalyticsRegionScope,
    pagination: AnalyticsPagination,
  ): Promise<{ data: DropOffCourse[]; total: number }>;

  abstract getMonthlyRevenue(
    scope: AnalyticsRegionScope,
    pagination: AnalyticsPagination,
  ): Promise<{ data: MonthlyRevenue[]; total: number }>;
}
