process.env.DATABASE_TYPE = process.env.DATABASE_TYPE ?? 'postgres';
process.env.DATABASE_HOST = process.env.DATABASE_HOST ?? 'localhost';
process.env.DATABASE_PORT = process.env.DATABASE_PORT ?? '5436';
process.env.DATABASE_USERNAME = process.env.DATABASE_USERNAME ?? 'postgres';
process.env.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD ?? 'postgres';
process.env.DATABASE_NAME = process.env.DATABASE_NAME ?? 'role_based_dashboard';

import { ForbiddenException } from '@nestjs/common';
import { RegionScopeService } from './region-scope.service';
import { RoleEnum } from '../../roles/roles.enum';
import { User } from '../../users/domain/user';

const usersService = {
  findById: jest.fn(),
};

function makeUser(roleId: RoleEnum, regionCode?: string | null): User {
  const user = new User();
  user.id = 1;
  user.email = 'test@example.com';
  user.provider = 'email';
  user.firstName = 'Test';
  user.lastName = 'User';
  user.role = { id: roleId };
  user.regionCode = regionCode;

  return user;
}

describe('RegionScopeService', () => {
  let service: RegionScopeService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new RegionScopeService(usersService as never);
  });

  it('allows admin to access all regions when no region is requested', () => {
    const result = service.resolveForUser(makeUser(RoleEnum.admin), null);

    expect(result.regionCode).toBeNull();
  });

  it('allows admin to request a specific region', () => {
    const result = service.resolveForUser(makeUser(RoleEnum.admin), 'South');

    expect(result.regionCode).toBe('South');
  });

  it('forces a manager to their own region when no region is requested', () => {
    const result = service.resolveForUser(
      makeUser(RoleEnum.regionManager, 'North'),
      null,
    );

    expect(result.regionCode).toBe('North');
  });

  it('blocks a North manager from requesting South data', () => {
    expect(() =>
      service.resolveForUser(
        makeUser(RoleEnum.regionManager, 'North'),
        'South',
      ),
    ).toThrow(ForbiddenException);
  });

  it('blocks a North manager from requesting East data', () => {
    expect(() =>
      service.resolveForUser(makeUser(RoleEnum.regionManager, 'North'), 'East'),
    ).toThrow(
      'You are not allowed to access East region data. Your account is scoped to North.',
    );
  });

  it('blocks a South manager from requesting North data', () => {
    expect(() =>
      service.resolveForUser(
        makeUser(RoleEnum.regionManager, 'South'),
        'North',
      ),
    ).toThrow(
      'You are not allowed to access North region data. Your account is scoped to South.',
    );
  });
});
