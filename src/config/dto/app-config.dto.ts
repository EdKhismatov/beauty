import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator';
import { JwtConfigDto, MinioDto, PostgresConfigDto, SmtpConfigDto } from './index';

export enum Environment {
  PROD = 'prod',
  DEV = 'dev',
}

export class AppConfigDto {
  @IsEnum(Environment)
  env: Environment;

  @IsNumber()
  @Type(() => Number)
  readonly port: number;

  @IsString()
  rabbitUrl: string;

  @IsString()
  redisUrl: string;

  @ValidateNested()
  @Type(() => JwtConfigDto)
  jwt: JwtConfigDto;

  @ValidateNested()
  @Type(() => PostgresConfigDto)
  postgres: PostgresConfigDto;

  @ValidateNested()
  @Type(() => SmtpConfigDto)
  smtp: SmtpConfigDto;

  @ValidateNested()
  @Type(() => MinioDto)
  minio: MinioDto;
  //
  // @ValidateNested()
  // @Type(() => ThrottlerDto)
  // throttler: ThrottlerDto;
}
