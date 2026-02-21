import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class IdPortfolioDto {
  @ApiProperty({ example: '4f715ca2-ce65-4836-b2e5-8e5d3e2a03b8' })
  @IsString()
  id: string;
}
