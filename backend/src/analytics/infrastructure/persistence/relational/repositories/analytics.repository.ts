import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  CompletionStatus,
  EnrollmentEntity,
} from '../../../../../learning/entities/enrollment.entity';
import { CategoryEntity } from '../../../../../learning/entities/category.entity';
import { RegionEntity } from '../../../../../learning/entities/region.entity';
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
} from '../../../../domain/analytics';
import { StudentEntity } from '../../../../../learning/entities/student.entity';
import { AnalyticsRepository } from '../../analytics.repository';

type SummaryRow = {
  totalStudents: string | number | null;
  totalEnrollments: string | number | null;
  averageRating: string | number | null;
  netRevenue: string | number | null;
};

type RegionRow = {
  key: string;
  label: string;
  students: string | number;
  enrollments: string | number;
  revenue: string | number | null;
};

type CompletionRow = {
  status: CompletionStatus;
  value: string | number;
};

type CategoryRevenueRow = {
  category: string;
  enrollments: string | number;
  revenue: string | number | null;
};

type PopularCourseRow = {
  courseId: string;
  title: string;
  category: string;
  enrollments: string | number;
  averageRating: string | number | null;
  totalFees: string | number | null;
  completedEnrollments: string | number;
};

type DropOffCourseRow = {
  courseId: string;
  courseTitle: string;
  category: string;
  enrollments: string | number;
  droppedEnrollments: string | number;
  revenueAtRisk: string | number | null;
};

type MonthlyRevenueRow = {
  month: string;
  enrollments: string | number;
  revenue: string | number | null;
};

type StudentRow = {
  studentId: string;
  studentExternalId: string;
  studentName: string;
  joinedOn: string;
  courseId: string;
  courseTitle: string;
  category: string;
  level: string;
  instructor: string;
  durationWeeks: string | number;
  enrolledOn: string;
  completionStatus: CompletionStatus;
  grade: string | null;
  rating: string | number;
  feePaid: string | number;
};

