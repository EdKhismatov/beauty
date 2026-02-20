import { config as readEnv } from 'dotenv';
import * as process from 'node:process';
import { validate } from '../validation/validate.dto';
import { AppConfigDto } from './dto';

readEnv();

type EnvStructure<T = any> = {
  [key in keyof T]: T[key] extends object ? EnvStructure<T[key]> : string | undefined;
};

const rawConfig: EnvStructure<AppConfigDto> = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  rabbitUrl: process.env.RABBIT_URL,
  redisUrl: process.env.REDIS_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
  postgres: {
    host: process.env.POSTGRESQL_HOST,
    port: process.env.POSTGRESQL_PORT,
    username: process.env.POSTGRESQL_USERNAME,
    password: process.env.POSTGRESQL_PASSWORD,
    database: process.env.POSTGRESQL_DATABASE,
  },
  smtp: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    email: process.env.SMTP_EMAIL,
  },
  // minio: {
  //   minioPort: process.env.MINIO_PORT,
  //   minioConsolePort: process.env.MINIO_CONSOLE_PORT,
  //   minioUser: process.env.MINIO_USER,
  //   minioPassword: process.env.MINIO_PASSWORD,
  //   minioBucket: process.env.MINIO_BUCKET,
  // },
  // throttler: {
  //   throttlerTtl: process.env.THROTTLE_TTL,
  //   throttlerLimit: process.env.THROTTLE_LIMIT,
  // },
};

export const appConfig = validate(AppConfigDto, rawConfig);
