import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateCategoriesDto {
  @ApiProperty({ description: 'Название категории' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ description: 'URL-slug для SEO' })
  @IsString()
  @Length(2, 100)
  slug: string;

  @ApiProperty({ description: 'ID родительской категории', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'Порядок отображения', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
