import { Module } from '@nestjs/common';
import { RegionScopeModule } from '../common/scope/region-scope.module';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { RelationalAnalyticsPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RegionScopeModule, RelationalAnalyticsPersistenceModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
