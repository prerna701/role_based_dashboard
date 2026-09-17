import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class RevenueByCategoryQueryDto {
  @ApiPropertyOptional({
    example: 'North',
    description: 'Optional region filter. Admins may request any region.',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[A-Za-z][A-Za-z ]*$/, {
    message: 'region must contain only letters and spaces',
  })
  region?: string;
}
