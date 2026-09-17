process.env.DATABASE_TYPE = process.env.DATABASE_TYPE ?? 'postgres';
process.env.DATABASE_HOST = process.env.DATABASE_HOST ?? 'localhost';
process.env.DATABASE_PORT = process.env.DATABASE_PORT ?? '5436';
process.env.DATABASE_USERNAME = process.env.DATABASE_USERNAME ?? 'postgres';
process.env.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? 'postgres';
process.env.DATABASE_NAME = process.env.DATABASE_NAME ?? 'role_based_dashboard';

import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AnalyticsService } from './analytics.service';
import { RegionScopeService } from '../common/scope/region-scope.service';

describe('AnalyticsService', () => {
  const dataSource = {
    query: jest.fn(),
  };
  const regionScopeService = {
    resolveForUserId: jest.fn(),
  };

  let service: AnalyticsService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new AnalyticsService(
      dataSource as unknown as DataSource,
      regionScopeService as unknown as RegionScopeService,
    );
  });

  it('returns all-region revenue for admin when no region is requested', async () => {
    regionScopeService.resolveForUserId.mockResolvedValue({
      user: { id: 1 },
      regionCode: null,
    });
    dataSource.query.mockResolvedValueOnce([
      { category: 'Data', enrollments: 3, revenue: '39500.00', share: '76.7' },
      { category: 'Design', enrollments: 1, revenue: '12000.50', share: '23.3' },
    ]);

    const result = await service.getRevenueByCategory(1, {});

    expect(regionScopeService.resolveForUserId).toHaveBeenCalledWith(
      1,
      undefined,
    );
    expect(dataSource.query).toHaveBeenCalledWith(expect.any(String), [null]);
    expect(result).toEqual({
      data: [
        { category: 'Data', enrollments: 3, revenue: 39500, share: 76.7 },
        { category: 'Design', enrollments: 1, revenue: 12000.5, share: 23.3 },
      ],
      meta: { region: null },
    });
  });

  it('returns scoped revenue for an allowed region request', async () => {
    regionScopeService.resolveForUserId.mockResolvedValue({
      user: { id: 1 },
      regionCode: 'North',
    });
    dataSource.query
      .mockResolvedValueOnce([{ '?column?': 1 }])
      .mockResolvedValueOnce([
        {
          category: 'Programming',
          enrollments: 2,
          revenue: '9000.00',
          share: '100.0',
        },
      ]);

    const result = await service.getRevenueByCategory(1, { region: 'North' });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      `SELECT 1 FROM regions WHERE code = $1 LIMIT 1`,
      ['North'],
    );
    expect(dataSource.query).toHaveBeenNthCalledWith(2, expect.any(String), [
      'North',
    ]);
    expect(result.meta.region).toBe('North');
    expect(result.data).toEqual([
      {
        category: 'Programming',
        enrollments: 2,
        revenue: 9000,
        share: 100,
      },
    ]);
  });

  it('returns dashboard overview metrics scoped by region', async () => {
    regionScopeService.resolveForUserId.mockResolvedValue({
      user: { id: 1 },
      regionCode: 'North',
    });
    dataSource.query
      .mockResolvedValueOnce([{ '?column?': 1 }])
      .mockResolvedValueOnce([
        {
          totalStudents: 24,
          totalEnrollments: 57,
          averageRating: '3.91',
          netRevenue: '540000.00',
        },
      ])
      .mockResolvedValueOnce([
        {
          key: 'north',
          label: 'North',
          students: 24,
          enrollments: 57,
          revenue: '540000.00',
        },
      ])
      .mockResolvedValueOnce([
        { label: 'In Progress', value: 25, percent: '43.9' },
        { label: 'Completed', value: 24, percent: '42.1' },
      ]);

    const result = await service.getOverview(1, { region: 'North' });

    expect(dataSource.query).toHaveBeenNthCalledWith(
      1,
      `SELECT 1 FROM regions WHERE code = $1 LIMIT 1`,
      ['North'],
    );
    expect(result).toEqual({
      data: {
        summary: {
          totalStudents: 24,
          totalEnrollments: 57,
          averageRating: 3.91,
          netRevenue: 540000,
        },
        regions: [
          {
            key: 'north',
            label: 'North',
            students: 24,
            enrollments: 57,
            revenue: 540000,
          },
        ],
        completionStatus: [
          { label: 'In Progress', value: 25, percent: 43.9 },
          { label: 'Completed', value: 24, percent: 42.1 },
        ],
      },
      meta: { region: 'North' },
    });
  });

  it('rejects an unknown requested region', async () => {
    regionScopeService.resolveForUserId.mockResolvedValue({
      user: { id: 1 },
      regionCode: 'West',
    });
    dataSource.query.mockResolvedValueOnce([]);

    await expect(
      service.getRevenueByCategory(1, { region: 'West' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('does not query analytics data when manager requests another region', async () => {
    regionScopeService.resolveForUserId.mockRejectedValue(
      new ForbiddenException(
        'You are not allowed to access South region data.',
      ),
    );

    await expect(
      service.getRevenueByCategory(2, { region: 'South' }),
    ).rejects.toThrow(ForbiddenException);
    expect(dataSource.query).not.toHaveBeenCalled();
  });

  it('returns paginated drop-off insights scoped by region', async () => {
    regionScopeService.resolveForUserId.mockResolvedValue({
      user: { id: 2 },
      regionCode: 'South',
    });
    dataSource.query
      .mockResolvedValueOnce([{ '?column?': 1 }])
      .mockResolvedValueOnce([
        {
          courseId: 'C5',
          courseTitle: 'UI Design Basics',
          category: 'Design',
          enrollments: 7,
          droppedEnrollments: 3,
          dropOffRate: '0.4286',
          revenueAtRisk: '10300.00',
        },
      ])
      .mockResolvedValueOnce([{ total: 12 }]);

    const result = await service.getDropOffByCourse(2, {
      region: 'South',
      page: 2,
      limit: 5,
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(2, expect.any(String), [
      'South',
      5,
      5,
    ]);
    expect(result).toEqual({
      data: [
        {
          courseId: 'C5',
          courseTitle: 'UI Design Basics',
          category: 'Design',
          enrollments: 7,
          droppedEnrollments: 3,
          dropOffRate: 0.4286,
          revenueAtRisk: 10300,
        },
      ],
      meta: {
        region: 'South',
        page: 2,
        limit: 5,
        total: 12,
        totalPages: 3,
      },
    });
  });

  it('returns paginated popular courses scoped by region', async () => {
    regionScopeService.resolveForUserId.mockResolvedValue({
      user: { id: 2 },
      regionCode: 'South',
    });
    dataSource.query
      .mockResolvedValueOnce([{ '?column?': 1 }])
      .mockResolvedValueOnce([
        {
          courseId: 'CRS-DSGN-510',
          title: 'Design Systems',
          category: 'Design',
          enrollments: 9,
          averageRating: '4.50',
          totalFees: '135000.00',
          completionRate: '91.0',
        },
      ])
      .mockResolvedValueOnce([{ total: 6 }]);

    const result = await service.getPopularCourses(2, {
      region: 'South',
      page: 1,
      limit: 5,
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(2, expect.any(String), [
      'South',
      5,
      0,
    ]);
    expect(result).toEqual({
      data: [
        {
          courseId: 'CRS-DSGN-510',
          title: 'Design Systems',
          category: 'Design',
          enrollments: 9,
          averageRating: 4.5,
          totalFees: 135000,
          completionRate: 91,
        },
      ],
      meta: {
        region: 'South',
        page: 1,
        limit: 5,
        total: 6,
        totalPages: 2,
      },
    });
  });

  it('returns paginated monthly revenue scoped by region', async () => {
    regionScopeService.resolveForUserId.mockResolvedValue({
      user: { id: 1 },
      regionCode: null,
    });
    dataSource.query
      .mockResolvedValueOnce([
        { month: '2026-01', enrollments: 15, revenue: '88000.00' },
      ])
      .mockResolvedValueOnce([{ total: 6 }]);

    const result = await service.getMonthlyRevenue(1, {
      page: 1,
      limit: 10,
    });

    expect(dataSource.query).toHaveBeenNthCalledWith(1, expect.any(String), [
      null,
      10,
      0,
    ]);
    expect(result).toEqual({
      data: [{ month: '2026-01', enrollments: 15, revenue: 88000 }],
      meta: {
        region: null,
        page: 1,
        limit: 10,
        total: 6,
        totalPages: 1,
      },
    });
  });
});
