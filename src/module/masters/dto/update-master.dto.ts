import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Length, Max, Min } from 'class-validator';

export class UpdateMasterDto {
  @ApiProperty({ description: 'О себе' })
  @IsOptional()
  @IsString()
  @Length(10, 500)
  bio?: string;

  @ApiProperty({ description: 'Лет опыта' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  experienceYears?: number;

  @ApiProperty({ description: 'Адрес студии' })
  @IsOptional()
  @IsString()
  @Length(5, 200)
  address?: string;

  @ApiProperty({ description: 'Широта' })
  @IsOptional()
  @IsNumber()
  lat?: number;

  @ApiProperty({ description: 'Долгота' })
  @IsOptional()
  @IsNumber()
  lng?: number;

  @ApiProperty({ description: 'ID города' })
  @IsOptional()
  @IsUUID()
  cityId?: string;
}
