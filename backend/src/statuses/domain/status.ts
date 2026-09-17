import { ApiProperty } from '@nestjs/swagger';

export class Status {
  @ApiProperty({
    type: Number,
    example: 1,
  })
  id: number;

  @ApiProperty({
    type: String,
    example: 'Active',
  })
  name?: string;
}
