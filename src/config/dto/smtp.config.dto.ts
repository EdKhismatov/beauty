import { IsString } from 'class-validator';

export class SmtpConfigDto {
  @IsString()
  user: string;

  @IsString()
  pass: string;

  @IsString()
  email: string;
}
