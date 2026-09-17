import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FileDto {
  @ApiProperty({
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    type: String,
    example: '/uploads/example.png',
  })
  @IsString()
  @IsNotEmpty()
  path: string;
}
