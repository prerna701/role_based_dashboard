import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class StatusDto {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
