import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ScopedPaginationQueryDto } from './scoped-pagination-query.dto';

export class StudentsQueryDto extends ScopedPaginationQueryDto {
  @ApiPropertyOptional({ example: 'Aisha' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;
}
