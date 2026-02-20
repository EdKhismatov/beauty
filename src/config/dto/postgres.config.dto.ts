import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class PostgresConfigDto {
  @IsString()
  host: string;

  @IsString()
  database: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsNumber()
  @Type(() => Number)
  port: number;
}
