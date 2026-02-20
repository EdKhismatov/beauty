import { IsString } from 'class-validator';

export class JwtConfigDto {
  @IsString()
  accessSecret: string;

  @IsString()
  refreshSecret: string;
}
