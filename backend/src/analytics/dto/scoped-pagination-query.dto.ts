import { IntersectionType } from '@nestjs/swagger';
import { PaginationQueryDto } from './pagination-query.dto';
import { RevenueByCategoryQueryDto } from './revenue-by-category-query.dto';

export class ScopedPaginationQueryDto extends IntersectionType(
  RevenueByCategoryQueryDto,
  PaginationQueryDto,
) {}
