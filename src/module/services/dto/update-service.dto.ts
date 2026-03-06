import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class UpdateServiceDto {
  @ApiProperty({ description: 'ID категории', required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ description: 'Название услуги', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Описание услуги', required: false })
  @IsOptional()
  @IsString()
  @Length(6, 512)
  description?: string;

  @ApiProperty({ description: 'Цена от', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceFrom?: number;

  @ApiProperty({ description: 'Цена до', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceTo?: number;

  @ApiProperty({ description: 'Минимальная цена', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  durationMin?: number;
}
