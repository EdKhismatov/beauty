import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdDto {
  @ApiProperty({ description: 'Id активного города' })
  @IsString()
  id: string;
}
