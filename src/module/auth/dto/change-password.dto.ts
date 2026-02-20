import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Length(6, 512)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @Length(6, 512)
  newPassword: string;
}
