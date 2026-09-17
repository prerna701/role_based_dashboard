import {
  AnalyticsOverview,
  AnalyticsPagination,
  AnalyticsPaginatedResult,
  AnalyticsRegionScope,
  CategoryRevenue,
  DropOffCourse,
  MonthlyRevenue,
  PopularCourse,
  StudentDetails,
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
  ): Promise<AnalyticsPaginatedResult<PopularCourse>>;

  abstract getDropOffByCourse(
    scope: AnalyticsRegionScope,
    pagination: AnalyticsPagination,
  ): Promise<AnalyticsPaginatedResult<DropOffCourse>>;

  abstract getMonthlyRevenue(
    scope: AnalyticsRegionScope,
    pagination: AnalyticsPagination,
  ): Promise<AnalyticsPaginatedResult<MonthlyRevenue>>;

  abstract getStudents(
    scope: AnalyticsRegionScope,
    pagination: AnalyticsPagination,
    search?: string,
  ): Promise<AnalyticsPaginatedResult<StudentDetails>>;
}
