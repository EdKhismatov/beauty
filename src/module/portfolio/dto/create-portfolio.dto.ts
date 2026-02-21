import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePortfolioDto {
  @ApiProperty({ example: 'Сделал крутую стрижку', description: 'Описание работы' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500) // Всегда ограничивай длину текста от спамеров!
  description: string;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Массив изображений товара/работы',
    required: false,
  })
  @IsArray()
  imageUrl?: string[];
}
