import { IsEmail, IsString, Length } from 'class-validator';

export class RestorePasswordDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  keys: string;

  @IsString()
  @Length(6, 512)
  newPassword: string;
}
