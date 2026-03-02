import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class UserUpdateDto {
  @ApiProperty({ description: 'Введите свое имя' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  declare name?: string;

  @ApiProperty({ description: 'ID города' })
  @IsOptional()
  @IsUUID()
  declare cityId?: string;
}
