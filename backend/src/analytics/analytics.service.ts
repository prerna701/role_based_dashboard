import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegionScopeService } from '../common/scope/region-scope.service';
import { User } from '../users/domain/user';
import { RevenueByCategoryQueryDto } from './dto/revenue-by-category-query.dto';
import { ScopedPaginationQueryDto } from './dto/scoped-pagination-query.dto';

type RevenueByCategoryRow = {
  category: string;
  revenue: string | number | null;
};

type DropOffByCourseRow = {
  courseId: string;
  courseTitle: string;
  category: string;
  enrollments: string | number;
  droppedEnrollments: string | number;
  dropOffRate: string | number;
  revenueAtRisk: string | number | null;
};

type MonthlyRevenueRow = {
  month: string;
  enrollments: string | number;
  revenue: string | number | null;
};

type CountRow = {
  total: string | number;
};

type PaginationMeta = {
  region: string | null;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type RevenueByCategoryResponse = {
  data: {
    category: string;
    revenue: number;
  }[];
  meta: {
    region: string | null;
  };
};

export type DropOffByCourseResponse = {
  data: {
    courseId: string;
    courseTitle: string;
    category: string;
    enrollments: number;
    droppedEnrollments: number;
    dropOffRate: number;
    revenueAtRisk: number;
  }[];
  meta: PaginationMeta;
};

export type MonthlyRevenueResponse = {
  data: {
    month: string;
    enrollments: number;
    revenue: number;
  }[];
  meta: PaginationMeta;
};

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly regionScopeService: RegionScopeService,
  ) {}

  async getRevenueByCategory(
    userId: User['id'],
    query: RevenueByCategoryQueryDto,
  ): Promise<RevenueByCategoryResponse> {
    const scope = await this.regionScopeService.resolveForUserId(
      userId,
      query.region,
    );

    await this.assertRegionExists(scope.regionCode);

    const rows = (await this.dataSource.query(
      `
        SELECT cat.name AS category, COALESCE(r.revenue, 0) AS revenue
        FROM categories cat
        LEFT JOIN (
          SELECT c.category_id, SUM(e.fee_paid) AS revenue
          FROM enrollments e
          INNER JOIN students s ON s.id = e.student_id
          INNER JOIN courses c ON c.id = e.course_id
          WHERE ($1::text IS NULL OR s.region_code = $1::text)
          GROUP BY c.category_id
        ) r ON r.category_id = cat.id
        ORDER BY revenue DESC, cat.name ASC
      `,
      [scope.regionCode],
    )) as RevenueByCategoryRow[];

    return {
      data: rows.map((row) => ({
        category: row.category,
        revenue: Number(row.revenue ?? 0),
      })),
      meta: {
        region: scope.regionCode,
      },
    };
  }

  async getDropOffByCourse(
    userId: User['id'],
    query: ScopedPaginationQueryDto,
  ): Promise<DropOffByCourseResponse> {
    const scope = await this.resolveScope(userId, query.region);
    const { limit, offset, page } = this.getPagination(query);

    const rows = (await this.dataSource.query(
      `
        SELECT
          course_external_id AS "courseId",
          course_title AS "courseTitle",
          category_name AS category,
          COUNT(*)::int AS enrollments,
          COUNT(*) FILTER (WHERE completion_status = 'dropped')::int AS "droppedEnrollments",
          ROUND(
            (
              COUNT(*) FILTER (WHERE completion_status = 'dropped')::numeric
              / NULLIF(COUNT(*), 0)
            ),
            4
          ) AS "dropOffRate",
          COALESCE(
            SUM(fee_paid) FILTER (WHERE completion_status = 'dropped'),
            0
          ) AS "revenueAtRisk"
        FROM enrollment_facts
        WHERE ($1::text IS NULL OR region_code = $1::text)
        GROUP BY course_external_id, course_title, category_name
        ORDER BY "dropOffRate" DESC, "revenueAtRisk" DESC, course_title ASC
        LIMIT $2 OFFSET $3
      `,
      [scope.regionCode, limit, offset],
    )) as DropOffByCourseRow[];

    const total = await this.getGroupedCount(
      `
        SELECT course_id
        FROM enrollment_facts
        WHERE ($1::text IS NULL OR region_code = $1::text)
        GROUP BY course_id
      `,
      [scope.regionCode],
    );

    return {
      data: rows.map((row) => ({
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        category: row.category,
        enrollments: Number(row.enrollments),
        droppedEnrollments: Number(row.droppedEnrollments),
        dropOffRate: Number(row.dropOffRate),
        revenueAtRisk: Number(row.revenueAtRisk ?? 0),
      })),
      meta: this.buildPaginationMeta(scope.regionCode, page, limit, total),
    };
  }

  async getMonthlyRevenue(
    userId: User['id'],
    query: ScopedPaginationQueryDto,
  ): Promise<MonthlyRevenueResponse> {
    const scope = await this.resolveScope(userId, query.region);
    const { limit, offset, page } = this.getPagination(query);

    const rows = (await this.dataSource.query(
      `
        SELECT
          TO_CHAR(DATE_TRUNC('month', enrolled_on), 'YYYY-MM') AS month,
          COUNT(*)::int AS enrollments,
          COALESCE(SUM(fee_paid), 0) AS revenue
        FROM enrollment_facts
        WHERE ($1::text IS NULL OR region_code = $1::text)
        GROUP BY DATE_TRUNC('month', enrolled_on)
        ORDER BY month ASC
        LIMIT $2 OFFSET $3
      `,
      [scope.regionCode, limit, offset],
    )) as MonthlyRevenueRow[];

    const total = await this.getGroupedCount(
      `
        SELECT DATE_TRUNC('month', enrolled_on)
        FROM enrollment_facts
        WHERE ($1::text IS NULL OR region_code = $1::text)
        GROUP BY DATE_TRUNC('month', enrolled_on)
      `,
      [scope.regionCode],
    );

    return {
      data: rows.map((row) => ({
        month: row.month,
        enrollments: Number(row.enrollments),
        revenue: Number(row.revenue ?? 0),
      })),
      meta: this.buildPaginationMeta(scope.regionCode, page, limit, total),
    };
  }

  private async assertRegionExists(regionCode: string | null): Promise<void> {
    if (!regionCode) {
      return;
    }

    const rows = (await this.dataSource.query(
      `SELECT 1 FROM regions WHERE code = $1 LIMIT 1`,
      [regionCode],
    )) as unknown[];

    if (rows.length === 0) {
      throw new BadRequestException(`Region '${regionCode}' does not exist.`);
    }
  }

  private async resolveScope(
    userId: User['id'],
    requestedRegion?: string,
  ): Promise<{ regionCode: string | null }> {
    const scope = await this.regionScopeService.resolveForUserId(
      userId,
      requestedRegion,
    );

    await this.assertRegionExists(scope.regionCode);

    return scope;
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

  private async getGroupedCount(
    groupedQuery: string,
    parameters: unknown[],
  ): Promise<number> {
    const [countRow] = (await this.dataSource.query(
      `SELECT COUNT(*)::int AS total FROM (${groupedQuery}) grouped_rows`,
      parameters,
    )) as CountRow[];

    return Number(countRow?.total ?? 0);
  }

  private buildPaginationMeta(
    region: string | null,
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    return {
      region,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
