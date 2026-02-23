import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateServicesDto {
  @ApiProperty({ example: 'Мужская стрижка', description: 'Название услуги' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Название услуги не может быть пустым' })
  name?: string;

  @ApiPropertyOptional({ example: 'Стрижка машинкой и ножницами, мытье головы', description: 'Описание услуги' })
  @IsOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1500, description: 'Цена в рублях' })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price?: number;

  @ApiProperty({ example: 60, description: 'Длительность услуги в минутах' })
  @IsOptional()
  @IsInt()
  @Min(15, { message: 'Минимальная длительность услуги — 15 минут' })
  duration?: number;
}
