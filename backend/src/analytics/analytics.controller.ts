import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { RequestWithUser } from '../utils/types/request-with-user.type';
import {
  AnalyticsOverviewApiResponse,
  DropOffByCourseApiResponse,
  MonthlyRevenueApiResponse,
  PopularCoursesApiResponse,
  RevenueByCategoryApiResponse,
} from './dto/analytics-response.dto';
import { AnalyticsService } from './analytics.service';
import { RevenueByCategoryQueryDto } from './dto/revenue-by-category-query.dto';
import { ScopedPaginationQueryDto } from './dto/scoped-pagination-query.dto';

@ApiTags('Analytics')
@Controller({
  path: 'analytics',
  version: '1',
})
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Dashboard KPI, completion, and region overview metrics.',
  })
  @Get('overview')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getOverview(
    @Request() request: RequestWithUser<JwtPayloadType>,
    @Query() query: RevenueByCategoryQueryDto,
  ): Promise<AnalyticsOverviewApiResponse> {
    const result = await this.analyticsService.getOverview(request.user.id, query);

    return {
      success: true,
      message: 'Analytics overview fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Total revenue grouped by course category.',
  })
  @Get('revenue-by-category')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getRevenueByCategory(
    @Request() request: RequestWithUser<JwtPayloadType>,
    @Query() query: RevenueByCategoryQueryDto,
  ): Promise<RevenueByCategoryApiResponse> {
    const result = await this.analyticsService.getRevenueByCategory(request.user.id, query);

    return {
      success: true,
      message: 'Revenue by category fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Most popular courses ranked by enrollment count.',
  })
  @Get('popular-courses')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getPopularCourses(
    @Request() request: RequestWithUser<JwtPayloadType>,
    @Query() query: ScopedPaginationQueryDto,
  ): Promise<PopularCoursesApiResponse> {
    const result = await this.analyticsService.getPopularCourses(request.user.id, query);

    return {
      success: true,
      message: 'Popular courses fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Drop-off rate by course with dropped enrollment revenue.',
  })
  @Get('drop-off-by-course')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getDropOffByCourse(
    @Request() request: RequestWithUser<JwtPayloadType>,
    @Query() query: ScopedPaginationQueryDto,
  ): Promise<DropOffByCourseApiResponse> {
    const result = await this.analyticsService.getDropOffByCourse(request.user.id, query);

    return {
      success: true,
      message: 'Course drop-off data fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Monthly enrollment count and revenue trend.',
  })
  @Get('monthly-revenue')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async getMonthlyRevenue(
    @Request() request: RequestWithUser<JwtPayloadType>,
    @Query() query: ScopedPaginationQueryDto,
  ): Promise<MonthlyRevenueApiResponse> {
    const result = await this.analyticsService.getMonthlyRevenue(request.user.id, query);

    return {
      success: true,
      message: 'Monthly revenue fetched successfully',
      data: result.data,
      meta: result.meta,
    };
  }
}
