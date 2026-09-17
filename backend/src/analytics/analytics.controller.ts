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
  AnalyticsService,
  RevenueByCategoryResponse,
} from './analytics.service';
import { RevenueByCategoryQueryDto } from './dto/revenue-by-category-query.dto';

@ApiTags('Analytics')
@Controller({
  path: 'analytics',
  version: '1',
})
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Total revenue grouped by course category.',
  })
  @Get('revenue-by-category')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  getRevenueByCategory(
    @Request() request: RequestWithUser<JwtPayloadType>,
    @Query() query: RevenueByCategoryQueryDto,
  ): Promise<RevenueByCategoryResponse> {
    return this.analyticsService.getRevenueByCategory(request.user.id, query);
  }
}
