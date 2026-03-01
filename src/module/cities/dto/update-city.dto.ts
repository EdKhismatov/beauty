import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateCityDto {
  @ApiProperty({ description: 'Название города: Москва, Санкт-Петербург' })
  @IsString()
  @Length(2, 100)
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'URL slug: moscow, saint-petersburg' })
  @IsString()
  @Matches(/^[a-z\-]+$/, {
    message: 'Slug может содержать только строчные латинские буквы и дефис',
  })
  @IsOptional()
  slug?: string;

  @ApiProperty({ description: 'Регион: Московская область' })
  @IsString()
  @IsOptional() // регион необязателен
  region?: string;

  @ApiProperty({ description: 'Код страны: RU, KZ, BY' })
  @IsString()
  @Length(2, 2) // ровно 2 символа
  @IsOptional()
  countryCode?: string;

  @ApiProperty({ description: 'Широта' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lat?: number;

  @ApiProperty({ description: 'Долгота' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  lng?: number;
}
