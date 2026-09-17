import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RoleEnum } from '../../roles/roles.enum';
import { User } from '../../users/domain/user';
import { UsersService } from '../../users/users.service';

export type ResolvedRegionScope = {
  user: User;
  regionCode: string | null;
};

@Injectable()
export class RegionScopeService {
  constructor(private readonly usersService: UsersService) {}

  async resolveForUserId(
    userId: User['id'],
    requestedRegion?: string | null,
  ): Promise<ResolvedRegionScope> {
    const user = await this.usersService.findById(userId);

    if (!user?.role?.id) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    return this.resolveForUser(user, requestedRegion);
  }

  resolveForUser(
    user: User,
    requestedRegion?: string | null,
  ): ResolvedRegionScope {
    const normalizedRequestedRegion = this.normalizeRegion(requestedRegion);

    if (String(user.role?.id) === String(RoleEnum.admin)) {
      return {
        user,
        regionCode: normalizedRequestedRegion,
      };
    }

    if (String(user.role?.id) !== String(RoleEnum.regionManager)) {
      throw new ForbiddenException(
        'Your role is not allowed to access dashboard data.',
      );
    }

    if (!user.regionCode) {
      throw new ForbiddenException(
        'Your manager account is missing a region assignment.',
      );
    }

    if (
      normalizedRequestedRegion &&
      normalizedRequestedRegion !== user.regionCode
    ) {
      throw new ForbiddenException(
        `You are not allowed to access ${normalizedRequestedRegion} region data. Your account is scoped to ${user.regionCode}.`,
      );
    }

    return {
      user,
      regionCode: user.regionCode,
    };
  }

  private normalizeRegion(region?: string | null): string | null {
    const trimmedRegion = region?.trim();

    return trimmedRegion ? trimmedRegion : null;
  }
}
