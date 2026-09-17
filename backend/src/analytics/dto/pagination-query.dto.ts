import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    default: 1,
  })
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? 1 : Number(value),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    maximum: 50,
  })
  @Transform(({ value }: { value: unknown }) =>
    value === undefined ? 10 : Number(value),
  )
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
