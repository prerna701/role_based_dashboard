import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryEntity } from '../../../../learning/entities/category.entity';
import { CourseEntity } from '../../../../learning/entities/course.entity';
import { EnrollmentEntity } from '../../../../learning/entities/enrollment.entity';
import { RegionEntity } from '../../../../learning/entities/region.entity';
import { StudentEntity } from '../../../../learning/entities/student.entity';
import { AnalyticsRepository } from '../analytics.repository';
import { AnalyticsRelationalRepository } from './repositories/analytics.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoryEntity,
      CourseEntity,
      EnrollmentEntity,
      RegionEntity,
      StudentEntity,
    ]),
  ],
  providers: [
    {
      provide: AnalyticsRepository,
      useClass: AnalyticsRelationalRepository,
    },
  ],
  exports: [AnalyticsRepository],
})
export class RelationalAnalyticsPersistenceModule {}
