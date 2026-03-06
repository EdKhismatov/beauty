import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ description: '0=Пн, 1=Вт, 2=Ср, 3=Чт, 4=Пт, 5=Сб, 6=Вс' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @ApiProperty({ description: 'Начало рабочего дня' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime: string;

  @ApiProperty({ description: 'Конец рабочего дня' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime: string;

  @ApiProperty({ description: 'Шаг слотов в минутах' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  slotDuration?: number = 30;
}
