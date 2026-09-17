import { Module } from '@nestjs/common';
import { RegionScopeModule } from '../common/scope/region-scope.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [RegionScopeModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
