import { Module } from '@nestjs/common';
import { REDIS, redisProvider } from './cache.provider';
import { RedisService } from './redis.service';

@Module({
  providers: [RedisService, redisProvider],
  exports: [RedisService, REDIS],
})
export class RedisModule {}