@Injectable()
export class AnalyticsRelationalRepository implements AnalyticsRepository {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    @InjectRepository(EnrollmentEntity)
    private readonly enrollmentRepository: Repository<EnrollmentEntity>,
    @InjectRepository(RegionEntity)
    private readonly regionRepository: Repository<RegionEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
  ) {}

  async assertRegionExists(regionCode: string): Promise<boolean> {
    return this.regionRepository.exists({
      where: {
        code: regionCode,
      },
    });
  }

  async getOverview(scope: AnalyticsRegionScope): Promise<AnalyticsOverview> {
    const [summary, regions, completionStatus] = await Promise.all([
      this.getSummary(scope),
      this.getRegionSummaries(scope),
      this.getCompletionStatus(scope),
    ]);

    return {
      summary,
      regions,
      completionStatus,
    };
  }

  async getRevenueByCategory(
    scope: AnalyticsRegionScope,
  ): Promise<CategoryRevenue[]> {
    const [categories, revenueRows] = await Promise.all([
      this.categoryRepository.find({
        select: {
          id: true,
          name: true,
        },
        order: {
          name: 'ASC',
        },
      }),
      this.scopeEnrollments(scope)
        .select('category.id', 'categoryId')
        .addSelect('category.name', 'category')
        .addSelect('COUNT(enrollment.id)', 'enrollments')
        .addSelect('COALESCE(SUM(enrollment.feePaid), 0)', 'revenue')
        .groupBy('category.id')
        .addGroupBy('category.name')
        .getRawMany<CategoryRevenueRow & { categoryId: string }>(),
    ]);

    const rowsByCategoryId = new Map(
      revenueRows.map((row) => [String(row.categoryId), row]),
    );

    const rows = categories.map((category) => {
      const row = rowsByCategoryId.get(String(category.id));
      return {
        category: category.name,
        enrollments: this.toNumber(row?.enrollments),
        revenue: this.toNumber(row?.revenue),
        share: 0,
      };
    });
    const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);

    return rows
      .map((row) => ({
        ...row,
        share: totalRevenue > 0 ? this.round((row.revenue / totalRevenue) * 100, 1) : 0,
      }))
      .sort((left, right) => right.revenue - left.revenue || left.category.localeCompare(right.category));
  }

  async getPopularCourses(
    scope: AnalyticsRegionScope,
    pagination: AnalyticsPagination,
  ): Promise<AnalyticsPaginatedResult<PopularCourse>> {
    const [rows, total] = await Promise.all([
      this.courseAggregate(scope)
        .addSelect('AVG(enrollment.rating)', 'averageRating')
        .addSelect('COALESCE(SUM(enrollment.feePaid), 0)', 'totalFees')
        .addSelect(
          this.countWhen('enrollment.completionStatus = :completedStatus'),
          'completedEnrollments',
        )
        .setParameter('completedStatus', CompletionStatus.Completed)
        .orderBy('COUNT(enrollment.id)', 'DESC')
        .addOrderBy('AVG(enrollment.rating)', 'DESC')
        .addOrderBy('course.title', 'ASC')
        .limit(pagination.limit)
        .offset(pagination.offset)
        .getRawMany<PopularCourseRow>(),
      this.countCourseGroups(scope),
    ]);

    return {
      data: rows.map((row) => {
        const enrollments = this.toNumber(row.enrollments);
        const completedEnrollments = this.toNumber(row.completedEnrollments);

        return {
          courseId: row.courseId,
          title: row.title,
          category: row.category,
          enrollments,
          averageRating: this.round(this.toNumber(row.averageRating), 2),
          totalFees: this.toNumber(row.totalFees),
          completionRate:
            enrollments > 0
              ? this.round((completedEnrollments / enrollments) * 100, 1)
              : 0,
        };
      }),
      total,
    };
  }

  async getDropOffByCourse(
    scope: AnalyticsRegionScope,
    pagination: AnalyticsPagination,
  ): Promise<AnalyticsPaginatedResult<DropOffCourse>> {
    const [rows, total] = await Promise.all([
      this.courseAggregate(scope)
        .addSelect(
          this.countWhen('enrollment.completionStatus = :droppedStatus'),
          'droppedEnrollments',
        )
        .addSelect(
          this.sumWhen('enrollment.completionStatus = :droppedStatus', 'enrollment.feePaid'),
          'revenueAtRisk',
        )
        .setParameter('droppedStatus', CompletionStatus.Dropped)
        .orderBy(
          this.countWhen('enrollment.completionStatus = :droppedStatus'),
          'DESC',
        )
        .addOrderBy(
          this.sumWhen('enrollment.completionStatus = :droppedStatus', 'enrollment.feePaid'),
          'DESC',
        )
        .addOrderBy('course.title', 'ASC')
        .limit(pagination.limit)
        .offset(pagination.offset)
        .getRawMany<DropOffCourseRow>(),
      this.countCourseGroups(scope),
    ]);

    return {
      data: rows.map((row) => {
        const enrollments = this.toNumber(row.enrollments);
        const droppedEnrollments = this.toNumber(row.droppedEnrollments);

        return {
          courseId: row.courseId,
          courseTitle: row.courseTitle,
          category: row.category,
          enrollments,
          droppedEnrollments,
          dropOffRate:
            enrollments > 0
              ? this.round(droppedEnrollments / enrollments, 4)
              : 0,
          revenueAtRisk: this.toNumber(row.revenueAtRisk),
        };
      }),
      total,
    };
  }

  async getMonthlyRevenue(
    scope: AnalyticsRegionScope,
    pagination: AnalyticsPagination,
  ): Promise<AnalyticsPaginatedResult<MonthlyRevenue>> {
    const monthExpression = "TO_CHAR(DATE_TRUNC('month', enrollment.enrolledOn), 'YYYY-MM')";

    const [rows, total] = await Promise.all([
      this.scopeEnrollments(scope)
        .select(monthExpression, 'month')
        .addSelect('COUNT(enrollment.id)', 'enrollments')
        .addSelect('COALESCE(SUM(enrollment.feePaid), 0)', 'revenue')
        .groupBy(monthExpression)
        .orderBy('month', 'ASC')
        .limit(pagination.limit)
        .offset(pagination.offset)
        .getRawMany<MonthlyRevenueRow>(),
      this.countMonthlyGroups(scope),
    ]);

    return {
      data: rows.map((row) => ({
        month: row.month,
        enrollments: this.toNumber(row.enrollments),
        revenue: this.toNumber(row.revenue),
      })),
      total,
    };
  }

  async getStudents(
    scope: AnalyticsRegionScope,
    pagination: AnalyticsPagination,
    search?: string,
  ): Promise<AnalyticsPaginatedResult<StudentDetails>> {
    const studentQuery = this.scopedStudents(scope, search);
    const total = await studentQuery.getCount();
    const studentIds = await studentQuery
      .select('student.id', 'studentId')
      .orderBy('student.name', 'ASC')
      .addOrderBy('student.id', 'ASC')
      .skip(pagination.offset)
      .take(pagination.limit)
      .getRawMany<{ studentId: string }>();

    if (studentIds.length === 0) {
      return { data: [], total };
    }

    const rows = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.student', 'student')
      .innerJoin('student.region', 'region')
      .innerJoin('enrollment.course', 'course')
      .innerJoin('course.category', 'category')
      .innerJoin('course.instructor', 'instructor')
      .select('student.id', 'studentId')
      .addSelect('student.externalId', 'studentExternalId')
      .addSelect('student.name', 'studentName')
      .addSelect('student.joinedOn', 'joinedOn')
      .addSelect('course.externalId', 'courseId')
      .addSelect('course.title', 'courseTitle')
      .addSelect('category.name', 'category')
      .addSelect('course.level', 'level')
      .addSelect('instructor.name', 'instructor')
      .addSelect('course.durationWeeks', 'durationWeeks')
      .addSelect('enrollment.enrolledOn', 'enrolledOn')
      .addSelect('enrollment.completionStatus', 'completionStatus')
      .addSelect('enrollment.grade', 'grade')
      .addSelect('enrollment.rating', 'rating')
      .addSelect('enrollment.feePaid', 'feePaid')
      .where('student.id IN (:...studentIds)', {
        studentIds: studentIds.map((row) => row.studentId),
      })
      .orderBy('student.name', 'ASC')
      .addOrderBy('enrollment.enrolledOn', 'DESC')
      .getRawMany<StudentRow>();

    const students = new Map<string, StudentDetails>();

    for (const row of rows) {
      const student = students.get(row.studentId) ?? {
        studentId: row.studentExternalId,
        name: row.studentName,
        joinedOn: row.joinedOn,
        courses: [],
        completion: { completed: 0, inProgress: 0, dropped: 0 },
      };

      student.courses.push({
        courseId: row.courseId,
        title: row.courseTitle,
        category: row.category,
        level: row.level,
        instructor: row.instructor,
        durationWeeks: Number(row.durationWeeks),
        enrolledOn: row.enrolledOn,
        completionStatus: row.completionStatus,
        grade: row.grade,
        rating: Number(row.rating),
        feePaid: Number(row.feePaid),
      });

      if (row.completionStatus === CompletionStatus.Completed) {
        student.completion.completed += 1;
      } else if (row.completionStatus === CompletionStatus.InProgress) {
        student.completion.inProgress += 1;
      } else {
        student.completion.dropped += 1;
      }

      students.set(row.studentId, student);
    }

    return {
      data: studentIds
        .map((row) => students.get(row.studentId))
        .filter((student): student is StudentDetails => Boolean(student)),
      total,
    };
  }

  private async getSummary(
    scope: AnalyticsRegionScope,
  ): Promise<AnalyticsOverview['summary']> {
    const row = await this.scopeEnrollments(scope)
      .select('COUNT(DISTINCT student.id)', 'totalStudents')
      .addSelect('COUNT(enrollment.id)', 'totalEnrollments')
      .addSelect('AVG(enrollment.rating)', 'averageRating')
      .addSelect('COALESCE(SUM(enrollment.feePaid), 0)', 'netRevenue')
      .getRawOne<SummaryRow>();

    return {
      totalStudents: this.toNumber(row?.totalStudents),
      totalEnrollments: this.toNumber(row?.totalEnrollments),
      averageRating: this.round(this.toNumber(row?.averageRating), 2),
      netRevenue: this.toNumber(row?.netRevenue),
    };
  }

  private scopedStudents(
    scope: AnalyticsRegionScope,
    search?: string,
  ): SelectQueryBuilder<StudentEntity> {
    const queryBuilder = this.studentRepository
      .createQueryBuilder('student')
      .innerJoin('student.region', 'region');

    if (scope.regionCode) {
      queryBuilder.andWhere('student.regionCode = :regionCode', {
        regionCode: scope.regionCode,
      });
    }

    if (search?.trim()) {
      queryBuilder.andWhere(
        '(LOWER(student.name) LIKE LOWER(:search) OR LOWER(student.externalId) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` },
      );
    }

    return queryBuilder;
  }

  private async getRegionSummaries(
    scope: AnalyticsRegionScope,
  ): Promise<AnalyticsOverview['regions']> {
    const rows = await this.scopeEnrollments(scope)
      .select('LOWER(region.code)', 'key')
      .addSelect('region.name', 'label')
      .addSelect('COUNT(DISTINCT student.id)', 'students')
      .addSelect('COUNT(enrollment.id)', 'enrollments')
      .addSelect('COALESCE(SUM(enrollment.feePaid), 0)', 'revenue')
      .groupBy('region.code')
      .addGroupBy('region.name')
      .orderBy('COALESCE(SUM(enrollment.feePaid), 0)', 'DESC')
      .addOrderBy('region.name', 'ASC')
      .getRawMany<RegionRow>();

    return rows.map((row) => ({
      key: row.key,
      label: row.label,
      students: this.toNumber(row.students),
      enrollments: this.toNumber(row.enrollments),
      revenue: this.toNumber(row.revenue),
    }));
  }

  private async getCompletionStatus(
    scope: AnalyticsRegionScope,
  ): Promise<AnalyticsOverview['completionStatus']> {
    const rows = await this.scopeEnrollments(scope)
      .select('enrollment.completionStatus', 'status')
      .addSelect('COUNT(enrollment.id)', 'value')
      .groupBy('enrollment.completionStatus')
      .orderBy('COUNT(enrollment.id)', 'DESC')
      .getRawMany<CompletionRow>();

    const total = rows.reduce((sum, row) => sum + this.toNumber(row.value), 0);

    return rows.map((row) => {
      const value = this.toNumber(row.value);

      return {
        label: this.formatStatus(row.status),
        value,
        percent: total > 0 ? this.round((value / total) * 100, 1) : 0,
      };
    });
  }

  private scopeEnrollments(
    scope: AnalyticsRegionScope,
  ): SelectQueryBuilder<EnrollmentEntity> {
    const queryBuilder = this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .innerJoin('enrollment.student', 'student')
      .innerJoin('student.region', 'region')
      .innerJoin('enrollment.course', 'course')
      .innerJoin('course.category', 'category');

    if (scope.regionCode) {
      queryBuilder.andWhere('student.regionCode = :regionCode', {
        regionCode: scope.regionCode,
      });
    }

    return queryBuilder;
  }

  private courseAggregate(
    scope: AnalyticsRegionScope,
  ): SelectQueryBuilder<EnrollmentEntity> {
    return this.scopeEnrollments(scope)
      .select('course.externalId', 'courseId')
      .addSelect('course.title', 'title')
      .addSelect('course.title', 'courseTitle')
      .addSelect('category.name', 'category')
      .addSelect('COUNT(enrollment.id)', 'enrollments')
      .groupBy('course.id')
      .addGroupBy('course.externalId')
      .addGroupBy('course.title')
      .addGroupBy('category.name');
  }

  private async countCourseGroups(scope: AnalyticsRegionScope): Promise<number> {
    const rows = await this.scopeEnrollments(scope)
      .select('course.id', 'courseId')
      .groupBy('course.id')
      .getRawMany<{ courseId: string }>();

    return rows.length;
  }

  private async countMonthlyGroups(scope: AnalyticsRegionScope): Promise<number> {
    const monthExpression = "DATE_TRUNC('month', enrollment.enrolledOn)";

    const rows = await this.scopeEnrollments(scope)
      .select(monthExpression, 'month')
      .groupBy(monthExpression)
      .getRawMany<{ month: string }>();

    return rows.length;
  }

  private countWhen(condition: string): string {
    return `SUM(CASE WHEN ${condition} THEN 1 ELSE 0 END)`;
  }

  private sumWhen(condition: string, column: string): string {
    return `COALESCE(SUM(CASE WHEN ${condition} THEN ${column} ELSE 0 END), 0)`;
  }

  private toNumber(value: string | number | null | undefined): number {
    return Number(value ?? 0);
  }

  private round(value: number, precision: number): number {
    const multiplier = 10 ** precision;

    return Math.round(value * multiplier) / multiplier;
  }

  private formatStatus(status: CompletionStatus): string {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
