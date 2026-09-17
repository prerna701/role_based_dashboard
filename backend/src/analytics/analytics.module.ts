import { Module } from '@nestjs/common';
import { RegionScopeModule } from '../common/scope/region-scope.module';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [RegionScopeModule],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
