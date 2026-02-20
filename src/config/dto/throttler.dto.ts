import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class ThrottlerDto {
  @Type(() => Number)
  @IsNumber()
  throttlerTtl: number;

  @Type(() => Number)
  @IsNumber()
  throttlerLimit: number;
}
