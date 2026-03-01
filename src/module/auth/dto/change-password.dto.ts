import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @Length(6, 512)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @Length(6, 512)
  newPassword: string;
}
