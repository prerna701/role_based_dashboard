import { BadRequestException, Injectable } from '@nestjs/common';
import { RegionScopeService } from '../common/scope/region-scope.service';
import { User } from '../users/domain/user';
import {
  AnalyticsPaginationMeta,
  CategoryRevenue,
  DropOffCourse,
  MonthlyRevenue,
  PopularCourse,
} from './domain/analytics';
import { RevenueByCategoryQueryDto } from './dto/revenue-by-category-query.dto';
import { ScopedPaginationQueryDto } from './dto/scoped-pagination-query.dto';
import { AnalyticsRepository } from './infrastructure/persistence/analytics.repository';

export type RevenueByCategoryResponse = {
  data: CategoryRevenue[];
  meta: {
    region: string | null;
  };
};

export type AnalyticsOverviewResponse = {
  data: Awaited<ReturnType<AnalyticsRepository['getOverview']>>;
  meta: {
    region: string | null;
  };
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

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly analyticsRepository: AnalyticsRepository,
    private readonly regionScopeService: RegionScopeService,
  ) {}

  async getOverview(
    userId: User['id'],
    query: RevenueByCategoryQueryDto,
  ): Promise<AnalyticsOverviewResponse> {
    const scope = await this.resolveScope(userId, query.region);

    return {
      data: await this.analyticsRepository.getOverview(scope),
      meta: {
        region: scope.regionCode,
      },
    };
  }

  async getRevenueByCategory(
    userId: User['id'],
    query: RevenueByCategoryQueryDto,
  ): Promise<RevenueByCategoryResponse> {
    const scope = await this.resolveScope(userId, query.region);

    return {
      data: await this.analyticsRepository.getRevenueByCategory(scope),
      meta: {
        region: scope.regionCode,
      },
    };
  }

  async getPopularCourses(
    userId: User['id'],
    query: ScopedPaginationQueryDto,
  ): Promise<PopularCoursesResponse> {
    const scope = await this.resolveScope(userId, query.region);
    const pagination = this.getPagination(query);
    const result = await this.analyticsRepository.getPopularCourses(
      scope,
      pagination,
    );

    return {
      data: result.data,
      meta: this.buildPaginationMeta(
        scope.regionCode,
        pagination.page,
        pagination.limit,
        result.total,
      ),
    };
  }

  async getDropOffByCourse(
    userId: User['id'],
    query: ScopedPaginationQueryDto,
  ): Promise<DropOffByCourseResponse> {
    const scope = await this.resolveScope(userId, query.region);
    const pagination = this.getPagination(query);
    const result = await this.analyticsRepository.getDropOffByCourse(
      scope,
      pagination,
    );

    return {
      data: result.data,
      meta: this.buildPaginationMeta(
        scope.regionCode,
        pagination.page,
        pagination.limit,
        result.total,
      ),
    };
  }

  async getMonthlyRevenue(
    userId: User['id'],
    query: ScopedPaginationQueryDto,
  ): Promise<MonthlyRevenueResponse> {
    const scope = await this.resolveScope(userId, query.region);
    const pagination = this.getPagination(query);
    const result = await this.analyticsRepository.getMonthlyRevenue(
      scope,
      pagination,
    );

    return {
      data: result.data,
      meta: this.buildPaginationMeta(
        scope.regionCode,
        pagination.page,
        pagination.limit,
        result.total,
      ),
    };
  }

  private async resolveScope(
    userId: User['id'],
    requestedRegion?: string,
  ): Promise<{ regionCode: string | null }> {
    const scope = await this.regionScopeService.resolveForUserId(
      userId,
      requestedRegion,
    );

    if (scope.regionCode) {
      const exists = await this.analyticsRepository.assertRegionExists(
        scope.regionCode,
      );

      if (!exists) {
        throw new BadRequestException(
          `Region '${scope.regionCode}' does not exist.`,
        );
      }
    }

    return {
      regionCode: scope.regionCode,
    };
  }

  private getPagination(query: ScopedPaginationQueryDto): {
    limit: number;
    offset: number;
    page: number;
  } {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return {
      page,
      limit,
      offset: (page - 1) * limit,
    };
  }

  private buildPaginationMeta(
    region: string | null,
    page: number,
    limit: number,
    total: number,
  ): AnalyticsPaginationMeta {
    return {
      region,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
