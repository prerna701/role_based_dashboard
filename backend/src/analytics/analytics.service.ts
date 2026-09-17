import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RegionScopeService } from '../common/scope/region-scope.service';
import { User } from '../users/domain/user';
import { RevenueByCategoryQueryDto } from './dto/revenue-by-category-query.dto';

type RevenueByCategoryRow = {
  category: string;
  revenue: string | number | null;
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
}
