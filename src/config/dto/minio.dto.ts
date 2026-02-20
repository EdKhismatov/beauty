import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class MinioDto {
  @Type(() => Number)
  @IsNumber()
  minioPort: number;

  @Type(() => Number)
  @IsNumber()
  minioConsolePort: number;

  @IsString()
  minioUser: string;

  @IsString()
  minioPassword: string;

  @IsString()
  minioBucket: string;
}
