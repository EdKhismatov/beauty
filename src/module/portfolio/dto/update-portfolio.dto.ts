import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdatePortfolioDto {
  @ApiPropertyOptional({ example: 'Наращивание ресниц' })
  @IsOptional()
  @IsString()
  description?: string;
}
